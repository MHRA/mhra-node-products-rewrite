import { ServiceBusClient } from "@azure/service-bus";
export interface IndexEntry {
    content: string;
    rev_label: string;
    metadata_storage_path: string;
    metadata_content_type: string;
    product_name: string;
    metadata_language: string;
    created: string;
    release_state: string;
    keywords: string;
    title: string;
    pl_number: string[];
    territory?: TerritoryType;
    file_name: string;
    metadata_storage_content_type: string;
    metadata_storage_size: number;
    metadata_storage_last_modified: string;
    metadata_storage_content_md5: string;
    metadata_storage_name: string;
    doc_type: DocumentType;
    suggestions: string[];
    substance_name: string[];
    facets: string[];
  }

export type DocIndexUpdaterQueue = {
    service_bus: ServiceBusClient,
    lock_timeout?: string,
    name?: string
}

export interface SftpConfig {
    server: String,
    user: String,
    public_key_path: String,
    private_key_path: String,
    private_key_password: String,
}

export enum DocumentIndexRequestType {
    UPLOAD = 'UPLOAD',
    DELETE = 'DELETE'
}

export enum DocumentType {
    Par = 'PAR',
    Pil = 'PIL',
    Spc = 'SPC'
  }

export enum TerritoryType {
    Gb = 'GB',
    Ni = 'NI',
    Uk = 'UK'
}

export enum UpdateIndexType {
    DELETE = 'DELETE',
    UPLOAD = 'UPLOAD'
}

export enum FileSource {
    Sentinel = 'sentinel',
    TemporaryAzureBlobStorage = 'TemporaryAzureBlobStorage',
}

export interface BlobMetadata {
    file_name: string;
    doc_type: DocumentType;
    title: string;
    pl_number: string;
    territory?: TerritoryType;
    product_names: Array<string>;
    active_substances: Array<string>;
    author: string;
    keywords?: Array<string>;
}

export interface Document {
    __typename?: 'Document';
    id: string;
    name: string;
    doc_type?: DocumentType;
    author: string;
    products: Array<string>;
    keywords: Array<string>;
    pl_number?: string;
    territory_type?: TerritoryType;
    active_substances?: Array<string>;
    file_source?: FileSource,
    file_path: string;
}

/*
Custom union type instead of enum -> 
as Error property needs to pass in custom message/code details in
*/
export type JobStatus =
  | { kind: "Accepted" }
  | { kind: "Done" }
  | { kind: "NotFound" }
  | { kind: "Error"; message: string; code: string };

export class JobStatusResponse  {
    id!: string;
    status!: JobStatus;
    constructor(id: string, status: JobStatus){
        this.id = id;
        this.status = status;
    }
}

export interface CronManager {
    create_manager_create_cron_job(time_to_wait: number) : void;
    create_manager_create_clean_up_cron_job(time_to_wait: number): void;
    delete_manager_delete_cron_job(time_to_wait: number) : void;
    delete_manager_delete_clean_up_cron_job(time_to_wait: number): void;
}

export type CronTimeToWait = {
    create_manager_create: number,
    create_manager_create_clean: number,
    delete_manager_create: number,
    delete_manager_create_clean: number,
}

//Represent an uploaded document
export interface DocumentUpload {
    id: string;
    type: string;
    name: string;
    author: string;
    pl_number: string;
    active_substances: string[];
    products: string[];
    file_source: string;
    file_path: string;
  }

export interface AzureBlobStorage {
    container_name: String,
    prefix: String,
    storage_account: String,
    master_key: String,
}
export interface CreateMessage {
    job_id: string;
    document: Document;
    initiatorEmail?: string;
    type: "CREATE" | "UPDATE";
    blob_update_path?: string;
    original_job_id?: string;
}
  
export interface DeleteMessage {
job_id: string;
document_id: string;
initiator_email?: string;
}

export interface ServiceBusProperties {
    service_bus_endpoint: string;
    queue_name: string;
    sas_policy_name: string;
    sas_key: string;
    client: ServiceBusClient;
}