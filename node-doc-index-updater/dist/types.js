export var DocumentIndexRequestType;
(function (DocumentIndexRequestType) {
    DocumentIndexRequestType["UPLOAD"] = "UPLOAD";
    DocumentIndexRequestType["DELETE"] = "DELETE";
})(DocumentIndexRequestType || (DocumentIndexRequestType = {}));
export var DocumentType;
(function (DocumentType) {
    DocumentType["Par"] = "PAR";
    DocumentType["Pil"] = "PIL";
    DocumentType["Spc"] = "SPC";
})(DocumentType || (DocumentType = {}));
export var TerritoryType;
(function (TerritoryType) {
    TerritoryType["Gb"] = "GB";
    TerritoryType["Ni"] = "NI";
    TerritoryType["Uk"] = "UK";
})(TerritoryType || (TerritoryType = {}));
export var UpdateIndexType;
(function (UpdateIndexType) {
    UpdateIndexType["DELETE"] = "DELETE";
    UpdateIndexType["UPLOAD"] = "UPLOAD";
})(UpdateIndexType || (UpdateIndexType = {}));
export var FileSource;
(function (FileSource) {
    FileSource["Sentinel"] = "sentinel";
    FileSource["TemporaryAzureBlobStorage"] = "TemporaryAzureBlobStorage";
})(FileSource || (FileSource = {}));
export class JobStatusResponse {
    constructor(id, status) {
        this.id = id;
        this.status = status;
    }
}
