import { JobStatusClient } from "../state_manager/state.js";
import { v4 as uuidv4 } from 'uuid';
import { AzureServiceBusClient } from "../service_bus_client/service_bus.js";
export class DocumentManager {
    constructor() {
        this.client = new JobStatusClient();
        this.azure_service_bus_client = new AzureServiceBusClient(process.env.SERVICE_BUS_NAMESPACE, process.env.CREATE_QUEUE_NAME, process.env.SERVICE_BUS_SHARED_ACCESS_KEY_NAME, process.env.SERVICE_BUS_SHARED_ACCESS_KEY);
    }
    // Checks in an XML document into redis and adds to the queue
    async check_in_xml_document(document, type, blob_update_path, uploader_email, original_job_id) {
        // Accept the job and pass in a status of JobStatus -> Accepted
        let job_response = await this.accept_job();
        // Create message - this queue processes new uploads or updates.
        // An update will require the document properties to be replaced but keep the same URL structure etc.
        const create_message = {
            job_id: job_response.id,
            document: document,
            type: type,
            blob_update_path: blob_update_path,
        };
        // we need to know the original job id if we are updating a PARS document, which is referenced by its original job id.
        if (type == "UPDATE" && original_job_id) {
            create_message.original_job_id = original_job_id;
        }
        // Specify which queue to use
        const queue = {
            service_bus: this.azure_service_bus_client.client,
            lock_timeout: "10",
            name: process.env.CREATE_QUEUE_NAME
        };
        // Queue the job
        await this.queue_job(queue, create_message);
    }
    /*
        Queue's a job
    */
    async queue_job(queue, message) {
        //queue the job
        await this.azure_service_bus_client.send_message_to_queue(queue.name, message);
    }
    /*
        Accepts a job and returns a job id for tracking
    */
    async accept_job() {
        //Create a job id
        const id = uuidv4();
        console.log("Generated ID of accepted job", id);
        const job_status = { kind: "Accepted" };
        return this.client.set_status(id, job_status);
    }
}
