import replaceAll from 'string.prototype.replaceall';

/**
 * Class responsible for normalizing and constructing search queries.
 */
export class QueryNormalizer {
    
    /**
     * Normalizes product licenses against a specific regex expression.
     *
     * @param searchTerm The search term containing product licenses.
     * @returns The normalized search term with product licenses.
     * @example
     * normalize_product_licenses("PL 12345 / 6789") => "PL123456789"
     */
    normalize_product_licences(searchTerm: string): string {
        const reProductLicence = /(PL|PLGB|PLNI|PLPI|THR|THRGB|THRNI|NR|NRGB|NRNI)(\s+|\/|_|-)*(\d{5})(\s+|\/|_|-)*(\d{4})/gi;
        return replaceAll(searchTerm, reProductLicence, (match, prefix, _, fivenumbers, __, fournumbers) => {
            return `${prefix.toUpperCase()}${fivenumbers}${fournumbers}`;
        });
    }
    
    /**
     * Constructs a search query that prefers an exact match but supports fuzzy matching.
     *
     * @param word The word to construct the search query for.
     * @param searchWordFuzziness The level of fuzzy matching for the word.
     * @param searchExactnessBoost The boost for exact matching of the word.
     * @returns The constructed search query.
     * @example
     * prefer_exact_match_but_support_fuzzy_match("medicine", "2", "3") => "(medicine~2 || medicine^3)"
     */
    prefer_exact_match_but_support_fuzzy_match(
        word: string,
        searchWordFuzziness: string,
        searchExactnessBoost: string
    ): string {
        return `(${word}~${searchWordFuzziness} || ${word}^${searchExactnessBoost})`;
    }

    /**
     * Escapes any special characters in the search term.
     *
     * @param searchTerm The search term to escape special characters in.
     * @returns The search term with escaped special characters.
     * @example
     */
    escape_special_characters(searchTerm: string): string {
        const regex_special_characters = /([\+\-\\/\\\^\|\?\*\\(\)\{\}\[\]&!"~:])/g;
        return replaceAll(searchTerm, regex_special_characters, '\\$1');
    }

    /**
     * Escapes any defined special words in the search term.
     *
     * @param searchTerm The search term to escape special words in.
     * @returns The search term with escaped special words.
     * @example
     * escape_special_words("medicine AND cough") => "medicine \AND cough"
     */
    escape_special_words(searchTerm: string): string {
        const reSpecialWords = /([^a-zA-Z])(AND|OR|NOT)([^a-zA-Z])/gi;
        return replaceAll(searchTerm, reSpecialWords, (match, ...args) => {
            return `${args[0]}\\${args[1]}${args[2]}`;
        });
    }
}
