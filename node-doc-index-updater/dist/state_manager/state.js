import { JobStatusResponse } from "../types.js";
import { RedisManager } from "./redis.js";
import * as xmljs from 'xml-js';
import { v4 as uuidv4 } from "uuid";
/**
 * A class that implements the StateManager interface for managing job statuses using Redis.
 */
export class JobStatusClient {
    /**
     * Constructor for the JobStatusClient class.
     * Initializes the RedisManager instance.
     */
    constructor() {
        this.redis_manager = new RedisManager();
    }
    /**
     * Accepting a job will generate a new Uuid and set a status of Type JobStatus to Accepted in Redis.
     *
     * @returns A Promise that resolves to a JobStatusResponse containing the generated job id and status.
     */
    async accept_job() {
        // Create a job id
        const id = uuidv4();
        const job_status = { kind: "Accepted" };
        return this.set_status(id, job_status);
    }
    /**
     * Sets the status for a specific job in Redis.
     *
     * @param id The job id.
     * @param status The JobStatus to set.
     * @returns A Promise that resolves to a JobStatusResponse containing the job id and status.
     */
    async set_status(id, status) {
        const result = await this.redis_manager?.set_in_redis(id, status?.kind || "");
        if (result !== "OK") {
            status.kind = "Error";
        }
        return new JobStatusResponse(id, status);
    }
    /**
     * Gets the status for a specific job from Redis.
     *
     * @param id The job id.
     * @returns A Promise that resolves to a JobStatusResponse containing the job id and status.
     */
    async get_status(id) {
        let status = await this.redis_manager?.get_from_redis(id);
        return new JobStatusResponse(id, status);
    }
    /**
     * Gets the associated job status from Redis as JSON.
     *
     * @param id The job id.
     * @returns A Promise that resolves to a JSON string representing the job status.
     */
    async get_job_status_json(id) {
        const status = await this.get_status(id);
        const response_json = {
            id: status.id,
            status: status.status?.kind
        };
        return JSON.stringify(response_json);
    }
    /**
     * Gets the associated job status from Redis as XML.
     *
     * @param id The job id.
     * @returns A Promise that resolves to an XML string representing the job status.
     */
    async get_job_status_xml(id) {
        const status = await this.get_status(id);
        const options = { compact: true, ignoreComment: true, spaces: 4 };
        const response_xml = {
            id: status.id,
            status: status.status?.kind
        };
        return xmljs.js2xml(response_xml, options);
    }
}
