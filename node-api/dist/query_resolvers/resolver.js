import products from './get_products.js';
export const resolvers = {
    Query: {
        products: (Array),
        getProducts: products
    }
};
