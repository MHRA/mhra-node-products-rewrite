import { expect } from 'chai';
import { QueryNormalizer } from '../dist/query_normalizer.js';

/**
 * Test suite for the QueryNormalizer class.
 */
describe('QueryNormalizer', () => {
    const queryNormalizer = new QueryNormalizer();

    /**
     * Test suite for the normalize_product_licences method.
     */
    describe('normalize_product_licences', () => {
        /**
         * Test case for normalizing product licenses in the search term.
         */
        it('should normalize product licenses in the search term', () => {
            const search_term = 'PL 12345 / 6789';
            const normalized_term = queryNormalizer.normalize_product_licences(search_term);
            expect(normalized_term).to.equal('PL123456789');
        });
    });

    /**
     * Test suite for the prefer_exact_match_but_support_fuzzy_match method.
     */
    describe('prefer_exact_match_but_support_fuzzy_match', () => {
        /**
         * Test case for constructing a search query with fuzzy matching and exactness boost.
         */
        it('should construct a search query with fuzzy matching and exactness boost', () => {
            const word = 'medicine';
            const search_word_fuzziness = '2';
            const search_exactness_boost = '3';
            const search_query = queryNormalizer.prefer_exact_match_but_support_fuzzy_match(
                word,
                search_word_fuzziness,
                search_exactness_boost
            );
            expect(search_query).to.equal('(medicine~2 || medicine^3)');
        });
    });

    /**
     * Test suite for the escape_special_characters method.
     */
    describe('escape_special_characters', () => {
        /**
         * Test case for escaping special characters in the search term.
         */
        it('should escape special characters in the search term', () => {
            const search_term = '+-\\/\\^|?*\\(){}[]&!"~:';
            const escaped_term = queryNormalizer.escape_special_characters(search_term);
            expect(escaped_term).to.equal('\\+\\-\\\\\\/\\\\\\^\\|\\?\\*\\\\\\(\\)\\{\\}\\[\\]\\&\\!\\"\\~\\:');
        });
    });

    /**
     * Test suite for the escape_special_words method.
     */
    describe('escape_special_words', () => {
        /**
         * Test case for escaping special words in the search term.
         */
        it('should escape special words in the search term', () => {
            const search_term = 'medicine AND cough OR fever NOT flu';
            const expected_output = 'medicine \\AND cough \\OR fever \\NOT flu';
            const result = queryNormalizer.escape_special_words(search_term);
    
            expect(result).to.equal(expected_output);
        });
    });
});
