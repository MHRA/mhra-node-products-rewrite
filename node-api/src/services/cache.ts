import cron from "node-cron";
import {AzureContext} from "../azure_context.js";
import { FacetResults, SubstanceIndexItem } from "../types.js";
import {
    Product,
} from "../__generated__/resolvers-types.js";

import memoryCache from 'memory-cache';


//The cache service is responsible for serving common requests, e.g. the facetted substances search.
//We will just run a cron jab that caches common faceted results every 5minutes in the background.
//This should ensure next to instant results when the user is browsing the substance facets
export class CacheService {

    Context: AzureContext;

    constructor(){
        this.Context = new AzureContext(process.env.AZURE_SEARCH_INDEX, process.env.AZURE_SEARCH_BMGF_INDEX);
    }

    //Run the create queue every 10minutes
    async cache_facet_character_cron(): Promise<void> { //time_to_wait: Number
        cron.schedule("*/3 * * * *", async () => {
            await this.cache_substance_facets();
        });
    }

    async cache_substance_facets(): Promise<void> {
           // Array containing all letters A to Z
           const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

           // Array containing all numbers 0 to 9
           const numbers = Array.from({ length: 10 }, (_, i) => i);

           // Loop through letters and cache the results
           for (const letter of letters) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
                await this.cacheResults(letter);
           }

           // Loop through numbers and cache the results
           for (const number of numbers) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
                await this.cacheResults(number.toString());
           }
        
           // Create an array of tasks to cache both letters and numbers concurrently
           /*
           const cacheTasks = [...letters, ...numbers].map(async (character, index) => {
                 // 1 second delay so we don't hit request limit on azure index api.
                await new Promise(resolve => setTimeout(resolve, index * 1000));
                await this.cacheResults(character.toString());
           });
           */
           
           // Run all cache tasks concurrently
           // await Promise.all(cacheTasks);
    }

    async cacheResults(character) {
        const cacheKey = `substance_character_result_${character}`;
        const cachedResult = memoryCache.get(cacheKey);
        
        if(cachedResult) {
            memoryCache.del(cacheKey);
        }

        // If the result is not in the cache, fetch and store it

        const product_index = await this.Context.products_client.build_facet_search<FacetResults<Product>>("facets", character, "eq");
        const formattedResult = this.format_index_search_results(product_index, character);
        memoryCache.put(cacheKey, formattedResult, 300000); // 5 minutes in milliseconds
    }

    format_index_search_results(results : FacetResults<Product>, facet_match: string) : Array<SubstanceIndexItem> {
        const filteredResults = results["@search.facets"].facets
                            .filter(x => x.value.startsWith(facet_match))
                            .map(x => {
                                let facets = x.value.split(",").slice(0,3);
                                if(facets.length != 3){
                                    return;
                                }    
                                const products = facets[2];
                                const substanceIndex = new SubstanceIndexItem();
                                substanceIndex.count = parseInt(x.count.toString());
                                substanceIndex.name = products.trim();
                                return substanceIndex;
                            });
                            
        return filteredResults.filter(x => x!= undefined);
    }

}