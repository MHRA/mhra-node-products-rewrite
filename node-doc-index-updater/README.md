# About the node-doc-index-updater service

- A medical writer accesses the PARs portal and enters metadata and supplies a PDF file
- the upload form submits the metadata and the file to the doc-index-updater
- the doc-index-updater responds to the upload form with a job id for tracking the job status
- the doc-index-updater uploads the PDF file to a blob storage container in Azure for temporary storage with a prefix of temp/
- the doc-index-updater pushes the blob information, along with the submitted metadata, to the Azure Service Bus "create" queue to be picked up by the doc-index-updater's create_manager service worker
- the create_manager service worker retrieves the message from the Azure Service Bus queue, and uses the metadata and temporary blob storage details to add the new PAR PDF to the search service index and permanent blob storage
- The new PAR PDF will then be available from the products.mhra.gov.uk website.

# Running the application

- ENSURE relevant .env file exists using the .env.example file if needed.
- Build and run the app - npm run start