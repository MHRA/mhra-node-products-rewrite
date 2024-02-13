import axios from 'axios';
import {AzureKeyCredential, IndexDocumentsResult, SearchClient} from "@azure/search-documents";
import {UpdateIndexType} from "./types.js";

// Interface representing Azure configuration settings
export interface AzureConfig {
    search_service: string;
    search_index: string;
    api_version: string;
    api_key: string;
}

// Interface representing the results of an Azure index change operation
export interface AzureIndexChangedResults {
    value: Array<AzureIndexChangedResults>,
    "@odata.context": String
}

// Interface representing a search service with an update_index method
interface ISearchService {
    update_index<T>(key_values: Array<T>, config: AzureConfig, flag?: string): Promise<IndexDocumentsResult>
}

/*
 * Class responsible for adding key values to the search index using Azure Cognitive Search.
 */
export class SearchIndex implements ISearchService {
    /**
     * Updates the search index by adding or deleting key values based on the specified flag.
     *
     * @param key_values An array of key values to be added or deleted from the search index.
     * @param config Azure configuration settings.
     * @param flag Update index type flag indicating whether to upload or delete documents.
     * @returns A Promise that resolves to the result of the index update operation.
     */
    async update_index<T>(key_values: Array<T>, config: AzureConfig, flag?: UpdateIndexType): Promise<IndexDocumentsResult> {
        try {
            // Create a SearchClient instance using Azure configuration
            const client = new SearchClient(`https://${config.search_service}.search.windows.net`, `${config.search_index}`, new AzureKeyCredential(`${config.api_key}`));

            // Perform the appropriate index update based on the flag
            if (flag == UpdateIndexType.DELETE) {
                const doc_key_to_delete = key_values[0];
                const key_field = "metadata_storage_name";
                const delete_request = [
                    { [key_field]: doc_key_to_delete }
                ];
                const delete_result = await client.deleteDocuments(delete_request);
                return delete_result;
            } else if (flag == UpdateIndexType.UPLOAD) {
                const create_result = await client.uploadDocuments(key_values);
                return create_result;
            }
        } catch (error) {
            console.log(`Index update error is `, error);
        }
    }

}