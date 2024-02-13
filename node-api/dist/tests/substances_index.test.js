import { SubstancesDataSource } from '../src/shared/substances_index';
import { expect } from 'chai';
import { FacetResults } from '../src/types';
describe('SubstancesDataSource', () => {
    let substancesDataSource;
    beforeEach(() => {
        substancesDataSource = new SubstancesDataSource();
    });
    describe('get_substances_index', () => {
        it('should return substance index results', async () => {
            const letter = 'A';
            const expected_results = [
                { name: 'ACTIVE SUBSTANCE', count: 12 },
                { name: 'ACTIVE SUBSTANCE2', count: 12 },
            ];
            const results = await substancesDataSource.get_substances_index(letter);
            expect(results).to.equal(expected_results);
        });
    });
    describe('get_substance_with_products', () => {
        it('should return substance details with associated products', async () => {
            const substanceName = 'ACTIVE SUBSTANCE';
            const expectedSubstance = {
                name: 'ACTIVE SUBSTANCE',
                products: [
                    {
                        name: 'PRODUCT1',
                        documents: {
                            totalCount: 8,
                            edges: [
                                {
                                    node: {
                                        url: 'storage/path1',
                                        activeSubstances: ['ACTIVE SUBSTANCE'],
                                        created: '2020-01-01',
                                        docType: 'Spc',
                                        fileSizeInBytes: 1234.3,
                                        highlights: null,
                                        name: 'file name 1',
                                        productName: 'PRODUCT1',
                                        territoryType: 'TERRITORY',
                                        title: 'title 1',
                                    },
                                },
                                // ... other document edges
                            ],
                        },
                    },
                    // ... other products
                ],
            };
            const substance = await substancesDataSource.get_substance_with_products(substanceName);
            expect(substance).to.equal(expectedSubstance);
        });
    });
    describe('format_index_search_results', () => {
        it('should format the substance index search results', () => {
            const results = new FacetResults();
            results['@search.facets'].facets = [
                { value: 'A, ACTIVE SUBSTANCE', count: 12 },
                { value: 'A, ACTIVE SUBSTANCE2', count: 12 },
                { value: 'O, OTHER ACTIVE SUBSTANCE', count: 8 },
            ];
            const letter = 'A';
            const expected_results = [
                { name: 'ACTIVE SUBSTANCE', count: 12 },
                { name: 'ACTIVE SUBSTANCE2', count: 12 },
            ];
            const formattedResults = substancesDataSource.format_index_search_results(results, letter);
            expect(formattedResults).to.equal(expected_results);
        });
    });
});
