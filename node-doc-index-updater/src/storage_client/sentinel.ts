import * as fs from "fs";
//import * as Client from 'ssh2-sftp-client';
import Client from 'ssh2-sftp-client';

interface SftpConfig {
  server: string;
  user: string;
  public_key_path: string;
  private_key_path: string;
  private_key_password: string;
}

interface BlobResponse {
    blob_name: string;
    data: Buffer;
}

//TODO -> HOW DOES SFTP INTERACT WITH APPLICATION. EXISTING PDFS ON A SERVER WITH 
export class SftpClient {

    config: SftpConfig;

    constructor() {
        this.config = {
            server: process.env.SENTINEL_SFTP_SERVER,
            user: process.env.SENTINEL_SFTP_USERNAME,
            public_key_path:process.env.SENTINEL_PUBLIC_KEY_PATH, 
            private_key_path: process.env.SENTINEL_PRIVATE_KEY_PATH,
            private_key_password: process.env.SENTINEL_PRIVATE_KEY_PASSWORD
        };
    }

    // SFTP Client connection to the sentinel server?
    async get_sentinel_sftp_client(): Promise<Client> {
        const sftp = new Client();

        try{
            console.debug(
                `Initiating Sentinel sftp connection with server: ${this.config.server} with user: ${this.config.user}`
            );

            await sftp.connect({
                host: this.config.server,
                port: 22,
                username: this.config.user,
                privateKey: fs.readFileSync(this.config.private_key_path),
                passphrase: this.config.private_key_password
            });
            console.debug("SFTP server connection established");
        }catch(error){
            console.error("SFTP error is ", error);
        }

        return sftp;
    }
           
    get_env_fail_fast(name: string): string {
        const failure_message = `Set env variable ${name} first!`;
        if (!process.env[name]) {
        throw new Error(failure_message);
        }
        return process.env[name]!;
    }

    // Retrieve a file from the specified SFTP Client
    async retrieve_file_from_sftp(sftp: Client,filepath: string,): Promise<Buffer> {
        try {
            return await sftp.get(filepath);
        } catch (e) {
        console.error(e);
        throw new Error(`Could not retrieve file from SFTP server`);
        }
    }

    async get_blob(blob_name: string): Promise<BlobResponse> {
        const sftp = await this.get_sentinel_sftp_client();
        const data = await this.retrieve_file_from_sftp(sftp, blob_name);
       
        console.debug(`File retrieved from SFTP at ${blob_name} (${data.length} bytes)`);
        return {
            blob_name,
            data
        };
    }
}
