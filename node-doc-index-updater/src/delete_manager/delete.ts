import { ServiceBusManager } from '../ServiceBusManager.js';
import { SearchIndex } from '../search.js';
import { DeleteMessage, DocIndexUpdaterQueue, UpdateIndexType } from '../types.js';
import { JobStatusClient } from '../state_manager/state.js';
import { AzureBlobStorage } from '../storage_client/storage.js';
import { AzureServiceBusClient } from '../service_bus_client/service_bus.js';

/**
 * Manages the deletion of documents using Azure Service Bus.
 * Inherits from ServiceBusManager.
 */
export class DeleteManager extends ServiceBusManager {
    /**
     * Instance of JobStatusClient for managing job status.
     */
    state_manager: JobStatusClient;

    /**
     * Instance of AzureBlobStorage for interacting with Azure Blob Storage.
     */
    storage_client: AzureBlobStorage;

    /**
     * Instance of SearchIndex for updating the search index.
     */
    search_index: SearchIndex;

    /**
     * Instance of AzureServiceBusClient for interacting with Azure Service Bus.
     */
    azure_service_bus_client: AzureServiceBusClient;

    /**
     * Creates an instance of DeleteManager.
     */
    constructor() {
        super(process.env.DELETE_QUEUE_NAME);
        this.state_manager = new JobStatusClient();
        this.storage_client = new AzureBlobStorage(
            process.env.STORAGE_CONTAINER_TEMPORARY,
            '',
            process.env.STORAGE_ACCOUNT_TEMPORARY,
            process.env.STORAGE_MASTER_KEY_TEMPORARY
        );
        this.search_index = new SearchIndex();
        this.azure_service_bus_client = new AzureServiceBusClient(
            process.env.SERVICE_BUS_NAMESPACE,
            process.env.DELETE_QUEUE_NAME,
            process.env.SERVICE_BUS_SHARED_ACCESS_KEY_NAME,
            process.env.SERVICE_BUS_DELETE_ACCESS_KEY
        );
    }

    /**
     * Checks in a delete request to be queued.
     * @param {string} initiator_email - Initiator's email.
     * @param {string} document_id - ID of the document to be deleted.
     * @returns {Promise<string>} - Resolves to the job ID.
     */
    async check_in_delete_request(initiator_email: string, document_id: string): Promise<string> {
        try {
            const job = await this.state_manager.accept_job();

            // Create delete message reference
            const message: DeleteMessage = {
                document_id: document_id,
                job_id: job.id,
                initiator_email: initiator_email,
            };

            // Send message to Azure Service Bus
            await this.azure_service_bus_client.send_message_to_queue(process.env.DELETE_QUEUE_NAME, message);

            // Job ID
            return job.id;
        } catch (error) {
            console.log(`Error queue delete request ${error}`);
        }

        return '';
    }

    /**
     * Runs the delete queue, deleting documents from Blob Storage and the search index.
     * @returns {Promise<void>} - Resolves once deletion is complete.
     */
    async run_delete_queue(): Promise<void> {
        // Receive any messages in the delete queue
        const received_messages = await this.receive_queue_messages<DeleteMessage>();

        // For each message -> delete from blob storage -> delete from search index
        const document_ids = received_messages.map((x) => x.document_id);

        for (const message of received_messages) {
            const live_blob = this.storage_client.get_blob_by_name(message.document_id);
            const temp_blob = this.storage_client.get_blob_by_name('temp/' + message.document_id);

            await this.storage_client.delete_blob_by_reference(temp_blob, 'only');
            await this.storage_client.delete_blob_by_reference(live_blob, 'only');

            await this.search_index.update_index(document_ids, this.get_azure_config(), UpdateIndexType.DELETE);
        }
    }
}
