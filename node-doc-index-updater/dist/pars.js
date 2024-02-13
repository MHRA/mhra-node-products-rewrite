import { AzureBlobStorage } from "./storage_client/storage.js";
import { DocumentType, FileSource, } from "./types.js";
import { JobStatusClient } from "./state_manager/state.js";
import { DocumentManager } from "./document_manager/document.js";
export class ParsService {
    constructor() {
        this.blob_client = new AzureBlobStorage(process.env.STORAGE_CONTAINER_TEMPORARY, "", process.env.STORAGE_ACCOUNT_TEMPORARY, process.env.STORAGE_MASTER_KEY_TEMPORARY);
        this.state_manager = new JobStatusClient();
        this.document_manager = new DocumentManager();
    }
    /**
     * Asynchronously queues a PARS upload by processing the provided form data, file buffer,
     * and uploader's email. Reads PARS upload data, accepts jobs from the state manager,
     * adds files to temporary blob storage, converts documents, and checks them in.
     *
     * @param form_data Parsed form data containing information about the upload.
     * @param file_buffer Buffer containing the file data to be processed.
     * @param uploader_email Email of the uploader responsible for the PARS upload.
     * @returns A Promise that resolves to an array of job IDs generated during the process.
     */
    async queue_pars_upload(form_data, file_buffer, uploader_email) {
        // Read PARS upload data, including metadata and file data
        const pars_upload = await this.read_pars_upload(form_data);
        const metadata = pars_upload[0];
        const file_data = pars_upload[1];
        // Array to store generated job IDs
        const job_ids = new Array(metadata.length);
        // Process each metadata entry
        for (const data of metadata) {
            // Accept a job from the state manager
            let job = await this.state_manager.accept_job();
            job_ids.push(job.id);
            // Add the actual file to temporary blob storage
            // The file will then be processed by the cron manager
            let storage_file = await this.add_file_to_temporary_blob_storage(job.id, file_buffer, data.pl_number);
            // Convert the document from the temporary storage file and check it in
            let document = this.get_document_from_form_data(storage_file, data);
            await this.document_manager.check_in_xml_document(document, "CREATE", "", uploader_email);
        }
        // Return the array of generated job IDs
        return job_ids;
    }
    // Queue pars update
    async queue_pars_update(form_data, file_buffer, uploader_email, blobId) {
        const new_pars_upload = await this.read_pars_upload(form_data);
        const metadata = new_pars_upload[0];
        // const file_data = new_pars_upload[1];
        //  const job = await this.state_manager.accept_job();
        //upload new blob with same name
        const job_ids = new Array(metadata.length);
        const storage_client = this.blob_client.temporary();
        const old_blob_reference = storage_client.get_blob_by_name(blobId);
        const old_blob_properties = await old_blob_reference.getProperties();
        let old_blob_job_id = '';
        if (old_blob_properties != null) {
            old_blob_job_id = old_blob_properties.metadata.job_id;
        }
        //delete old test blob
        await storage_client.delete_blob_by_reference(old_blob_reference, "include");
        for (const data of metadata) {
            let job = await this.state_manager.accept_job();
            job_ids.push(job.id);
            //add the potentially updated temp file to our "temporary blob storage", which will then be processed by our cron manager
            let storage_file = await this.add_file_to_temporary_blob_storage(job.id, file_buffer, data.pl_number, blobId);
            //Convert the document
            let document = this.get_document_from_form_data(storage_file, data);
            await this.document_manager.check_in_xml_document(document, "UPDATE", blobId, uploader_email, old_blob_job_id);
        }
        return job_ids;
    }
    //Simple mapper to get a Document object
    get_document_from_form_data(storage_file, metadata) {
        return {
            id: metadata.file_name,
            name: metadata.title,
            doc_type: DocumentType.Par,
            author: metadata.author,
            products: metadata.product_names,
            keywords: metadata.keywords,
            pl_number: metadata.pl_number,
            territory_type: metadata.territory,
            active_substances: metadata.active_substances,
            file_source: FileSource.TemporaryAzureBlobStorage,
            file_path: storage_file.name,
        };
    }
    /**
     * Asynchronously adds a file to the temporary blob storage associated with a specific job.
     *
     * @param job_id The identifier of the job associated with the temporary blob storage.
     * @param file_data Buffer containing the file data to be added to storage.
     * @param licence_number The license number associated with the file.
     * @returns A Promise that resolves to a StorageFile representing the added file in temporary storage.
     */
    async add_file_to_temporary_blob_storage(job_id, file_data, licence_number, existing_temp_blob) {
        // Obtain the temporary blob storage client
        let storage_client = this.blob_client.temporary();
        // Add the file to temporary blob storage and return the resulting StorageFile
        return await storage_client.add_file(file_data, licence_number, job_id, existing_temp_blob);
    }
    /**
     * Asynchronously adds a file to the permanent blob storage associated with a specific job.
     *
     * @param job_id The identifier of the job associated with the permanent blob storage.
     * @param file_data Uint8Array containing the file data to be added to storage.
     * @param licence_number The license number associated with the file.
     * @returns A Promise that resolves to a StorageFile representing the added file in permanent storage.
     */
    async add_file_to_permanent_blob_storage(job_id, file_data, licence_number) {
        // Obtain the permanent blob storage client
        let storage_client = this.blob_client.permanent();
        // Convert the Uint8Array file data to a Buffer and add the file to permanent blob storage
        // Return the resulting StorageFile
        const file_data_buffer = Buffer.from(file_data);
        return await storage_client.add_file(file_data_buffer, licence_number, job_id);
    }
    /**
     * Groups an array of Field objects by product, extracting product-related fields into separate groups.
     * Additionally, identifies and extracts the file field information.
     *
     * @param fields An array of Field objects containing form data.
     * @returns An object with grouped product fields, file field name, and file data buffer.
     */
    groups_fields_by_product(fields) {
        // Initialize arrays to store grouped product fields and the file field
        let products = [];
        let file_field = null;
        // Iterate through each field in the provided array
        for (const field of fields) {
            // Identify and set the file field if found
            if (field.name === "file") {
                file_field = field;
                continue;
            }
            // Check if the current field is related to a new product and initialize a new group if so
            if (field.name === "product_name") {
                products.push([]);
            }
            // Retrieve the last product group and add the current field to it
            const group = products[products.length - 1];
            if (group) {
                group.push(field);
            }
            else {
                // If there is no existing group, create a new one with the current field
                products.push([field]);
            }
        }
        // Extract the file field name and file data buffer (defaulting to empty values if not found)
        const file_name = file_field?.name ?? "";
        const file_data = Buffer.from(file_field?.value ?? "");
        // Return an object containing the grouped product fields, file field name, and file data buffer
        return { products, file_name, file_data };
    }
    /**
     * Extracts the value of a specific field from an array of Field objects,
     * converts it to uppercase, and returns the result.
     *
     * @param fields An array of Field objects containing form data.
     * @param name The name of the field whose value needs to be extracted.
     * @returns The uppercase string value of the specified field, or null if the field is not found.
     */
    get_field_as_uppercase_string(fields, name) {
        // Find the field with the specified name and convert its value to uppercase
        return (fields.find((field) => field.name === name)?.value.toUpperCase() ?? null);
    }
    /**
     * Converts product form data to BlobMetadata, representing information about a PARS document.
     * Extracts relevant fields such as product name, title, PL number, active substances, territory, and author.
     *
     * @param file_name The name of the file associated with the BlobMetadata.
     * @param fields An array of Field objects containing the form data related to the product.
     * @returns BlobMetadata representing the PARS document or null if essential information is missing.
     */
    product_form_data_to_blob_metadata(file_name, fields) {
        // Extract product name from the form data and ensure it exists
        const product_name = this.get_field_as_uppercase_string(fields, "product_name");
        if (!product_name)
            return null;
        // Initialize product names array with the extracted product name
        const product_names = [product_name];
        // Extract title from the form data and ensure it exists
        const title = this.get_field_as_uppercase_string(fields, "title");
        if (!title)
            return null;
        // Extract PL number from the form data and ensure it exists
        const pl_number = this.get_field_as_uppercase_string(fields, "licence_number");
        if (!pl_number)
            return null;
        // Extract active substances from the form data and convert to uppercase
        const active_substances = fields
            .filter((field) => field.name === "active_substance")
            .map((field) => field.value.toUpperCase());
        // Extract territory from the form data and convert to uppercase
        const territory = fields
            .find((field) => field.name === "territory")
            ?.value.toUpperCase();
        // Initialize author as an empty string for now
        const author = "";
        // Return BlobMetadata with the extracted information
        return {
            file_name,
            doc_type: DocumentType.Par,
            title,
            pl_number,
            territory,
            product_names,
            active_substances,
            author,
            keywords: undefined,
        };
    }
    /**
     * Asynchronously reads and processes parsed upload form data.
     * Extracts fields, groups them by product, converts product data to BlobMetadata,
     * and returns an array containing the BlobMetadata and the file data buffer.
     *
     * @param form_data Parsed form data containing information about the upload.
     * @returns A Promise that resolves to a tuple of BlobMetadata array and file data buffer.
     */
    async read_pars_upload(form_data) {
        // Extract fields from the form data
        const fields = this.get_fields_from_form_data(form_data);
        // Group fields by product
        const { products, file_name, file_data } = this.groups_fields_by_product(fields);
        // Convert product form data to BlobMetadata and filter out null values
        const metadata = products
            .map((fields) => this.product_form_data_to_blob_metadata(file_name, fields))
            .filter((metadata) => metadata !== null);
        // Return the metadata and file data
        return [metadata, file_data];
    }
    /**
     * Extracts fields from the provided form data and converts them into an array of Field objects.
     *
     * @param form_data Parsed form data containing information about the upload.
     * @returns An array of Field objects representing the extracted fields.
     */
    get_fields_from_form_data(form_data) {
        const fields = [];
        for (const [name, value] of Object.entries(form_data)) {
            // Convert each key-value pair in the form data to a Field object
            fields.push({
                name,
                value: value.toString(),
                type: "text",
            });
        }
        return fields;
    }
}
