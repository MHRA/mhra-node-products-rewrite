import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { AuthManager } from "./auth.js";
import { CronManagerService } from "./cron_service/cron_manager.js";
import { parseString } from "xml2js";
import { DocumentManager } from "./document_manager/document.js";
import { ParsService } from "./pars.js";
import multer from 'multer';
import { JobStatusClient } from "./state_manager/state.js";
import { DeleteManager } from "./delete_manager/delete.js";
dotenv.config();
if (!process.env.PORT) {
    process.exit(1);
}
const PORT = parseInt(process.env.PORT, 10);
const authentication = new AuthManager();
async function main() {
    //create express instance
    const app = express();
    //configure express settings
    configure_app(app);
    //register endpoints (replacement for the rust's warp::serve)
    register_endpoints(app);
    //register cron job service (replacement for the service workers from the rust application)
    await register_cron_jobs();
    //Start our server
    await start_server(app, PORT);
}
//Configures the express application.
const configure_app = (app) => {
    app.use(helmet());
    app.use(cors());
    // Allows express to parse json in the request body
    app.use(express.json());
    // Allows express to parse xml in request body
    app.use(express.text({ type: 'application/xml' }));
    // Middleware to check for authorization credentials on request header.
    app.use(function (req, res, next) {
        console.log("req.headers.authorization is ", req.headers.authorization);
        if (!req.headers.authorization || !authentication.attempt_basic_auth(req.headers.authorization)) {
            return res.status(403).json({ error: 'There was a problem authorizing your request.' });
        }
        next();
    });
};
/*
Registers endpoints to be used in the express application.
*/
const register_endpoints = (app) => {
    const document_manager = new DocumentManager();
    const pars_service = new ParsService();
    const job_status_client = new JobStatusClient();
    const delete_manager = new DeleteManager();
    // Use multer to pars multipart form data and store in the current memory buffer
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });
    // GET method route
    app.get('/', async (req, res) => {
        res.send('OKAY');
    });
    // GET method for Healthz route to confirm status of application
    app.get('/healthz', (req, res) => {
        res.send('1');
    });
    // Job status endpoint -> Gets the status of a job from redis.
    app.get('/jobs/:jobId', async (req, res) => {
        const job_id = req.params.jobId;
        if (req.headers.accept == "application/xml") {
            res.set('Content-Type', 'text/xml');
            const job_status_xml = await job_status_client.get_job_status_xml(job_id);
            res.send(job_status_xml);
        }
        else {
            res.set('Content-Type', 'application/json');
            const job_status_json = await job_status_client.get_job_status_json(job_id);
            res.send(job_status_json);
        }
    });
    // PARS endpoint -> upload a new pars document.
    app.post('/pars', upload.single('file'), async (req, res) => {
        console.log("Request body is ", req.body);
        console.log("Form data is ", req.file.buffer);
        const username = req.headers["username"];
        const pars_upload = await pars_service.queue_pars_upload(req.body, req.file.buffer, username);
        res.send(pars_upload);
    });
    // PARS endpoint -> update an existing pars document.
    app.post('/pars/:blob', upload.single('file'), async (req, res) => {
        const blobId = req.params.blob;
        //We need to know the original filename that is sat in blob storage
        if (blobId == "" || blobId == null) {
            return res.status(404).json({ error: 'Invalid file name' });
        }
        console.log("Request body is ", req.body);
        console.log("Form data is ", req.file.buffer);
        const username = req.headers["username"];
        //get original job id / blob metadata name path. Used to delete the original item from the index.
        const pars_upload = await pars_service.queue_pars_update(req.body, req.file.buffer, username, blobId);
        res.send(pars_upload);
    });
    // Document POST
    app.post('/documents', (req, res) => {
        console.log("request body is ", req.body);
        const username = req.headers["username"];
        if (req.headers["content-type"] == "application/xml") {
            res.set('Content-Type', 'text/xml');
            //the doc-index-updater responds to the upload form with a job id for tracking the job status
            parseString(req.body, async (err, result) => {
                if (err) {
                    res.status(400).send("Invalid XML data - " + err.message);
                    return;
                }
                const document = {
                    id: result.document.id,
                    name: result.document.name,
                    doc_type: result.document.type,
                    author: result.document.author,
                    products: result.document.products,
                    pl_number: result.document.pl_number,
                    keywords: result.document.keywords,
                    active_substances: result.document.active_substances,
                    file_path: result.document.file_path,
                    file_source: result.document.file_source,
                };
                //respond with job id for the tracking the job status -> which is then "stored" in the redis cache
                const doc_upload = await document_manager.check_in_xml_document(document, "CREATE", username);
                res.send(doc_upload);
            });
        }
        else {
            res.set('Content-Type', 'application/json');
            res.send("Data received JSON");
        }
    });
    // Document delete
    app.delete("/documents/:id", async (req, res) => {
        console.log("Request body is ", req.body);
        parseString(req.body, async (err, result) => {
            const username = "pars-upload-management-api";
            const document_id = req.params.id;
            console.log("Delete document id is ", document_id);
            const status = await delete_manager.check_in_delete_request(username, document_id);
            console.log("Delete status is ", status);
            if (req.headers.accept == "application/xml") {
                res.set('Content-Type', 'text/xml');
                const job_status_xml = await job_status_client.get_job_status_xml(status);
                res.send(job_status_xml);
            }
            else {
                res.set('Content-Type', 'application/json');
                delete_manager.check_in_delete_request(username, document_id);
                const job_status_json = await job_status_client.get_job_status_json(status);
                res.send(job_status_json);
            }
        });
    });
};
//Register our cron jobs which will be used to process messages in the relevant queue.
const register_cron_jobs = async () => {
    const cron_time_to_wait = {
        create_manager_create: process.env.SECONDS_TO_WAIT,
        create_manager_create_clean: process.env.SECONDS_TO_WAIT * 10,
        delete_manager_create: process.env.SECONDS_TO_WAIT,
        delete_manager_create_clean: process.env.SECONDS_TO_WAIT * 10,
    };
    const cron_service = new CronManagerService(cron_time_to_wait);
    await cron_service.execute();
};
//Starts our express server after configuring the relevant middleware, endpoints and settings
const start_server = (app, port) => {
    return new Promise((resolve) => {
        app.listen(port, () => {
            console.log(`Starting Express server on http://localhost:${port}`);
            resolve();
        });
    });
};
await main();
