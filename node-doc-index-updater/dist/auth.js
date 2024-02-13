/*
Authentication Manager -> the API uses BASIC_AUTH
*/
export class AuthManager {
    constructor() {
        /**
         * Reads the BASIC auth username from the .ENV file.
         * This username must be present for the API to work.
         *
         * @returns {string} - The BASIC auth username.
         */
        this.get_basic_username = () => {
            return process.env.BASIC_AUTH_USERNAME || '';
        };
        /**
         * Reads the BASIC auth password from the .ENV file.
         * This password must be present for the API to work.
         *
         * @returns {string} - The BASIC auth password.
         */
        this.get_basic_password = () => {
            return process.env.BASIC_AUTH_PASSWORD || '';
        };
        /**
         * Validates that the credentials passed into our Auth Manager are correct.
         *
         * @param {string} username - The username to be validated.
         * @param {string} password - The password to be validated.
         * @returns {boolean} - Returns true if the credentials are correct, otherwise false.
         */
        this.auth_is_correct = (username, password) => {
            return username === this.get_basic_username() && password === this.get_basic_password();
        };
        /**
         * Attempts to make a basic authentication request using the auth_header found on the request.
         *
         * @param {string} auth_header - The Authorization header containing BASIC credentials.
         * @returns {boolean} - Returns true if the authentication attempt is successful, otherwise false.
         */
        this.attempt_basic_auth = (auth_header) => {
            const encoded_credentials = this.extract_encoded_credentials(auth_header);
            if (encoded_credentials) {
                const credentials = this.decode_credentials(encoded_credentials);
                if (credentials) {
                    const [username, password] = credentials;
                    return this.auth_is_correct(username, password);
                }
            }
            return false;
        };
        /**
         * Decodes the base64 encoded BASIC authentication credentials.
         *
         * @param {string} encoded_credentials - The base64 encoded credentials.
         * @returns {[string, string] | null} - Returns the decoded credentials as [username, password], or null if decoding fails.
         */
        this.decode_credentials = (encoded_credentials) => {
            try {
                const decoded_credentials = Buffer.from(encoded_credentials, "base64").toString();
                return this.extract_username_and_password(decoded_credentials);
            }
            catch (error) {
                return null;
            }
        };
        /**
         * Extracts the base64 encoded credentials from the Authorization header.
         *
         * @param {string} auth_header - The Authorization header.
         * @returns {string | null} - Returns the base64 encoded credentials or null if not found.
         */
        this.extract_encoded_credentials = (auth_header) => {
            const re = /^Basic\s([-A-Za-z0-9+/]*={0,3})$/;
            const match = auth_header.match(re);
            if (match) {
                return match[1];
            }
            return null;
        };
        /**
         * Extracts the username and password from decoded credentials.
         *
         * @param {string} decoded_credentials - The decoded credentials.
         * @returns {[string, string] | null} - Returns the [username, password] pair or null if extraction fails.
         */
        this.extract_username_and_password = (decoded_credentials) => {
            const url = new URL(`http://${decoded_credentials}@example.com`);
            const username = url.username;
            const password = url.password;
            if (username && password) {
                return [username, password];
            }
            return null;
        };
    }
}
