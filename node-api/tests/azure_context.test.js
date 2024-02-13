import { expect } from 'chai';
import { AzureContext } from '../dist/azure_context.js';
import { AzureSearchClient } from '../dist/lib.js';

describe('Azure Context Test', function () {
    it('should create an AzureContext with specified indexes', function () {
        const products_index = 'products-index';
        const bmgf_index = 'bmgf-index';
        const azure_context = new AzureContext(products_index, bmgf_index);
        expect(azure_context.products_client).to.be.an.instanceof(AzureSearchClient);
        expect(azure_context.bmgf_client).to.be.an.instanceof(AzureSearchClient);
    });
});