// We use the generated `QueryResolvers` type to type check our queries!
//A resolver can optionally accept four positional arguments: (parent, args, contextValue, info)
// Our third argument (`contextValue`) can have a type here, so we
// can check the properties within our resolver's shared context value.
const queries = {
    QueryRoot: {
        /*
          NEW - latest schema resolver implementations.
        */
        // Products query resolvers
        products: async () => {
            return {
                //SPC, PIL and PAR Documents related to products
                documents: async (args, contextValue) => {
                    return await contextValue.dataSources.productsSearchService
                        .search_product_documents(args.search, args.first, args.skip, args.after, args.documentTypes, args.territoryTypes);
                },
                // Retrieves all documents associated with the queried product
                product: async (args, contextValue) => {
                    return await contextValue.dataSources.productsSearchService
                        .filter_products_by_name(args.name);
                },
                // Gets all products that belong to a particular substance
                // returning the name of the product, and how many files are assigned to that product
                productsIndex: async (args, contextValue) => {
                    return await contextValue.dataSources.productsSearchService
                        .get_products_associated_with_substances(args.substance);
                },
                // Retrieves all products associated with the queried active substance
                substance: async (args, contextValue) => {
                    return await contextValue.dataSources.sharedSubstanceService
                        .get_substance_with_products(args.name);
                },
                // Gets all substances that start with a particular letter
                // returning the name of the substance, and how many files are assigned to that substance
                substancesIndex: async (args, contextValue) => {
                    return await contextValue.dataSources.sharedSubstanceService
                        .get_substances_index(args.letter);
                }
            };
        },
        // Medicine Levels in Pregnancy queries
        medicineLevelsInPregnancy: async () => {
            return {
                substance: async (args, contextValue) => {
                    return await contextValue.dataSources.medicineLevelsInPregnancyService
                        .reports_associated_with_substance(args.name);
                },
                substancesIndex: async (args, contextValue) => {
                    return await contextValue.dataSources.medicineLevelsInPregnancyService
                        .get_report_count_against_substance_index(args.letter);
                },
                reports: async (args, contextValue) => {
                    return await contextValue.dataSources.medicineLevelsInPregnancyService
                        .get_pregnancy_reports_search(args.search);
                },
            };
        },
        /*
        OLD - Deprecrated GRAPHQL queries in the Rust API, these have still been re-implemented in NodeJS.
        /*
    
        /*
            Summary: List of active substances beginning with the provided letter that have reports associated with them,
            along with the count of documents for each
        */
        substancesIndex: async (_, args, contextValue) => {
            return await contextValue.dataSources.sharedSubstanceService
                .get_substances_index(args.letter);
        },
        /*
          Summary: List of products associated with the provided active substances that have reports associated with them,
          along with the count of documents for each
        */
        productsIndex: async (_, args, contextValue) => {
            return await contextValue.dataSources.productsSearchService
                .get_products_associated_with_substances(args.substance);
        }
    },
};
export default queries;
