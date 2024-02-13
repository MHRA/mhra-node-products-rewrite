export class AuthManager {
    constructor() {
        this.get_basic_username = () => {
            return "nonprod_user";
        };
        this.get_basic_password = () => {
            return "wheels_measure_outside";
        };
        this.auth_is_correct = (username, password) => {
            return username === this.get_basic_username() && password === this.get_basic_password();
        };
        this.extract_encoded_credentials = (authHeader) => {
            const re = /^Basic\s([-A-Za-z0-9+/]*={0,3})$/;
            const match = authHeader.match(re);
            if (match) {
                return match[1];
            }
            return null;
        };
        this.decode_credentials = (encodedCredentials) => {
            try {
                const decodedCreds = Buffer.from(encodedCredentials, "base64").toString();
                return this.extract_username_and_password(decodedCreds);
            }
            catch (error) {
                return null;
            }
        };
        this.extract_username_and_password = (decodedCreds) => {
            const url = new URL(`http://${decodedCreds}@example.com`);
            const username = url.username;
            const password = url.password;
            if (username && password) {
                return [username, password];
            }
            return null;
        };
        this.attempt_basic_auth = (authHeader) => {
            const encodedCreds = this.extract_encoded_credentials(authHeader);
            if (encodedCreds) {
                const credentials = this.decode_credentials(encodedCreds);
                if (credentials) {
                    const [username, password] = credentials;
                    return this.auth_is_correct(username, password);
                }
            }
            return false;
        };
    }
}
