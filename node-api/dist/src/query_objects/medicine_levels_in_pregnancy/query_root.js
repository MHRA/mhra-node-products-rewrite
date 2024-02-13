import { AzureContext } from "../../azure_context.js";
import { Report, ReportEdge, Reports, SubstanceIndex, SubstanceReports } from "../../__generated__/resolvers-types.js";
export class MedicineLevelsInPregnancyDataSource {
    // The default instance of an AzureSearchClient will search against the products-index
    // Create an instance of the axios client specifying Auth Header Key
    constructor() {
        this.Context = new AzureContext(process.env.AZURE_SEARCH_INDEX, process.env.AZURE_SEARCH_BMGF_INDEX);
    }
    async reports_associated_with_substance(substance_name) {
        const substance_report = new SubstanceReports();
        substance_report.name = substance_name;
        const report = new Reports();
        const report_edges = [];
        const bmgf_result_substance_reports = await this.Context.bmgf_client
            .build_full_search_with_filter_operator("active_substances", substance_name, "eq", "substance");
        report.totalCount = bmgf_result_substance_reports["@odata.count"];
        const data = bmgf_result_substance_reports.value;
        data.map(result => {
            let edge = new ReportEdge();
            let report = new Report();
            report.products = result.products;
            report.activeSubstances = result.active_substances;
            report.title = result.title;
            report.highlights = result.highlights;
            report.fileSizeInBytes = result.metadata_storage_size;
            report.fileName = result.file_name;
            report.fileUrl = result.metadata_storage_path;
            report.summary = result.summary;
            report.matrices = result.matrices;
            report.plNumbers = result.pl_numbers;
            report.pregnancyTrimesters = result.pregnancy_trimesters;
            report.pbpkModels = result.pbpk_models;
            edge.node = report;
            report_edges.push(edge);
        });
        report.edges = report_edges;
        substance_report.reports = report;
        return substance_report;
    }
    async get_report_count_against_substance_index(letter) {
        const facet_search = await this.Context.bmgf_client.build_facet_search("facets", letter, "eq");
        //Filter results to only get the the facet results of the query
        return this.format_index_search_results(facet_search, letter);
    }
    async get_pregnancy_reports_search(search, first, skip, after) {
        const reports = new Reports();
        const report_edges = new Array();
        const query_string = `&highlight=content&queryType=full&search=${search}&scoringProfile=preferKeywords&searchMode=all&$count=true&$top=10&$skip=0`;
        const search_data = await this.Context.bmgf_client
            .build_search(query_string);
        reports.totalCount = search_data["@odata.count"];
        search_data.value.map(result => {
            let edge = new ReportEdge();
            let report = new Report();
            report.products = result.products;
            report.activeSubstances = result.active_substances;
            report.title = result.file_name;
            report.highlights = result.highlights;
            report.fileSizeInBytes = result.metadata_storage_size;
            report.fileName = result.file_name;
            report.fileUrl = result.metadata_storage_path;
            report.summary = result.summary;
            report.matrices = result.matrices;
            report.plNumbers = result.pl_numbers;
            report.pregnancyTrimesters = result.pregnancy_trimesters;
            report.pbpkModels = result.pbpk_models;
            edge.node = report;
            report_edges.push(edge);
        });
        reports.edges = report_edges;
        return reports;
    }
    format_index_search_results(results, letter) {
        const filteredResults = results["@search.facets"].facets
            .filter(x => x.value.startsWith(letter))
            .map(x => {
            let facets = x.value.split(',');
            if (facets.length != 2) {
                return;
            }
            const substance = facets[1];
            const substanceIndex = new SubstanceIndex();
            substanceIndex.count = parseInt(x.count.toString());
            substanceIndex.name = substance.trim();
            return substanceIndex;
        });
        return filteredResults.filter(x => x != undefined);
    }
}
