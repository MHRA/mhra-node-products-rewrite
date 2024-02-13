import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { ProductsDataSource } from './query_objects/products/products_index.js';
import resolvers from './resolvers/resolver.js';
import { SubstancesDataSource } from './shared/substances_index.js';
import { MedicineLevelsInPregnancyDataSource } from "./query_objects/medicine_levels_in_pregnancy/query_root.js";
import * as dotenv from "dotenv";
import { CacheService } from './services/cache.js';

//Lets us read our config values from our .env throughout the application
dotenv.config();

// A schema is a collection of type definitions (hence "typeDefs")
// Together this defines the "shape" of queries that are executed against our data
// Our schema is defined in a graphql file.
const typeDefs = readFileSync('./schema.graphql', { encoding: 'utf-8' });

//This interface is used so the GraphQL Code Generator adds a type for the context our resolvers share, 
// ensuring TypeScript will warn us if we attempt to use a value that doesn't exist.
export interface MedicinesContext {
  dataSources: {
      productsSearchService: ProductsDataSource,
      sharedSubstanceService: SubstancesDataSource,
      medicineLevelsInPregnancyService: MedicineLevelsInPregnancyDataSource
  };
}

export async function startGraphQLServer() {
  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer<MedicinesContext>({
    typeDefs,
    resolvers,
  });

  // The initial substance facets can be cached at startup and refreshed on a cron job to improve performance.
  // Rather than consistently making API calls on every page load now, we will just make 26(A-7) + 10 (0-9) = 36 calls every 5minutes instead

  //const cache_service = new CacheService();
  //await cache_service.cache_substance_facets();

  const { url } = await startStandaloneServer(server, {
    context: async (): Promise<MedicinesContext> => {
      return {
        // Data sources here, any connection or Rest API Class
        // For MHRA Medicines, we will be communicating with the relevant Azure Search Service.
        dataSources: {
          productsSearchService: new ProductsDataSource(),
          sharedSubstanceService: new SubstancesDataSource(),
          medicineLevelsInPregnancyService: new MedicineLevelsInPregnancyDataSource()
        },
      };
    },
  });

  //await cache_service.cache_substance_facets();
  console.log(`🚀 GraphQL Server ready at: ${url}`);
}

await startGraphQLServer();
