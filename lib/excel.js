const Excel = require('exceljs');
var Docs = require('./docgeneration.js');
// statistics service
var statisticsService = require('./statistics.js');

function GenerateMethologicalMatrix(data) {

    const workbook = new Excel.Workbook();

    //configure workbook properties
    workbook.creator = 'AITAM';
    workbook.lastModifiedBy = 'AITAM';
    workbook.created = new Date();
    workbook.modified = new Date();
    //Set workbook dates to 1904 date system
    workbook.properties.date1904 = true;
    //Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;
    //configure workbook views
    workbook.views = [
        {
            x: 0, y: 0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 1, visibility: 'visible'
        }
    ];

    // create a sheet with red tab colour
    const worksheet = workbook.addWorksheet('Matrix');

    // Add column headers and define column keys and widths
    worksheet.columns = [
        { header: 'Domains', key: 'dom', width: 40 },
        { header: 'Areas', key: 'ar', width: 40 },
        { header: 'Issues', key: 'is', width: 40 },
        { header: 'Audit question', key: 'asq', width: 40 },
        { header: 'Audit Criteria', key: 'crit', width: 40},
        { header: 'Source of information / Audit evidence', key: 'src', width: 40},
        { header: 'Method and analysis', key: 'mtd', width: 40}
    ];

    var ExcelRows = [];
    var aRange = [];

    var vDomRangeBeg = 0;
    var vDomRangeEnd = 1;

    var vAreaRangeBeg = 0;
    var vAreaRangeEnd = 1;

    var vIssuesCount = 0;

    for (var i=0; i<data.Domains.length; i++) {
        vIssuesCount = 0;
        for (var j=0; j<data.Domains[i].Areas.length; j++) {
            vIssuesCount = vIssuesCount + data.Domains[i].Areas[j].Issues.length; 
            for (var k=0; k<data.Domains[i].Areas[j].Issues.length; k++) {
                var newRec = [
                    data.Domains[i].Domain,
                    data.Domains[i].Areas[j].Area,
                    data.Domains[i].Areas[j].Issues[k].Issue,
                    data.Domains[i].Areas[j].Issues[k].Objectives,
                    data.Domains[i].Areas[j].Issues[k].Criteria,
                    data.Domains[i].Areas[j].Issues[k].Inforequired,
                    data.Domains[i].Areas[j].Issues[k].Method
                ];
                // Add an array of rows
                ExcelRows.push(newRec);
            };
            if (vAreaRangeBeg == 0) {
                vAreaRangeBeg = 2;
            } else {
                vAreaRangeBeg = vAreaRangeEnd + 1;
            };
            vAreaRangeEnd = vAreaRangeBeg + data.Domains[i].Areas[j].Issues.length - 1;    
            aRange.push('B'+ vAreaRangeBeg.toString()+':B' + vAreaRangeEnd.toString());
        };
        if (vDomRangeBeg == 0) {
            vDomRangeBeg = 2;
        } else {
            vDomRangeBeg = vDomRangeEnd + 1;
        };
        vDomRangeEnd = vDomRangeBeg + vIssuesCount - 1;
        aRange.push('A'+ vDomRangeBeg.toString()+':A' + vDomRangeEnd.toString());
    };

    worksheet.addRows(ExcelRows);
    worksheet.getCell('A1').font = {
        bold: true
    };
    worksheet.getCell('B1').font = {
        bold: true
    };
    worksheet.getCell('C1').font = {
        bold: true
    };
    worksheet.getCell('D1').font = {
        bold: true
    };
    worksheet.getCell('E1').font = {
        bold: true
    };
    worksheet.getCell('F1').font = {
        bold: true
    };
    worksheet.getCell('G1').font = {
        bold: true
    };

    for (var i=0; i<aRange.length; i++) {
        worksheet.mergeCells(aRange[i]);
        worksheet.getCell(aRange[i].split(":")[0]).alignment = { vertical: 'top', horizontal: 'left' };
    };

    return workbook;
    //workbook.xlsx.writeFile(NewDocFile);
};

function GenerateRawData(fileid, selectedLang) {
    var workbook = new Excel.Workbook();

    //configure workbook properties
    workbook.creator = 'AITAM';
    workbook.lastModifiedBy = 'AITAM';
    workbook.created = new Date();
    workbook.modified = new Date();
    //Set workbook dates to 1904 date system
    workbook.properties.date1904 = true;
    //Force workbook calculation on load
    workbook.calcProperties.fullCalcOnLoad = true;
    //configure workbook views
    workbook.views = [
        {
            x: 0, y: 0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 1, visibility: 'visible'
        }
    ];
    workbook = GenerateWorksheetPlanMatrix(workbook, fileid, selectedLang);
    workbook = GenerateWorksheetDomainCharacterization(workbook, fileid, selectedLang);

    //return workbook;
};

/*
var GeneralRiskCatalog = statisticsService.GeneralRiskCharacterization(NewAuditFile, req.session.lang);
var Domain01Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '01', req.session.lang);
var Domain02Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '02', req.session.lang);
var Domain03Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '03', req.session.lang);
var Domain04Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '04', req.session.lang);
var Domain05Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '05', req.session.lang);
var Domain06Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '06', req.session.lang);
var Domain07Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '07', req.session.lang);
*/

function GenerateWorksheetPlanMatrix(workbook, fileid, selectedLang){
    // create a sheet with red tab colour
    var worksheet = workbook.addWorksheet('PlanMatrix');
    var data = Docs.LoadPlanHeatMatrix(fileid, selectedLang);

    // Add column headers and define column keys and widths
    worksheet.columns = [
        { header: 'Domains', key: 'dom', width: 40 },
        { header: 'Domains Risk', key: 'domRisk', width: 40 },
        { header: 'Areas', key: 'ar', width: 40 },
        { header: 'Areas Risk', key: 'arRisk', width: 40 },
        { header: 'Issues', key: 'is', width: 40 },
        { header: 'Issues Risk', key: 'isRisk', width: 40 }
    ];

    var ExcelRows = [];

    var vIssuesCount = 0;

    for (var i=0; i<data.Domains.length; i++) {
        vIssuesCount = 0;
        for (var j=0; j<data.Domains[i].Areas.length; j++) {
            vIssuesCount = vIssuesCount + data.Domains[i].Areas[j].Issues.length; 
            for (var k=0; k<data.Domains[i].Areas[j].Issues.length; k++) {
                var newRec = [
                    data.Domains[i].Domain,
                    data.Domains[i].risk,
                    data.Domains[i].Areas[j].Area,
                    data.Domains[i].Areas[j].risk,
                    data.Domains[i].Areas[j].Issues[k].Issue,
                    data.Domains[i].Areas[j].Issues[k].risk
                ];
                // Add an array of rows
                ExcelRows.push(newRec);
            };
        };
    };

    worksheet.addRows(ExcelRows);
    worksheet.getCell('A1').font = {
        bold: true
    };
    worksheet.getCell('B1').font = {
        bold: true
    };
    worksheet.getCell('C1').font = {
        bold: true
    };
    worksheet.getCell('D1').font = {
        bold: true
    };
    worksheet.getCell('E1').font = {
        bold: true
    };
    worksheet.getCell('F1').font = {
        bold: true
    };

    return workbook;
};

function GenerateWorksheetDomainCharacterization(workbook, fileid, selectedLang){
    // create a sheet with red tab colour
    var worksheet = workbook.addWorksheet('PlanMatrix');
    var data = statisticsService.GeneralDomainCharacterization(fileid, selectedLang);

    // Add column headers and define column keys and widths
    worksheet.columns = [
        { header: 'Domains', key: 'dom', width: 40 },
        { header: 'Domains Risk', key: 'domRisk', width: 40 },
        { header: 'Areas', key: 'ar', width: 40 },
        { header: 'Areas Risk', key: 'arRisk', width: 40 },
        { header: 'Issues', key: 'is', width: 40 },
        { header: 'Issues Risk', key: 'isRisk', width: 40 }
    ];

    var ExcelRows = [];

    var vIssuesCount = 0;

    for (var i=0; i<data.Domains.length; i++) {
        vIssuesCount = 0;
        for (var j=0; j<data.Domains[i].Areas.length; j++) {
            vIssuesCount = vIssuesCount + data.Domains[i].Areas[j].Issues.length; 
            for (var k=0; k<data.Domains[i].Areas[j].Issues.length; k++) {
                var newRec = [
                    data.Domains[i].Domain,
                    data.Domains[i].risk,
                    data.Domains[i].Areas[j].Area,
                    data.Domains[i].Areas[j].risk,
                    data.Domains[i].Areas[j].Issues[k].Issue,
                    data.Domains[i].Areas[j].Issues[k].risk
                ];
                // Add an array of rows
                ExcelRows.push(newRec);
            };
        };
    };

    worksheet.addRows(ExcelRows);
    worksheet.getCell('A1').font = {
        bold: true
    };
    worksheet.getCell('B1').font = {
        bold: true
    };
    worksheet.getCell('C1').font = {
        bold: true
    };
    worksheet.getCell('D1').font = {
        bold: true
    };
    worksheet.getCell('E1').font = {
        bold: true
    };
    worksheet.getCell('F1').font = {
        bold: true
    };

    return workbook;
};

module.exports.GenerateMethologicalMatrix = GenerateMethologicalMatrix;
module.exports.GenerateRawData = GenerateRawData;