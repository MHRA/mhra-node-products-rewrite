import { AzureContext } from "./azure_context.js";
import { SubstancesDataSource } from "./shared/substances_index.js";
// Create a context to our Azure Search Indexes
const context = new AzureContext().create_context("products-index", "bmgf-index");
// Resolvers to be used for registering Queries
// A resolver can optionally accept four positional arguments: (parent, args, contextValue, info).
export const resolvers = {
    Query: {
        // Products Query
        async products() {
            const products_index = await context.products_client.build_search(); //"mhraproductsnonprod", "products-index"
            const only_product_names = products_index.value.filter((product) => product.product_name != "");
            return only_product_names;
        },
        // Substances Index Query
        async substancesIndex(parent, args, contextValue, info) {
            const substanceIndexData = await new SubstancesDataSource().get_substances_index(args.letter);
            return substanceIndexData;
        },
    },
    ProductsQuery: {
        // Products Query
        async products() {
            const products_index = await context.products_client.build_search(); //"mhraproductsnonprod", "products-index"
            const only_product_names = products_index.value.filter((product) => product.product_name != "");
            return only_product_names;
        },
        // Substances Index Query
        async substancesIndex(parent, args, contextValue, info) {
            const substanceIndexData = await new SubstancesDataSource().get_substances_index(args.letter);
            return substanceIndexData;
        },
    }
};
