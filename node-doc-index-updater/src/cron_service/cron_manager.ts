import {CronManager, CronTimeToWait} from "../types.js";
import cron from "node-cron";
import {CreateManager} from "../create_manager/create.js";
import {DeleteManager} from "../delete_manager/delete.js";

/*
    The CronManager is responsible for reoccurring jobs which manage and process jobs in Redis and our Azure Service Bus.
 */
export class CronManagerService implements CronManager {
    
    private cron_time_wait: CronTimeToWait;
    private create_manager: CreateManager;
    private delete_manager: DeleteManager;

    //time to wait before the cron job runs
    constructor(cron_timings: CronTimeToWait) {
        this.cron_time_wait = cron_timings;
        this.create_manager = new CreateManager();
        this.delete_manager = new DeleteManager();
    }

    //Run the create queue every 10minutes
    async create_manager_create_cron_job(time_to_wait: Number): Promise<void> {
        cron.schedule("0 */10 * * *", async () => {
            console.log("Running create manager.");
            await this.create_manager.run_create_queue();
        });
    }
    
    //Cleanup the create queue every 10minutes
    async create_manager_create_clean_up_cron_job(time_to_wait: Number): Promise<void>  {
        //Try process from DLQ every 10 mins.
        cron.schedule('0 */10 * * *', async () => {
            console.log("Running create manager cleanup.");
            await this.create_manager.run_queue_cleanup();
        });
    }

    //Run the delete queue every 10 minutes
    async delete_manager_delete_cron_job(time_to_wait: Number): Promise<void>  {
        cron.schedule('0 */10 * * *', async () => {
            console.log("Running delete manager.");
            await this.delete_manager.run_delete_queue();
        });
    }

    //Clean up the delete message queue every 10minutes
    async delete_manager_delete_clean_up_cron_job(time_to_wait: Number): Promise<void>  {
        cron.schedule('0 */10 * * *', async () => {
            console.log("Running delete manager cleanup.");
            await this.delete_manager.run_queue_cleanup();
        });
    }
    
    //Register our cron jobs which will be used to process messages in the relevant queue.
    async execute(): Promise<void> {
        await this.create_manager_create_cron_job(this.cron_time_wait.create_manager_create);
        await this.create_manager_create_clean_up_cron_job(this.cron_time_wait.create_manager_create_clean);
        await this.delete_manager_delete_cron_job(this.cron_time_wait.delete_manager_create);
        await this.delete_manager_delete_clean_up_cron_job(this.cron_time_wait.delete_manager_create_clean);
    }

}