import {AuditLogger} from "../audit_logger/logger.js";
import {JobStatusClient} from "../state_manager/state.js";
import {SearchIndex} from "../search.js";
import {AzureBlobStorage} from "../storage_client/storage.js";
import {CreateMessage, IndexEntry, JobStatus, UpdateIndexType} from "../types.js";
import {ServiceBusManager} from "../ServiceBusManager.js";

export class CreateManager extends ServiceBusManager {
    
    transaction_logger!: AuditLogger;
    state_manager!: JobStatusClient;
    search_index: SearchIndex;
    audit_logger: AuditLogger;
    azure_storage: AzureBlobStorage;

    constructor() {
        super(process.env.CREATE_QUEUE_NAME);
        this.transaction_logger = new AuditLogger();
        this.search_index = new SearchIndex();
        this.azure_storage = new AzureBlobStorage(process.env.STORAGE_CONTAINER_TEMPORARY, "", process.env.STORAGE_ACCOUNT_TEMPORARY, process.env.STORAGE_MASTER_KEY_TEMPORARY);
        this.audit_logger = new AuditLogger();
        this.state_manager = new JobStatusClient();
    }

    // Runs the create queue
    async run_create_queue() : Promise<void> {

        const container_client = this.azure_storage.blob_service_client.getContainerClient(process.env.STORAGE_CONTAINER_TEMPORARY);
        const message_count = await this.azure_service_bus.check_queue_message_count(process.env.CREATE_QUEUE_NAME);

        // We only want to receive the queue messages if there are available messages to process
        if(message_count > 0){
            const received_messages = await this.receive_queue_messages<CreateMessage>();
            const documents = new Array<IndexEntry>();
            const currentDate = new Date();
            //Edm.DateTimeOffset OData format
            const currentUTC = currentDate.toISOString();

            for (const message of received_messages) {
                const update_message_type = message.type == "UPDATE";  
                //if we are processing a message update - we need to update the relevant fields, i.e. uploaded pdf, product name, substances etc
                //We need the original file path to know which file to delete from blob storage
                if(update_message_type && message.blob_update_path && message.original_job_id){
                    // delete current item from search index - the name of this is represented job id which is the metadata_storage_name field
                    const update_index_result = await this.search_index.update_index([message.original_job_id], this.get_azure_config(), UpdateIndexType.DELETE);
                }

                const source_blob_path = message.blob_update_path != null && message.blob_update_path != "" ? "temp/"+message.blob_update_path : message.document.file_path;
                // Get a reference to the source blob
                const source_blob = container_client.getBlockBlobClient(source_blob_path);

                const dest_blob_path = source_blob_path.replace("temp/","");

                //reference to new destination blob
                const dest_blob = container_client.getBlockBlobClient(dest_blob_path);

                // Copy the source blob to the destination blob
                const copy_result = await dest_blob.beginCopyFromURL(source_blob.url);

                const full_blob_path = `https://${process.env.STORAGE_ACCOUNT_TEMPORARY}.blob.core.windows.net/${process.env.STORAGE_CONTAINER_TEMPORARY}/${dest_blob_path}`;
                const blob_properties = await dest_blob.getProperties();

                const index_entry: IndexEntry = {
                    content: message.document.name,
                    rev_label: "1",
                    metadata_storage_path: full_blob_path,
                    metadata_content_type: "",
                    product_name: message.document.products[0],
                    metadata_language: "",
                    created: currentUTC,
                    release_state: "",
                    keywords: "",
                    title: message.document.name,
                    pl_number: [message.document.pl_number],
                    file_name: full_blob_path,
                    metadata_storage_content_type: "PDF",
                    metadata_storage_size: blob_properties.contentLength,
                    metadata_storage_last_modified: currentUTC,
                    metadata_storage_content_md5: "",
                    metadata_storage_name: message.job_id,
                    doc_type: message.document.doc_type,
                    suggestions: new Array<string>(),
                    substance_name: message.document.active_substances,
                    facets: new Array<string>()
                };

                //azure search service library requires Array<T>
                documents.push(index_entry);

                // Set the status of the processed message to be done in redis.
                try {
                    const status : JobStatus = { kind: "Done" };
                    // Update redis
                    await this.state_manager.set_status(message.job_id, status)
                    // Log the transaction
                    //await this.audit_logger.log_transaction<CreateMessage>(source_blob.name, message);

                } catch(error){
                    console.error(`Error is ${error}`)
                }
            }

            if(documents.length > 0) {
                //Index the new documents in the Azure Search Index.
                await this.search_index.update_index(documents, this.get_azure_config(), UpdateIndexType.UPLOAD);
            }
        }

    }

}