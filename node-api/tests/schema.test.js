import { expect } from 'chai';
import { existsSync, readFileSync } from 'fs';
import { parse, } from 'graphql'; 

// Ensure schema file exists
describe('Schema', () => {
    it('file should exist', () => {
        const schema_file = './schema.graphql';
        expect(existsSync(schema_file)).to.be.true;
    });
});

// Ensure schema file is a valid GraphQL schema
describe('Schema Validation', () => {
    it('should be a valid GraphQL schema', () => {
        const schemaFile = './schema.graphql';
        const schemaContents = readFileSync(schemaFile, 'utf-8');
        expect(() => parse(schemaContents)).not.to.throw();
    });
});
