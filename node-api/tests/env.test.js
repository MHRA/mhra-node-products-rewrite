import { config as dotenvConfig } from 'dotenv';
import { expect } from 'chai';

describe('GraphQL Server - Environment Variables', async () => {
    
    // Load test environment variables from a .env.test file
    dotenvConfig({ path: '.env' });
    
    it('Should read environment variables from .env file', async () => {
        // Retrieve environment variables from the context or directly from the process.env
        const search_service = process.env.AZURE_SEARCH_INDEX;
        const admin_api_key = process.env.AZURE_API_ADMIN_KEY;
        
        // Perform assertions to check if the environment variables are accessible
        expect(search_service).to.exist;
        expect(admin_api_key).to.exist;
    });
});