import { AzureContext } from "../../azure_context.js";
import { SubstanceIndexItem, } from "../../types.js";
import { Document, DocumentEdge, Documents, DocumentType, PageInfo, Product, TerritoryType, } from "../../__generated__/resolvers-types.js";
import { Pagination } from "../../pagination.js";
import base64 from "base-64";
export class ProductsDataSource {
    // The default instance of an AzureSearchClient will search against the products-index
    // Create an instance of the axios client specifying Auth Header Key
    constructor() {
        this.Context = new AzureContext(process.env.AZURE_SEARCH_INDEX, process.env.AZURE_SEARCH_BMGF_INDEX);
    }
    /**
    * Retrieves products associated with a given substance and returns the formatted results.
    *
    * @param {string} substance - The substance for which associated products are retrieved.
    * @returns {Promise<SubstanceIndexItem[]>} - The formatted substance index items.
    */
    async get_products_associated_with_substances(substance) {
        // Substance needs to be uppercase
        substance = substance.toUpperCase();
        // Grab the first letter of the substance
        const starting_letter = substance.charAt(0);
        // Create a facet match string
        const facet_match = starting_letter + ", " + substance;
        // Build a facet search for products associated with the substance
        const product_index = await this.Context.products_client.build_facet_search("facets", facet_match, "eq");
        // Return the formatted results using the format_index_search_results function
        return this.format_index_search_results(product_index, facet_match);
    }
    /**
    * Filters products by name and returns the corresponding product details.
    *
    * @param {string} product_name - The name of the product to filter.
    * @returns {Promise<Product>} - The product details.
    */
    async filter_products_by_name(product_name) {
        // Build a full search query with filter for product name
        const product_results = await this.Context.products_client.build_full_search_with_filter("product_name", product_name, "eq");
        // Create a new Product instance
        const product = new Product();
        product.name = product_name;
        // Create a new Documents instance
        let documents = new Documents();
        documents.totalCount = product_results["@odata.count"];
        // Create an array to store DocumentEdges
        let document_edges = new Array();
        // Map product results to GraphQL edge and node structure
        product_results.value.map((product) => {
            let document_edge = new DocumentEdge();
            let node = new Document();
            // Map individual fields from product result to node
            node.url = product.metadata_storage_path;
            node.activeSubstances = product.substance_name;
            node.created = product.created;
            node.docType = product.doc_type
                ?.toString()
                .toUpperCase();
            node.fileSizeInBytes = product.metadata_storage_size;
            node.highlights = null;
            node.name = product.file_name;
            node.productName = product_name;
            node.territoryType = product.territory
                ?.toString()
                .toUpperCase();
            node.title = product.title;
            // Set the node for the document edge
            document_edge.node = node;
            // Push the document edge to the array
            document_edges.push(document_edge);
        });
        // Set edges for the documents
        documents.edges = document_edges;
        // Set documents for the product
        product.documents = documents;
        return product;
    }
    /**
    * Searches for product documents based on the given parameters.
    *
    * @param {string} search - The search term.
    * @param {number} first - The number of items to retrieve.
    * @param {number} skip - The number of items to skip.
    * @param {String} after - The cursor for paginating forward.
    * @param {Array<DocumentType>} document_types - An array of document types to filter by.
    * @param {Array<TerritoryType>} territory_types - An array of territory types to filter by.
    * @returns {Promise<Documents>} - The search results in paginated format.
    */
    async search_product_documents(search, first, skip, after, document_types, territory_types) {
        // Clean up and add fuzzy search to the search term
        const cleaned_search = this.Context.products_client.clean_up_search_term(search);
        const cleaned_fuzzy_search = this.Context.products_client.add_fuzzy_search(cleaned_search, this.Context.products_client.config.search_fuzziness, this.Context.products_client.config.search_exactness_boost);
        // Calculate the offset based on 'skip' or 'after' parameters
        const offset = Pagination.get_offset_or_default(skip, after, 0);
        // Build the query string for Azure Search
        const query_string = `&highlight=content&queryType=full&search=${cleaned_fuzzy_search}&scoringProfile=preferKeywords&searchMode=all&$count=true&$top=10&$skip=${offset}`;
        const documents = new Documents();
        // Perform the Azure Search query
        let search_data = await this.Context.products_client.build_search(query_string);
        const total_count_by_value = document_types.length >= 1 || territory_types.length >= 1;
        // Filter results by document types
        if (document_types.length >= 1) {
            search_data.value = search_data.value.filter(x => document_types.includes(this.map_string_to_document_type(x.doc_type)));
        }
        // Filter results by territory types
        if (territory_types != null && territory_types.length >= 1) {
            search_data.value = search_data.value.filter(x => territory_types.includes(this.map_string_to_territory_type(x.territory)));
        }
        // Calculate the total count based on filtered or unfiltered results
        documents.totalCount = total_count_by_value
            ? search_data.value.length
            : search_data["@odata.count"];
        // Build paginated page data
        const build_pagination = Pagination.build(offset, 10, documents.totalCount);
        const page_info = new PageInfo();
        page_info.startCursor = build_pagination.start_cursor;
        page_info.hasPreviousPage = build_pagination.has_previous_page;
        page_info.hasNextPage = build_pagination.has_next_page;
        page_info.endCursor = build_pagination.end_cursor;
        const document_edges = new Array();
        documents.pageInfo = page_info;
        // Map search results to GraphQL edge and node structure
        search_data.value.map(async (p) => {
            let edge = new DocumentEdge();
            let document = new Document();
            document.activeSubstances = p.substance_name;
            document.created = p.created;
            document.docType = p.doc_type
                ?.toString()
                .toUpperCase();
            document.fileSizeInBytes = p.metadata_storage_size;
            document.name = p.file_name;
            document.productName = p.product_name;
            document.territoryType = p.territory
                ?.toString()
                .toUpperCase();
            document.title = p.title;
            document.url = p.metadata_storage_path;
            edge.cursor = base64.encode((offset + document_edges.length).toString());
            edge.node = document;
            document_edges.push(edge);
        });
        documents.edges = document_edges;
        return documents;
    }
    /**
     * Maps a string value to the corresponding DocumentType enum value.
     *
     * @param {string} value - The string value to be mapped to a DocumentType.
     * @returns {DocumentType | undefined} - The mapped DocumentType enum value, or undefined if no match is found.
     */
    map_string_to_document_type(value) {
        switch (value.toUpperCase()) {
            case "SPC":
                return DocumentType.Spc;
            case "PIL":
                return DocumentType.Pil;
            case "PAR":
                return DocumentType.Par;
            default:
                return undefined;
        }
    }
    /**
     * Maps a string value to the corresponding TerritoryType enum value.
     *
     * @param {string} value - The string value to be mapped to a TerritoryType.
     * @returns {TerritoryType | undefined} - The mapped TerritoryType enum value, or undefined if no match is found.
     */
    map_string_to_territory_type(value) {
        switch (value.toUpperCase()) {
            case "UK":
                return TerritoryType.Uk;
            case "NI":
                return TerritoryType.Ni;
            case "GB":
                return TerritoryType.Gb;
            default:
                return undefined;
        }
    }
    /**
     * Formats product search results based on the given facet match.
     *
     * @param {FacetResults<Product>} results - The search results with facets.
     * @param {string} facet_match - The starting letter or pattern for filtering results.
     * @returns {Array<SubstanceIndexItem>} - The formatted substance index items.
     */
    format_index_search_results(results, facet_match) {
        // Extract the facets array from the results
        const { facets } = results["@search.facets"];
        // Filter and map the facets array
        const filteredResults = facets
            .filter(x => x.value.startsWith(facet_match))
            .map(x => {
            // Split the value of the facet into an array and take the first 3 elements
            const facets = x.value.split(",").slice(0, 3);
            // Check if there are exactly 3 elements in the facets array
            if (facets.length !== 3) {
                return;
            }
            // Create a new SubstanceIndexItem
            const substanceIndex = new SubstanceIndexItem();
            substanceIndex.count = parseInt(x.count.toString());
            substanceIndex.name = facets[2].trim();
            return substanceIndex;
        });
        // Filter out undefined values from the mapped results
        return filteredResults.filter(x => x !== undefined);
    }
    // Gets documents associated with a Product.
    /*
      async get_associated_product_documents(search: String, first: Number, offset: Number,
          document_types: Array<DocumentType>, territory_types: Array<TerritoryType>, product?: string) {
          const pagination = new AzurePagination();
          pagination.offset = 10;
          pagination.result_count = 10;
          const filter = this.build_filter(document_types, territory_types, product);
          const search_result = await this.Context.products_client.search_with_pagination<IndexResults>(search,pagination, true, filter);
      }
      */
    build_filter(documentTypes, territoryTypes, productName) {
        let docs_filter = documentTypes && this.build_document_types_filter(documentTypes);
        let products_filter = productName && this.build_product_name_filter(productName);
        let territories_filter = territoryTypes && this.build_territory_types_filter(territoryTypes);
        let filters = [products_filter, docs_filter, territories_filter].filter(Boolean);
        switch (filters.length) {
            case 0:
                return null;
            case 1:
                return filters[0];
            default:
                return `(${filters.join(" and ")})`;
        }
    }
    build_document_types_filter(documentTypes) {
        if (!documentTypes.length) {
            return null;
        }
        return `(${documentTypes
            .map((documentType) => `doc_type eq '${documentType}'`)
            .join(" or ")})`;
    }
    build_territory_types_filter(territoryTypes) {
        if (!territoryTypes.length) {
            return null;
        }
        let initialQuery = territoryTypes.flatMap((territoryType) => {
            switch (territoryType) {
                case "GB":
                    return ["territory eq 'GB'"];
                case "NI":
                    return ["territory eq 'NI'"];
                default:
                    return [];
            }
        });
        initialQuery.push("territory eq 'UK'", "territory eq null");
        return `(${initialQuery.join(" or ")})`;
    }
    build_product_name_filter(productName) {
        return `(product_name eq '${productName}')`;
    }
}
