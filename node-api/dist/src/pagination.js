import base64 from 'base-64';
/**
 * Cursor Pagination implementation that can be used in GraphQL responses, e.g. searches with a large amount of results.
 */
export class Pagination {
    /**
     * Constructor for the Pagination class.
     *
     * @param hasPreviousPage Flag indicating whether there is a previous page.
     * @param hasNextPage Flag indicating whether there is a next page.
     * @param startCursor The cursor pointing to the start of the current page.
     * @param endCursor The cursor pointing to the end of the current page.
     */
    constructor(hasPreviousPage, hasNextPage, startCursor, endCursor) {
        this.has_previous_page = hasPreviousPage;
        this.has_next_page = hasNextPage;
        this.start_cursor = startCursor;
        this.end_cursor = endCursor;
    }
    /**
     * Build a Pagination object based on offset, result count, and total count.
     *
     * @param offset The offset indicating the starting position of the current page.
     * @param resultCount The number of results on the current page.
     * @param totalCount The total count of results.
     * @returns A Pagination object.
     */
    static build(offset, resultCount, totalCount) {
        const hasPreviousPage = offset !== 0;
        const hasNextPage = offset + resultCount < totalCount;
        const startCursor = base64.encode(offset.toString());
        const endCursor = base64.encode(Math.min(totalCount, offset + resultCount - 1).toString());
        return new Pagination(hasPreviousPage, hasNextPage, startCursor, endCursor);
    }
    /**
     * Convert an encoded cursor to offset (integer).
     *
     * @param encoded The encoded cursor.
     * @returns The corresponding offset.
     */
    static convert_after_offset(encoded) {
        const bytes = base64.decode(encoded);
        const string = Buffer.from(bytes).toString();
        return parseInt(string) + 1;
    }
    /**
     * Get offset from 'after' cursor or use 'skip' or a default value.
     *
     * @param skip The number of items to skip.
     * @param after The cursor indicating the starting position.
     * @param defaultValue The default offset value.
     * @returns The offset value.
     */
    static get_offset_or_default(skip, after, defaultValue) {
        if (after) {
            try {
                return Pagination.convert_after_offset(after);
            }
            catch (e) {
                return defaultValue;
            }
        }
        else if (skip) {
            return skip;
        }
        else {
            return defaultValue;
        }
    }
}
