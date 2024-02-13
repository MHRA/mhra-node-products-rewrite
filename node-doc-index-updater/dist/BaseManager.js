import { AzureServiceBusClient } from "./service_bus_client/service_bus.js";
//Cant unit test Abstract class
export class BaseManager {
    constructor(service_bus_queue_name) {
        this.queue_name = service_bus_queue_name;
        this.azure_service_bus = new AzureServiceBusClient("nibsc-test", service_bus_queue_name, "test", "Kk6B1Td18uhGreZh2l7NVfAgnGyaBmusz+ASbDzDnH8=");
    }
    async receive_queue_messages() {
        const message_count = await this.azure_service_bus.check_queue_message_count(this.queue_name);
        if (message_count > 0) {
            return await this.azure_service_bus.receive_message(this.queue_name, message_count);
        }
        return Array.of();
    }
    //TODO: test azure config -> replace and load from ENV
    get_test_azure_config() {
        return {
            search_service: "mhraproductsnonprod",
            search_index: "products-index",
            api_version: "2017-11-11",
            api_key: "04EA4519A7D4C180087C78C15E254486"
        };
    }
    async run_queue_cleanup() {
        //check the dead letter queue
        const dlq_receiver = this.azure_service_bus.create_receiver(this.queue_name, "deadLetter");
        const dlq_sender = this.azure_service_bus.create_sender(this.queue_name);
        const message_count = await this.azure_service_bus.check_queue_message_count(this.queue_name, true);
        try {
            //Try and process any messages we find
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
            await dlq_receiver.close();
            await dlq_sender.close();
            await this.azure_service_bus.client.close();
        }
    }
}
