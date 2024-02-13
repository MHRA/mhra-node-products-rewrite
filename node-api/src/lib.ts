import { QueryNormalizer } from './query_normalizer.js';
import { AzureConfig, AzurePagination } from './types.js';
import axios, { AxiosInstance } from 'axios';

/**
 * Searches against the Azure Cognitive Search Rest API.
 */
export class AzureSearchClient {
    /**
     * The default index for the search client.
     */
    default_index: string;

    /**
     * Configuration settings for Azure Search.
     */
    config: AzureConfig;

    /**
     * Axios instance for making HTTP requests.
     */
    client: AxiosInstance;

    /**
     * Instance of QueryNormalizer for normalizing search queries.
     */
    query_normalizer: QueryNormalizer;

    /**
     * Creates an instance of AzureSearchClient.
     * @param {string} index - The default index for the search client.
     */
    constructor(index: string) {
        this.default_index = process.env.AZURE_SEARCH_INDEX;
        this.client = axios.create({
            headers: {
                'api-key': process.env.AZURE_API_ADMIN_KEY,
            },
        });
        this.query_normalizer = new QueryNormalizer();

        const config = new AzureConfig();
        config.search_service = process.env.SEARCH_SERVICE;
        config.search_index = index;
        config.search_fuzziness = process.env.SEARCH_FUZZINESS;
        config.search_exactness_boost = process.env.SEARCH_FUZZINESS_EXACT_BOOST;
        config.api_version = process.env.AZURE_SEARCH_API_VERSION;
        this.config = config;
    }

    async build_search_no_type(query_string?: string): Promise<void> {
        let url = `https://${this.config.search_service}.search.windows.net/indexes/${this.config.search_index}/docs?api-version=${this.config.api_version}`;
        if (query_string != null) {
            url += query_string;
        }
        const response = await this.client.get(url);
    }

    /**
     * Builds a search request against the specified Azure Search index.
     * @template T - The type of the expected response data.
     * @param {String} [query_string] - The query string to append to the search request.
     * @returns {Promise<T>} - Resolves to the search response data.
     */
    async build_search<T>(query_string?: string): Promise<T> {
        let url = `https://${this.config.search_service}.search.windows.net/indexes/${this.config.search_index}/docs?api-version=${this.config.api_version}`;
        if (query_string != null) {
            url += query_string;
        }
        const response = await this.client.get<T>(url);
        return response.data;
    }

    /**
     * Builds a facet search request against the specified Azure Search index.
     * @template T - The type of the expected response data.
     * @param {String} field_name - The name of the field to facet.
     * @param {String} field_value - The value to filter the facet on.
     * @param {String} operator - The comparison operator for the filter.
     * @returns {Promise<T>} - Resolves to the facet search response data.
     */
    async build_facet_search<T>(field_name: string, field_value: string, operator: string): Promise<T> {
        let url = `https://${this.config.search_service}.search.windows.net/indexes/${this.config.search_index}/docs?api-version=${this.config.api_version}`;
        if (field_name != null && field_value != null && operator != null) {
            url += `&filter=${field_name}/any(f: f ${operator} '${field_value}')`;
            // Facets
            url += `&facet=facets,count:50000,sort:value`;
            url += `&top="0"`;
        }
        const response = await this.client.get<T>(url);
        return response.data;
    }

    /**
     * Builds a filter search request against the specified Azure Search index with a collection field.
     * @template T - The type of the expected response data.
     * @param {string} field_name - The name of the field to filter.
     * @param {String} field_value - The value to filter the field on.
     * @param {String} operator - The comparison operator for the filter.
     * @param {String} filter_type - The filter type (e.g., 'f').
     * @returns {Promise<T>} - Resolves to the filter search response data.
     */
    async build_filter_by_collection_field_search<T>(
        field_name: string,
        field_value: string,
        operator: string,
        filter_type: string
    ): Promise<T> {
        let url = `https://${this.config.search_service}.search.windows.net/indexes/${this.config.search_index}/docs?api-version=${this.config.api_version}`;
        if (field_name != null && field_value != null && operator != null) {
            url += `&$filter=${field_name}/any(${filter_type}: ${filter_type} ${operator} '${field_value}')`;
        }
        const response = await this.client.get<T>(url);
        return response.data;
    }

    /**
     * Builds a filter search request against the specified Azure Search index with a non-collection field.
     * @template T - The type of the expected response data.
     * @param {String} field_name - The name of the field to filter.
     * @param {String} field_value - The value to filter the field on.
     * @param {String} operator - The comparison operator for the filter.
     * @returns {Promise<T>} - Resolves to the filter search response data.
     */
    async build_filter_by_field_request<T>(field_name: string, field_value: string, operator: string): Promise<T> {
        let url = `https://${this.config.search_service}.search.windows.net/indexes/${this.config.search_index}/docs?api-version=${this.config.api_version}`;
        if (field_name != null && field_value != null && operator != null) {
            url += `&$filter=${field_name} ${operator} '${field_value}'`;
        }
        const response = await this.client.get<T>(url);
        return response.data;
    }

    /**
     * Performs a search request with pagination and optional filtering.
     * @template T - The type of the expected response data.
     * @param {String} search_term - The search term.
     * @param {AzurePagination} pagination - Pagination configuration.
     * @param {Boolean} include_count - Indicates whether to include the count in the response.
     * @param {String} [filter] - The filter to apply to the search request.
     * @returns {Promise<T>} - Resolves to the search response data.
     */
    async search_with_pagination<T>(
        search_term: string,
        pagination: AzurePagination,
        include_count: boolean,
        filter?: string
    ): Promise<T> {
        let url = `https://${this.config.search_service}.search.windows.net/indexes/${this.config.search_index}/docs?api-version=${this.config.api_version}
                            &highlight=content&queryType=full&search=${search_term}&scoringProfile=preferKeywords&searchMode=all&$count=${include_count ? 'true' : ''}$top=${pagination.result_count}&$skip=${pagination.offset}`;
        const response = await this.client.get<T>(url);
        return response.data;
    }

    /**
     * Builds a full search request with filtering against the specified Azure Search index.
     * @template T - The type of the expected response data.
     * @param {String} field_name - The name of the field to filter.
     * @param {String} field_value - The value to filter the field on.
     * @param {String} operator - The comparison operator for the filter.
     * @returns {Promise<T>} - Resolves to the full search response data.
     */
    async build_full_search_with_filter<T>(field_name: string, field_value: string, operator: string): Promise<T> {
        let url = `https://${this.config.search_service}.search.windows.net/indexes/${this.config.search_index}/docs?api-version=${this.config.api_version}&highlight=content&queryType=full&search=&scoringProfile=preferKeywords&searchMode=all&$count=true`;
        if (field_name != null && field_value != null && operator != null) {
            url += `&$filter=(${field_name} ${operator} '${field_value}')`;
        }
        const response = await this.client.get<T>(url);
        return response.data;
    }

    /**
     * Builds a full search request with filtering and a specified filter type against the specified Azure Search index.
     * @template T - The type of the expected response data.
     * @param {String} field_name - The name of the field to filter.
     * @param {String} field_value - The value to filter the field on.
     * @param {String} operator - The comparison operator for the filter.
     * @param {String} filter_type - The filter type (e.g., 'f').
     * @returns {Promise<T>} - Resolves to the full search response data.
     */
    async build_full_search_with_filter_operator<T>(
        field_name: string,
        field_value: string,
        operator: string,
        filter_type: string
    ): Promise<T> {
        let url = `https://${this.config.search_service}.search.windows.net/indexes/${this.config.search_index}/docs?api-version=${this.config.api_version}&highlight=content&queryType=full&search=&scoringProfile=preferKeywords&searchMode=all&$count=true`;
        if (field_name != null && field_value != null && operator != null) {
            url += `&$filter=${field_name}/any(${filter_type}: ${filter_type} ${operator} '${field_value}')`;
        }
        const response = await this.client.get<T>(url);
        return response.data;
    }

    /**
     * Cleans up the search term by normalizing, escaping special characters, and escaping special words.
     * @param {string} search_term - The search term to clean up.
     * @returns {string} - The cleaned up search term.
     */
    clean_up_search_term(search_term: string): string {
        search_term = this.query_normalizer.normalize_product_licences(search_term);
        search_term = this.query_normalizer.escape_special_characters(search_term);
        search_term = this.query_normalizer.escape_special_words(search_term);
        return search_term;
    }

    /**
     * Adds fuzzy search logic to the search term.
     * @param {string} searchTerm - The search term to add fuzzy search to.
     * @param {string} searchFuzziness - The fuzziness value for the search.
     * @param {string} searchExactnessBoost - The boost for exact matches
     * @returns {string} - the search term with fuzzy search logic applied.
     */
    add_fuzzy_search(
        searchTerm: string,
        searchFuzziness: string,
        searchExactnessBoost: string
    ): string {
        return searchTerm
            .split(' ')
            .filter(word => word.length > 0)
            .map(word =>
                this.query_normalizer.prefer_exact_match_but_support_fuzzy_match(
                    word,
                    searchFuzziness,
                    searchExactnessBoost
                )
            )
            .join(' ');
    }

}