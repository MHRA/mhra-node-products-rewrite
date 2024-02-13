import { ProductsDataSource } from './query_objects/products/products_index.js';
const products_data = new ProductsDataSource();
/*
export const resolvers: Resolvers = {
  Query: {
    products: Array<Product>,
    getProducts: GetProductsIndexResponse["GetProductsIndexResponse"] = async () => new GetProductsIndexResponse
  }
}
*/
export const resolvers = {
    Query: {
        products: (Array),
        getProducts: async () => products_data.get_products_response()
    }
};
/*
import {QueryResolvers} from "./__generated__/resolvers-types.js";
const bananas: NonNullable<QueryResolvers["bananas"]> = async () => "Hello, Banana!";
export default bananas;
*/
