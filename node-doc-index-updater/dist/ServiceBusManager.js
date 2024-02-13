import { AzureServiceBusClient } from "./service_bus_client/service_bus.js";
/*
 * An abstract class responsible for receiving and processing service bus messages against a specified queue.
 * Implementing classes need to pass the relevant queue name and AzureServiceBusClient to its base constructor.
 */
export class ServiceBusManager {
    /**
     * Constructor for the ServiceBusManager class.
     *
     * @param service_bus_queue_name The name of the service bus queue to manage.
     */
    constructor(service_bus_queue_name) {
        this.queue_name = service_bus_queue_name;
        // Create an instance of AzureServiceBusClient with the provided credentials and queue name
        //TODO
        this.azure_service_bus = new AzureServiceBusClient(process.env.SERVICE_BUS_CLIENT_NAME, service_bus_queue_name, "test", process.env.SERVICE_BUS_CLIENT_KEY);
    }
    /**
     * Asynchronously receives messages from the queue and completes them if any are available.
     *
     * @returns A Promise that resolves to an array of received messages.
     */
    async receive_queue_messages() {
        // Check the message count in the queue
        const message_count = await this.azure_service_bus.check_queue_message_count(this.queue_name);
        console.log("Message count in receive_queue_messages is ", message_count);
        if (message_count > 0) {
            // Complete and return the received messages
            return await this.azure_service_bus.complete_messages(this.queue_name, message_count);
        }
        // Return an empty array if no messages are available
        return new Array();
    }
    /**
     * Loads Azure configuration settings from the environment variables.
     *
     * @returns An object containing Azure configuration settings.
     */
    get_azure_config() {
        return {
            search_service: process.env.SEARCH_SERVICE,
            search_index: process.env.AZURE_SEARCH_INDEX,
            api_version: process.env.AZURE_SEARCH_API_VERSION,
            api_key: process.env.AZURE_SEARCH_SERVICE_API_KEY
        };
    }
    /**
     * Runs cleanup operations on the queue, including processing messages from the dead letter queue.
     *
     * @returns A Promise that resolves when the cleanup process is complete.
     */
    async run_queue_cleanup() {
        // Check the dead letter queue
        const dlq_receiver = this.azure_service_bus.create_receiver(this.queue_name, "deadLetter");
        const dlq_sender = this.azure_service_bus.create_sender(this.queue_name);
        const message_count = await this.azure_service_bus.check_queue_message_count(this.queue_name, true);
        try {
            // Try and process any messages found in the dead letter queue
            const messages = await dlq_receiver.receiveMessages(message_count);
            for (const message of messages) {
                await dlq_sender.sendMessages({ body: message.body });
                await dlq_receiver.completeMessage(message);
            }
        }
        catch (error) {
            console.error(`Error when running queue cleanup ${error}`);
        }
        finally {
            // Close receivers, senders, and the AzureServiceBusClient
            await dlq_receiver.close();
            await dlq_sender.close();
            await this.azure_service_bus.client.close();
        }
    }
}
