import cron from "node-cron";
//The cache service is responsible for serving common requests, e.g. the facetted substances search.
//Rather than operating, we will just run a cron jab that makes all relevant faceted services every 5minutes in the background.
//This should ensure next to instant results when the user is browsing the substance facets (and should aim to get similar response times compared to the old rust system)
export class CacheService {
    //Run the create queue every 10minutes
    create_manager_create_cron_job(time_to_wait) {
        cron.schedule("0 */3 * * *", async () => {
            // await this.create_manager.run_create_queue();
        });
    }
}
