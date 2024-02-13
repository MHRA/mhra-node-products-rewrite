import { expect } from 'chai';
import { Pagination } from '../dist/pagination.js';

/**
 * Test suite for the Pagination class.
 */
describe('Pagination', () => {

    /**
     * Test suite for the build method of the Pagination class.
     */
    describe('build', () => {
        /**
         * Test case for building a Pagination object.
         */
        it('should build pagination object', () => {
            const offset = 10;
            const result_count = 5;
            const total_count = 100;

            const pagination = Pagination.build(offset, result_count, total_count);

            expect(pagination.has_previous_page).to.be.true;
            expect(pagination.has_next_page).to.be.true;
            expect(pagination.start_cursor).to.equal('MTA=');
            expect(pagination.end_cursor).to.equal('MTQ=');
        });
    });

    /**
     * Test suite for the convert_after_offset method of the Pagination class.
     */
    describe('convert_after_offset', () => {
        /**
         * Test case for converting after cursor to offset.
         */
        it('should convert after to offset', () => {
            const encoded = 'MQ==';
            const expected_offset = 2;
            const offset = Pagination.convert_after_offset(encoded);
            console.log("Offset is ", offset);
            expect(offset).to.equal(expected_offset);
        });
    });

    /**
     * Test suite for the get_offset_or_default method of the Pagination class.
     */
    describe('get_offset_or_default', () => {

        /**
         * Test case for getting offset from after cursor.
         */
        it('should get offset from after', () => {
            const skip = null;
            const after = 'MQ==';
            const default_value = 0;
            const expected_offset = 2;

            const offset = Pagination.get_offset_or_default(skip, after, default_value);

            expect(offset).to.equal(expected_offset);
        });

        /**
         * Test case for getting offset from skip.
         */
        it('should get offset from skip', () => {
            const skip = 10;
            const after = null;
            const default_value = 0;
            const expected_offset = 10;

            const offset = Pagination.get_offset_or_default(skip, after, default_value);

            expect(offset).to.equal(expected_offset);
        });

        /**
         * Test case for getting default offset.
         */
        it('should get default offset', () => {
            const skip = null;
            const after = null;
            const default_value = 0;
            const expected_offset = 0;

            const offset = Pagination.get_offset_or_default(skip, after, default_value);

            expect(offset).to.equal(expected_offset);
        });

        /**
         * Test case for invalid after offset
         */
        const invalid_after = 'invalid_after';
        it(`should throw error for invalid after ${invalid_after}`, () => {
            const skip = null;
            const after = invalid_after;
            const default_value = 0;
            const result = Pagination.get_offset_or_default(skip, after, default_value);
            console.log("Pagination result is ", result);
            expect(result).to.equal(0);
        });
        
    });
});
