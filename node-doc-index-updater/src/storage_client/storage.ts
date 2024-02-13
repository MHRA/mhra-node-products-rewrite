import {
    BlobClient, BlobDeleteIfExistsResponse,
    BlobDeleteOptions,
    BlobServiceClient,
    ContainerClient, DeleteSnapshotsOptionType,
    StorageSharedKeyCredential
} from "@azure/storage-blob";
import crypto, {createHash} from 'crypto';

export type StorageFile = {
    name: string,
    path: string
}

interface StorageClient {
    add_file(
      file_data: Buffer,
      licence_number: string,
      existing_path?: string
    ): Promise<StorageFile>;
    get_file(storageFile: StorageFile): Promise<Buffer>;
    append_to_file(fileName: string, body: Buffer): Promise<void>;
  }
export class AzureBlobStorage implements StorageClient {
    container_name: string;
    prefix: string;
    storage_account: string;
    master_key: string;
    blob_service_client: BlobServiceClient;

  constructor(
    container_name: string,
    prefix: string,
    storage_account: string,
    master_key: string
  ) {
    this.container_name = container_name;
    this.prefix = prefix;
    this.storage_account = storage_account;
    this.master_key = master_key;
    this.blob_service_client = this.get_azure_client();
  }

  /*
  Adds a file to the blob container client.
  */
  async add_file(file_data: Buffer,licence_number: string, job_id: string, existing_path?: string): Promise<StorageFile> {
    const file_digest = createHash("md5").update(file_data).digest();
    const file_name = this.get_file_name(licence_number, file_data);
    const name = existing_path != null && existing_path != "" ? `${this.prefix}${existing_path}` : `${this.prefix}${file_name}`;

    const container_client = this.blob_service_client.getContainerClient(this.container_name);
    const block_blob_client = container_client.getBlockBlobClient(name);
    const metadata_ref: Record<string, string> = {
      file_name: `spc-doc_PL ${licence_number}`,
      job_id: job_id,
    }; 
    try {
      console.log("File data buffer is ", file_data);
      
      await block_blob_client.uploadData(file_data, {
        blobHTTPHeaders: { blobContentType: "application/pdf", blobContentMD5: file_digest },
        metadata: metadata_ref
      });

      const path = `${this.blob_service_client.getContainerClient(this.container_name).url}/${name}`;
      return {
        name: name,
        path: path
      };

    } catch (e) {
      console.error(`Error uploading file to blob storage: ${e}`);
      throw new Error(`Couldn't create blob: ${e}`);
    }
    
  }
  
  // - Get blob by it's relevant name in the specified container name in azure blob storage.
  get_blob_by_name(blob_name : string) : BlobClient {
    const container_client = this.blob_service_client.getContainerClient(this.container_name);
    const container_exists = container_client.exists();
    if(!container_exists) return;
    return container_client.getBlobClient(blob_name);
  }
  
  // - Delete blob by reference. Used when un-indexing and deleting old documents.
  async delete_blob_by_reference(blob_client: BlobClient, delete_snapshot_options: DeleteSnapshotsOptionType) : Promise<BlobDeleteIfExistsResponse> {
    try {
      const options : BlobDeleteOptions = { deleteSnapshots: delete_snapshot_options }
      console.log(`Blob "${blob_client.name}" deleted successfully.`);
      return await blob_client.deleteIfExists(options);
    } catch (error) {
      console.error(`Error deleting blob "${blob_client.name}":`, error);
    }
    return null;
  }

  //gets a file from azure blob storage
  async get_file(storage_file: StorageFile): Promise<Buffer> {
    try {
      const response = await this.blob_service_client.getContainerClient(this.container_name)
        .getBlockBlobClient(storage_file.name)
        .download();
      return (await this.stream_to_buffer(response.readableStreamBody!)) as Buffer;
    } catch (e) {
      console.error(`Error retrieving file from blob storage: ${e}`);
      throw new Error(`Couldn't retrieve blob: ${e}`);
    }
  }

  //adds a new file to an existing blob of data in a container
  async append_to_file(fileName: string, body: Buffer): Promise<void> {
    try {
      await this.blob_service_client.getContainerClient(this.container_name).getAppendBlobClient(fileName).appendBlock(body, body.length);
    } catch (e) {
      console.error(`Error appending data to blob file: ${e}`);
      throw new Error(`Couldn't append data to blob file: ${e}`);
    }
  }

  // An instance of the a blob storage client that is linked to the temporary storage folder
  temporary(): AzureBlobStorage {
    const container_name = process.env.STORAGE_CONTAINER_TEMPORARY;
    const storage_account = process.env.STORAGE_ACCOUNT_TEMPORARY;
    const master_key = process.env.STORAGE_ACCOUNT_MASTER_KEY_TEMPORARY;

    return new AzureBlobStorage(container_name, "temp/", storage_account, master_key);
  }

  //An instance of the a blob storage client that is linked to the normal storage folder
  permanent(): AzureBlobStorage {
    const container_name = process.env.STORAGE_CONTAINER_TEMPORARY;
    const storage_account = process.env.STORAGE_ACCOUNT_TEMPORARY;
    const master_key = process.env.STORAGE_ACCOUNT_MASTER_KEY_TEMPORARY;
   
    return new AzureBlobStorage(container_name, "", storage_account, master_key);
  }

  //Logger
  log(): AzureBlobStorage {
    const container_name = process.env.LOG_STORAGE_CONTAINER!;
    const storage_account = process.env.LOG_STORAGE_ACCOUNT!;
    const master_key = process.env.LOG_STORAGE_MASTER_KEY!;

    return new AzureBlobStorage(container_name, "", storage_account, master_key);
  }

  get_azure_client(): BlobServiceClient {
    return new BlobServiceClient(
      `https://${this.storage_account}.blob.core.windows.net`,
      new StorageSharedKeyCredential(this.storage_account, this.master_key)
    );
    
  }

  async stream_to_buffer(readable_stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      readable_stream.on("data", (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readable_stream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      readable_stream.on("error", reject);
    });
  }

  /*
  * Generates a file name to call the blob in azure. This is based on a hash of the license_number.
  */
  get_file_name(license_number: string, file_data: Buffer): string {
    const hash = crypto.createHash('sha1');
    hash.update(license_number);
    hash.update(file_data);
    return hash.digest('hex');
  }

}