import { ProductsDataSource } from "../query_objects/products/products_index.js";
const products_data = new ProductsDataSource();
const products = async () => await products_data.get_products_response();
export default products;
