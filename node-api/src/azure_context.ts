import { AzureSearchClient } from "./lib.js";

/**
 * Represents a context to interact with Azure Search clients for specific indexes.
 * 
 * @summary Creates a context to our Azure Search Client, specifying the type of index that needs to be searched against.
 */
export class AzureContext {

    /**
     * The Azure Search client for the "products" index.
     */
    products_client: AzureSearchClient;

    /**
     * The Azure Search client for the "bmgf" index.
     */
    bmgf_client: AzureSearchClient;

    /**
     * Constructor for the AzureContext class.
     * 
     * @param {string} products_index - The name of the "products" index.
     * @param {string} bmgf_index - The name of the "bmgf" index.
     */
    constructor(products_index: string, bmgf_index: string) {
        this.products_client = new AzureSearchClient(products_index);
        this.bmgf_client = new AzureSearchClient(bmgf_index);
    }
}
