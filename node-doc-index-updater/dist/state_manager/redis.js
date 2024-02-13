import redis from 'redis';
import * as dotenv from "dotenv";
dotenv.config();
/**
 * Manages the current Redis client connection state.
 */
export class RedisManager {
    /**
     * Wrapper around the node Redis client to set / get values from the associated Redis cache.
     *
     * @returns The Redis client instance.
     */
    get_client() {
        return redis.createClient({
            // rediss for TLS
            url: process.env.AZURE_REDIS_URL,
            password: process.env.AZURE_REDIS_PASSWORD
        });
    }
    /**
     * Executes a get command against the current Redis client.
     *
     * @param id The key to retrieve from Redis.
     * @returns A Promise that resolves to a JobStatus or null if the key is not found.
     */
    async get_from_redis(id) {
        const client = this.get_client();
        try {
            await client.connect();
            const redis_result = await client.get(id);
            return this.parse_job_status(redis_result);
        }
        catch (error) {
            console.log("[GET] Redis error  ", error);
        }
        finally {
            client.quit();
        }
        return null;
    }
    /**
     * Executes a set command against the current Redis client.
     *
     * @param key The key to set in Redis.
     * @param value The value to set for the given key.
     * @returns A Promise that resolves to the result of the set operation or null in case of an error.
     */
    async set_in_redis(key, value) {
        const client = this.get_client();
        let result = null;
        try {
            await client.connect();
            result = await client.set(key, value);
        }
        catch (error) {
            console.error("[SET] Redis error", error);
        }
        finally {
            client.quit();
        }
        return result;
    }
    /**
     * Executes a delete command against the current Redis client.
     *
     * @param id The key to delete from Redis.
     * @returns A Promise that resolves to the number of keys deleted.
     */
    async delete_from_redis(id) {
        const client = this.get_client();
        let result = 0;
        try {
            await client.connect();
            result = await client.del(id);
        }
        catch {
            // Handle errors if needed
        }
        finally {
            client.quit();
        }
        return result;
    }
    /**
     * Simple wrapper around parsing a job status.
     *
     * @param status The status string to parse.
     * @returns The parsed JobStatus.
     * @throws Error if the status is not one of the expected values.
     */
    parse_job_status(status) {
        switch (status) {
            case "Accepted":
                return { kind: "Accepted" };
            case "Done":
                return { kind: "Done" };
            case "NotFound":
                return { kind: "NotFound" };
            default:
                throw new Error(`Invalid status: ${status}`);
        }
    }
}
