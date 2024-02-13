import { AzureContext } from "../azure_context.js";
import { CollectionResults, FacetResults, ProductResult } from "../types.js";
import {
    Product,
    SubstanceIndex,
    Documents,
    DocumentEdge,
    Substance,
    Document,
    TerritoryType,
    DocumentType,
} from "../__generated__/resolvers-types.js";
import memoryCache from 'memory-cache';

/**
 * Manages operations against the Product Index that are categorized by substances.
 */
export class SubstancesDataSource {

    Context: AzureContext;

    // The default instance of a SubstanceIndex will search against the products-index
    constructor() {
        this.Context = new AzureContext(process.env.AZURE_SEARCH_INDEX, process.env.AZURE_SEARCH_BMGF_INDEX);
    }

    /**
     * Gets the collated data for each substance with products starting with a given letter.
     * 
     * @param {string} letter - The starting letter for substances.
     * @returns {Promise<SubstanceIndex[]>} - The substance index results.
     */
    async get_substances_index(letter: string): Promise<SubstanceIndex[]> {
        const keyToCheck = `substance_character_result_${letter}`;

        // Check if memory cache contains letter result
        const cachedResult = memoryCache.get<SubstanceIndex[]>(keyToCheck);

        if (cachedResult !== null) {
            return cachedResult;
        }

        const facet_search = await this.Context.products_client.build_facet_search<FacetResults<Product>>("facets", letter, "eq");
        
        const filtered_result = this.format_index_search_results(facet_search, letter);

        // Cache the filtered result
        memoryCache.put(keyToCheck, filtered_result, 300000);

        return filtered_result;
    }

    /**
     * Gets substance details along with associated products.
     * 
     * @param {string} substance_name - The name of the substance.
     * @returns {Promise<Substance>} - The substance details.
     */
    async get_substance_with_products(substance_name: string) : Promise<Substance> {
        // Substance contains name and an array of products
        const substance = new Substance();
        substance.name = substance_name;
        // Each product contains an array of associated documents
        const products = new Array<Product>();
        
        const collection_search = await this.Context.products_client.build_filter_by_collection_field_search
                            <CollectionResults<ProductResult>>("substance_name", substance_name, "eq", "f");
        
        const grouped_results = Object.entries(collection_search.value.reduce((groups,item) => {
            const group = (groups[item.product_name] || []);
            group.push(item);
            groups[item.product_name] = group;
            return groups;
            }, {} as Record<string, ProductResult[]>)).map(([product_name, product]) => ({product_name, product}));
        
        Object.entries(grouped_results).forEach(entry => {
            const [key, value] = entry;
            let product = new Product();
            product.name = value.product_name;
            let documents = new Documents();
            documents.totalCount = value.product.length;
            let document_edges = new Array<DocumentEdge>();
            
            value.product.map(p => {
                let document_edge = new DocumentEdge();
                let node = new Document();
                node.url = p.metadata_storage_path;
                node.activeSubstances = p.substance_name;
                node.created = p.created;
                node.docType = p.doc_type?.toString().toUpperCase() as unknown as DocumentType;
                node.fileSizeInBytes = p.metadata_storage_size;
                node.highlights = null;
                node.name = p.file_name;
                node.productName = value.product_name;
                node.territoryType = p.territory?.toString().toUpperCase() as unknown as TerritoryType;
                node.title = p.title;
                node.url = p.metadata_storage_path;
                document_edge.node = node;
                document_edges.push(document_edge)
            });
            documents.edges = document_edges;
            product.documents = documents;
            products.push(product);
        });
       
        substance.products = products;
        return substance;
    }

    /**
     * Formats the results from the Azure Search Service to only include the facet data we want.
     * 
     * @param {FacetResults<Product>} results - The facet search results.
     * @param {string} letter - The starting letter for substances.
     * @returns {Array<SubstanceIndex>} - The formatted substance index results.
     */
    format_index_search_results(results: FacetResults<Product>, letter: string): Array<SubstanceIndex> {
        const facets = results['@search.facets'].facets;
        const filteredResults = [];

        for (const x of facets) {
            if (x.value.startsWith(letter)) {
                const substanceParts = x.value.split(',');
                if (substanceParts.length === 2) {
                    const substance = substanceParts[1].trim();
                    const substanceIndex = new SubstanceIndex();
                    substanceIndex.count = parseInt(x.count.toString());
                    substanceIndex.name = substance;
                    filteredResults.push(substanceIndex);
                }
            }
        }

        return filteredResults;
    }
}
