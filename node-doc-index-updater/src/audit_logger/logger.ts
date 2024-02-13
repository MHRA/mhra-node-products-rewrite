import { AppendBlobClient, BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { format } from 'util';

  interface LogTransaction {
    log_transaction<T>(blob_name: string, log_contents: T): Promise<void>;
  }
  
  export class AuditLogger implements LogTransaction {
    private log_storage_client: AppendBlobClient;

    constructor(log_storage_client?: AppendBlobClient) {
      const storage_creds = create_storage_credential(process.env.STORAGE_ACCOUNT_TEMPORARY,process.env.STORAGE_ACCOUNT_MASTER_KEY_TEMPORARY);
      const blob_service_client = create_blob_service_client(storage_creds,process.env.LOG_STORAGE_ACCOUNT);
      this.log_storage_client = create_append_client(blob_service_client, process.env.LOG_STORAGE_CONTAINER_NAME,"");
    }

    async log_transaction<T>(blob_name: string, log_contents: T){
      const date_time_now = new Date();
      const file_name = get_log_file_name(date_time_now);
      const body = get_log_body(blob_name, log_contents, date_time_now);
      try {
        //Rather than specifically creating a new blob, append to previous block data.
        await this.log_storage_client.appendBlock(body, body.length);
      } catch (e) {
        console.error(`Error appending to blob: ${e}`);
        throw new Error("Error appending to blob");
      }
    }
  }

  function get_log_body<T>(blob_name: string, log_contents: T, datetime_now: Date): string {
    return `${blob_name},${format(datetime_now, "yyyy-MM-dd HH:mm:ss")},${JSON.stringify(
      log_contents
    )}\n`;
  }
  
  function get_log_file_name(date: Date): string {
    return format(date, "file-change-log-yyyy-MM");
  }

    /*
        Creates a blob service account against the specified account name
    */
    function create_blob_service_client(creds: StorageSharedKeyCredential, account_name: string): BlobServiceClient {
      const blog_service_client = new BlobServiceClient(
            `https://${account_name}.blob.core.windows.net`,
            creds
            );
      return blog_service_client;
    }
    
    function create_append_client(blob_service_client:BlobServiceClient, 
      container_name: string, blob_name: string) : AppendBlobClient {
      // Get a container client
      const container_client = blob_service_client.getContainerClient(container_name);

      // Get an AppendBlobClient
      return container_client.getAppendBlobClient(blob_name);
    }

    /*
        Creates storage credentials against the specified account and 
    */
    function create_storage_credential(account_name: string, account_key:string) : StorageSharedKeyCredential {
        return new StorageSharedKeyCredential(account_name,account_key);
    }