import { delay, isServiceBusError, ServiceBusAdministrationClient, ServiceBusClient } from "@azure/service-bus";
import { AzureNamedKeyCredential } from "@azure/core-auth";
export class AzureServiceBusClient {
    constructor(service_bus_namespace, queue_name, sas_policy_name, sas_key) {
        this.service_bus_endpoint = service_bus_namespace != null ? `${service_bus_namespace}.servicebus.windows.net`
            : "nibsc-test.servicebus.windows.net"; //doc-index-updater-non-prod.servicebus.windows.net
        this.queue_name = queue_name != null ? queue_name : "doc-index-updater-create-queue";
        this.sas_policy_name = sas_policy_name != null ? sas_policy_name : "test-policy"; //doc-index-updater-create-auth
        this.sas_key = sas_key != null ? sas_key : "Kk6B1Td18uhGreZh2l7NVfAgnGyaBmusz+ASbDzDnH8="; //sdD4wqK21AVXtIkj+u5am4sqaMJneydT7ntSgQCs3II= - Kk6B1Td18uhGreZh2l7NVfAgnGyaBmusz+ASbDzDnH8= (create) : /mqxSTbJXGwk1aZb9SNAXTcqhf7+olt1J+ASbPMG/Dg= (delete)
        this.client = this.create_client();
    }
    /*
        Create a reference to an Azure ServiceBusClient from key credentials
    */
    create_client() {
        const key_credentials = new AzureNamedKeyCredential(this.sas_policy_name, this.sas_key);
        return new ServiceBusClient(this.service_bus_endpoint, key_credentials);
    }
    new(client) {
        let lock_timeout = process.env.SERVICE_BUS_MESSAGE_LOCK_TIMEOUT;
        return { service_bus: this.client, lock_timeout: lock_timeout };
    }
    /*
        Create's a server bus sender against the specified queue.
    */
    create_sender(queue) {
        return this.client.createSender(queue);
    }
    /*
        Create a receiver that can receive messages. Optionally specify a sub_queue type.
    */
    create_receiver(queue, sub_queue) {
        return sub_queue != null ? this.client.createReceiver(queue)
            : this.client.createReceiver(queue, { subQueueType: sub_queue });
    }
    /*
        Sends a message to the specified queue, with an option ttl
    */
    async send_message_to_queue(queue, message, ttl) {
        try {
            this.client = this.create_client();
            const sender = this.create_sender(queue);
            if (ttl == null || ttl == 0) {
                await sender.sendMessages({ body: message });
            }
            else {
                await sender.sendMessages({ body: message, timeToLive: ttl });
            }
            await sender.close();
        }
        catch (error) {
            console.error(`Error sending message to queue ${error} for message ${message} and ttl ${ttl}`);
        }
        finally {
            await this.client.close();
        }
    }
    /*
        Completes a specified amount of messages from the associated queue
    */
    async complete_messages(queue, message_count) {
        const processed_messages = new Array();
        await this.client.close();
        this.client = this.create_client();
        const receiver = this.create_receiver(queue);
        try {
            const messages = await receiver.receiveMessages(message_count);
            if (messages.length === 0) {
                return processed_messages;
            }
            for (const message of messages) {
                try {
                    const created_document = message.body;
                    processed_messages.push(created_document);
                    await receiver.completeMessage(message);
                }
                catch (error) {
                    // Could not process message to the DLQ. Cron job that processes the DLQ will move back to relevant processing queue (create/delete).
                    await receiver.deadLetterMessage(message);
                }
            }
        }
        catch (error) {
            console.error(`Error receiving messages: ${error}`);
        }
        finally {
            await receiver.close();
            await this.client.close();
        }
        console.log("Message count length is ", processed_messages.length);
        return processed_messages;
    }
    /*
        Checks the total amount of messages in a specific queue
    */
    async check_queue_message_count(queue, dlq) {
        const queue_service_endpoint = queue == process.env.CREATE_QUEUE_NAME ? process.env.SERVICE_BUS_CREATE_ENDPOINT : process.env.SERVICE_BUS_DELETE_ENDPOINT;
        const create_queue_admin_client = new ServiceBusAdministrationClient(queue_service_endpoint);
        const runtime_properties = await create_queue_admin_client.getQueueRuntimeProperties(queue);
        return dlq ? runtime_properties.deadLetterMessageCount : runtime_properties.activeMessageCount;
    }
    /*
        Receives azure service messages in a stream until the stream is closed (not technically used in app but was useful for testing)
    */
    async stream_messages(queue) {
        console.log("Ran queue is ", queue);
        const receiver = this.create_receiver(queue);
        try {
            const subscription = receiver.subscribe({
                // After executing this callback you provide, the receiver will remove the message from the queue if you
                // have not already settled the message in your callback.
                // You can disable this by passing `false` to the `autoCompleteMessages` option in the `subscribe()` method.
                // If your callback _does_ throw an error before the message is settled, then it will be abandoned.
                processMessage: async (brokeredMessage) => {
                    console.log(`Received message: ${brokeredMessage.body}`);
                },
                // This callback will be called for any error that occurs when either in the receiver when receiving the message
                // or when executing your `processMessage` callback or when the receiver automatically completes or abandons the message.
                processError: async (args) => {
                    console.log(`Error from source ${args.errorSource} occurred: `, args.error);
                    // the `subscribe() call will not stop trying to receive messages without explicit intervention from you.
                    if (isServiceBusError(args.error)) {
                        switch (args.error.code) {
                            case "MessagingEntityDisabled":
                            case "MessagingEntityNotFound":
                            case "UnauthorizedAccess":
                                // It's possible you have a temporary infrastructure change (for instance, the entity being
                                // temporarily disabled). The handler will continue to retry if `close()` is not called on the subscription - it is completely up to you
                                // what is considered fatal for your program.
                                console.log(`An unrecoverable error occurred. Stopping processing. ${args.error.code}`, args.error);
                                await subscription.close();
                                break;
                            case "MessageLockLost":
                                console.log(`Message lock lost for message`, args.error);
                                break;
                            case "ServiceBusy":
                                // choosing an arbitrary amount of time to wait.
                                await delay(1000);
                                break;
                        }
                    }
                },
            });
            // Waiting long enough before closing the receiver to receive messages
            console.log(`Receiving messages for 10 seconds before exiting...`);
            await delay(10000);
            console.log(`Closing...`);
            await receiver.close();
        }
        finally {
            await this.client.close();
        }
    }
}
