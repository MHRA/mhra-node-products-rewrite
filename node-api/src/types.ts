/*
A set of common types used throughout the application
*/

import { Axios, AxiosRequestConfig } from "axios";
import { DocumentType, Product, TerritoryType } from "./__generated__/resolvers-types";

export interface AzureSearchClient {
    config: AzureConfig
}

export class SubstanceGroup {
    data: Product;
    key: string;
}

export class BmgfResult {
    "@search.score": number;
    "metadata_storage_path": string;
    "created": string;
    "metadata_storage_size": number;
    "metadata_storage_last_modified": string;
    "metadata_storage_name": string;
    "products": Array<string>;
    "title": string;
    "highlights": Array<string>;
    summary: string;
    "pl_numbers": Array<string>;
    "active_substances":Array<string>;
    "pbpk_models":Array<string>;
    "matrices": Array<string>;
    "pregnancy_trimesters":Array<string>;
    "file_name": string;
    "report_name": string;
    "id": string;
}

export interface ProductResult {
    "@search.score": string;
    "rev_label": string;
    "metadata_storage_path": string;
    "product_name": string;
    "created": string;
    "release_state": string;
    "keywords": string;
    "title": string;
    "pl_number": Array<string>;
    "territory": TerritoryType;
    "file_name": string;
    "metadata_storage_size": number;
    "metadata_storage_last_modified": string;
    "metadata_storage_name": string;
    "doc_type": DocumentType;
    "suggestions": Array<string>;
    "substance_name": Array<string>;
    "facets": Array<string>;
}

export interface AzureHighlight {
    pub_content: Array<String>,
}
export interface IndexResult {
    doc_type: DocumentType,
    territory?: TerritoryType,
    file_name: string,
    metadata_storage_name: String,
    metadata_storage_path: String,
    product_name?: String,
    substance_name: Array<String>,
    title: String,
    created?: String,
    facets: Array<String>,
    keywords?: String,
    metadata_storage_size: Number,
    release_state?: String,
    rev_label?: String,
    suggestions: Array<String>,
    "@search.score": Number,
    pub_highlights?: AzureHighlight
}

export class AzureConfig { 
    search_service: String;
    search_index: String;
    api_key: String;
    api_version: String;
    search_fuzziness: string;
    search_exactness_boost: string;
};

export class IndexResults {
    "value": Array<IndexResult>;
    "@odata.context": String;
    "@odata.count"?: number
}

export class AzurePagination {
    constructor(result_count, offset) {
        this.result_count = result_count;
        this.offset = offset;
    }
    result_count: number;
    offset: number;
};

export interface GetProductsIndexResponse {
    dataContextLink: String;
    value: Array<Product>;
    dataNextLink: String;
}

export class Facet {
    count: Number;
    value: String;
}

export class FacetResult {
    facets: Array<Facet>;
}

export class FacetResults<T> {
    "value": Array<T>;
    "@search.facets": FacetResult;
    "@odata.context": String;
    "@odata.nextLink": String;
}

export class CollectionResults<T> {
    "value": Array<T>;
    "@odata.context": String;
    "@odata.nextLink": String;
}

export class CollectionCountResults<T> {
    "value": Array<T>;
    "@odata.context": String;
    "@odata.count": number;
}

export class SubstanceIndexItem {
    name: String;
    count: Number;
}