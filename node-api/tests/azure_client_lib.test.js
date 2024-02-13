import { expect } from 'chai';
import { QueryNormalizer } from '../dist/query_normalizer.js';
import { AzureSearchClient } from '../dist/lib.js';

describe('AzureSearchClient', () => {
    let azure_search_client;
    const default_index = 'products-index';
    
    before(() => {
        azure_search_client = new AzureSearchClient(default_index);
    });

    describe('build_search', () => {
        it('should build a search request without a query string', async () => {
            const response = await azure_search_client.build_search();
    
            expect(response.value).to.contain.any;
        });

        it('should build a search request with a query string', async () => {
            const query_string = `&$filter=substance_name/any(f: f eq 'BARICITINIB')`;
            const response = await azure_search_client.build_search(query_string);

            expect(response.value).to.contain.any;
        });
    });

    describe('build_facet_search', () => {
        it('should build a facet search request', function() {
            this.timeout(5000); 
    
            const field_name = 'substance_name';
            const field_value = 'BARICITINIB';
            const operator = 'eq';
            return azure_search_client.build_facet_search(field_name, field_value, operator)
                .then(response => {
                    expect(response.value).to.contain.any;
                });
        });
    });

    describe('build_filter_by_field_request', () => {
        it('should build a filter search request with a non-collection field', async () => {
            const field_name = 'substance_name';
            const field_value = 'BARICITINIB';
            const operator = 'eq';
            const response = await azure_search_client.build_filter_by_field_request(field_name, field_value, operator);
            console.log("build_filter_by_field_request ", response);
            expect(response.value).to.contain.any;
        });
    });

    describe('build_full_search_with_filter_operator', () => {
        it('should build a full search request with filtering and a specified filter type', async () => {
            const field_name = 'substance_name';
            const field_value = 'BARICITINIB';
            const operator = 'eq';
            const filter_type = 'f';
            const response = await azure_search_client.build_full_search_with_filter_operator(
                field_name,
                field_value,
                operator,
                filter_type
            );

            expect(response.value).to.contain.any;
        });
    });

    describe('clean_up_search_term', () => {
        it('should clean up the search term', () => {
            const search_term = 'exampleSearchTerm';
            const cleaned_up_term = azure_search_client.clean_up_search_term(search_term);

            expect(cleaned_up_term).to.contain.any;
        });
    });

    describe('add_fuzzy_search', () => {
        it('should add fuzzy search logic to the search term', () => {
            const search_term = 'BARICITINIB';
            const search_fuzziness = '2';
            const search_exactness_boost = '3';
            const fuzzy_search = azure_search_client.add_fuzzy_search(search_term, search_fuzziness, search_exactness_boost);

            expect(fuzzy_search).to.equal("(BARICITINIB~2 || BARICITINIB^3)");
        });
    });
});
