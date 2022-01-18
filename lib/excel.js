const Excel = require('exceljs');
var Docs = require('./docgeneration.js');
// statistics service
var statisticsService = require('./statistics.js');
var Findings = require('./findings.js');
var Recommendations = require('./auditrec.js');

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
    //Risk heat matrix
    workbook = GenerateWorksheetPlanMatrix(workbook, fileid, selectedLang);

    //Domain Characterization
    workbook = GenerateWorksheetDomainCharacterization(workbook, fileid, selectedLang);
    workbook = GenerateWorksheetRiskCharacterization(workbook, fileid, selectedLang);
    var vIdDomain='';
    for (var i=1; i<8; i++) {
        vIdDomain = '0' + i.toString();
        workbook = GenerateWorksheetSpecificDomain(workbook, fileid, vIdDomain, selectedLang);
    }

    //Findings analysis
    workbook = GenerateWorksheetFindingsCharacterization(workbook, fileid, selectedLang);
    vIdDomain='';
    for (var i=1; i<8; i++) {
        vIdDomain = '0' + i.toString();
        workbook = GenerateWorksheetSpecificFindingDomain(workbook, fileid, vIdDomain, selectedLang);
    }
    //Recommendations tracking
    workbook = GenerateWorksheetRecCharacterization(workbook, fileid, selectedLang);

    return workbook;
};

function GenerateProcedureData(fileid, selectedLang) {
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
    //Risk heat matrix
    workbook = GenerateWorksheetProcedureMatrix(workbook, fileid, selectedLang);

    return workbook;
};

function GenerateWorksheetProcedureMatrix(workbook, fileid, selectedLang){
    // create a sheet with red tab colour
    var worksheet = workbook.addWorksheet('PlanMatrix');
    var data = Docs.LoadProcedureMatrix(fileid, selectedLang);

    // Add column headers and define column keys and widths
    worksheet.columns = [
        { header: 'Domains', key: 'dom', width: 40 },
        { header: 'Domains Code', key: 'domCode', width: 20 },
        { header: 'Areas', key: 'ar', width: 40 },
        { header: 'Areas Code', key: 'arCode', width: 20 },
        { header: 'Issues', key: 'is', width: 40 },
        { header: 'Issues Code', key: 'isCode', width: 20 },
        { header: 'Procedures', key: 'pr', width: 40 },
        { header: 'Procedures Code', key: 'prCode', width: 20 },
        { header: 'Description', key: 'prCode', width: 40 }
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
                    data.Domains[i].code,
                    data.Domains[i].Areas[j].Area,
                    data.Domains[i].Areas[j].code,
                    data.Domains[i].Areas[j].Issues[k].Issue,
                    data.Domains[i].Areas[j].Issues[k].code,
                    data.Domains[i].Areas[j].Issues[k].procedure,
                    data.Domains[i].Areas[j].Issues[k].prcode,
                    data.Domains[i].Areas[j].Issues[k].description
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
    worksheet.getCell('G1').font = {
        bold: true
    };
    worksheet.getCell('H1').font = {
        bold: true
    };
    worksheet.getCell('I1').font = {
        bold: true
    };

    return workbook;
};


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
    var worksheet = workbook.addWorksheet('DomainImportance');
    var data = statisticsService.GeneralDomainCharacterization(fileid, selectedLang);

    // Add column headers and define column keys and widths
    worksheet.columns = [
        { header: 'Axis', key: 'dom01', width: 60 },
        { header: 'Number', key: 'dom01', width: 20 },
        { header: 'Importance', key: 'dom02', width: 20 }
    ];

    var ExcelRows = [];

    if (data.wNumber.length > 0){
        var vNumbers = data.wNumber.split(',');
        var vImportance = data.wImportance.split(',');

        var newRec = ['01 IT Governance', vNumbers[0], vImportance[0]];
        ExcelRows.push(newRec);
        newRec = ['02 IT Operations', vNumbers[1], vImportance[1]];
        ExcelRows.push(newRec);
        var newRec = ['03 Development and Acquisition', vNumbers[2], vImportance[2]];
        ExcelRows.push(newRec);
        newRec = ['04 Outsourcing', vNumbers[3], vImportance[3]];
        ExcelRows.push(newRec);
        var newRec = ['05 Information Security', vNumbers[4], vImportance[4]];
        ExcelRows.push(newRec);
        newRec = ['06 BCP-DRP', vNumbers[5], vImportance[5]];
        ExcelRows.push(newRec);
        newRec = ['07 Application Controls', vNumbers[6], vImportance[6]];
        ExcelRows.push(newRec);

        worksheet.addRows(ExcelRows);
    };

    worksheet.getCell('A1').font = {
        bold: true
    };
    worksheet.getCell('B1').font = {
        bold: true
    };
    worksheet.getCell('C1').font = {
        bold: true
    };

    return workbook;
};

function GenerateWorksheetRiskCharacterization(workbook, fileid, selectedLang){
    // create a sheet with red tab colour
    var worksheet = workbook.addWorksheet('RiskCharacterization');
    var data = statisticsService.GeneralRiskCharacterization(fileid, selectedLang);

    // Add column headers and define column keys and widths
    worksheet.columns = [
        { header: 'Low', key: 'low', width: 20 },
        { header: 'Medium', key: 'medium', width: 20 },
        { header: 'High', key: 'high', width: 20 }
    ];

    var ExcelRows = [];
    var newRec = data.wImportance.split(',');
    ExcelRows.push(newRec);
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

    return workbook;
};

function GenerateWorksheetSpecificDomain(workbook, fileid, DomainCode, selectedLang){
    // create a sheet with red tab colour
    var worksheet = workbook.addWorksheet('Domain' + DomainCode + 'Importance');
    var data = statisticsService.SpecificDomainCharacterization(fileid, DomainCode, selectedLang);

    // Add column headers and define column keys and widths
    var vHeaders = [
        { header: 'Axis', key: 'dom01', width: 20 },
        { header: 'Number', key: 'dom02', width: 20 },
        { header: 'Importance', key: 'dom03', width: 20 }
    ];

    worksheet.columns = vHeaders;
    var ExcelRows = [];

    if (data.wNumber.length > 0){
        var j=0;
        var vNumbers = data.wNumber.split(',');
        var vImportance = data.wImportance.split(',');

        data.labels.split("|").forEach(function(item) {
            var newRec = [item, vNumbers[j], vImportance[j]];
            ExcelRows.push(newRec);
            j++;
        });

        worksheet.addRows(ExcelRows);
    };

    return workbook;
};

function GenerateWorksheetFindingsCharacterization(workbook, fileid, selectedLang){
    // create a sheet with red tab colour
    var worksheet = workbook.addWorksheet('FindingsGeneral');
    var data = Findings.FindingsForGeneralDomainsAnalysis(fileid, selectedLang);

    // Add column headers and define column keys and widths
    var vHeaders  = [
        { header: 'Axis', key: 'dom01', width: 20 },
        { header: 'Number', key: 'dom02', width: 20 },
        { header: 'Relevant', key: 'dom03', width: 20 }
    ];

    worksheet.columns = vHeaders;
    var ExcelRows = [];

    if (data.wNumber.length > 0){
        var j=0;
        var vNumbers = data.wNumber.split(',');
        var vRelevant = data.wRelevant.split(',');
        data.wLabels.split("|").forEach(function(item) {
            var newRec = [item, vNumbers[j], vRelevant[j]];
            ExcelRows.push(newRec);
            j++;
        });

        worksheet.addRows(ExcelRows);
    };

    return workbook;
};

function GenerateWorksheetSpecificFindingDomain(workbook, fileid, DomainCode, selectedLang){
    // create a sheet with red tab colour
    var worksheet = workbook.addWorksheet('Domain' + DomainCode + 'Findings');
    var data = Findings.FindingsForSpecificDomainsAnalysis(fileid, DomainCode, selectedLang);

    // Add column headers and define column keys and widths
    var vHeaders  = [
        { header: 'Axis', key: 'dom01', width: 20 },
        { header: 'Number', key: 'dom02', width: 20 },
        { header: 'Relevant', key: 'dom03', width: 20 }
    ];

    worksheet.columns = vHeaders;
    var ExcelRows = [];

    if (data.wNumber.length > 0){
        var j=0;
        var vNumbers = data.wNumber.split(',');
        var vRelevant = data.wRelevant.split(',');

        data.wLabels.split("|").forEach(function(item) {
            var newRec = [item, vNumbers[j], vRelevant[j]];
            ExcelRows.push(newRec);
            j++;
        });

        worksheet.addRows(ExcelRows);
    };

    return workbook;
};

function GenerateWorksheetRecCharacterization(workbook, fileid, selectedLang){
    var data = Recommendations.LoadAuditRecommendationsForAnalysis(fileid, selectedLang);
    var vHeaders  = [
        { header: 'Axis', key: 'dom01', width: 20 },
        { header: 'Number', key: 'dom02', width: 20 }
    ];

    // create a sheet RecRiskAreas
    var worksheet = workbook.addWorksheet('RecRiskAreas');
    // Add column headers and define column keys and widths
    worksheet.columns = [];
    worksheet.columns = vHeaders;
    var ExcelRows = [];    
    data.StatCharacterization.forEach(function(item) {
        var newRec = [item.Risk, item.Number];
        ExcelRows.push(newRec);
    });
    worksheet.addRows(ExcelRows);

    // create a sheet RecImportance
    var worksheet = workbook.addWorksheet('RecImportance');
    // Add column headers and define column keys and widths
    worksheet.columns = [];
    worksheet.columns = vHeaders;
    var ExcelRows = [];    
    data.StatImportance.forEach(function(item) {
        var newRec = [item.Importance, item.Number];
        ExcelRows.push(newRec);
    });
    worksheet.addRows(ExcelRows);

    // create a sheet RecPriority
    var worksheet = workbook.addWorksheet('RecPriority');
    // Add column headers and define column keys and widths
    worksheet.columns = [];
    worksheet.columns = vHeaders;
    var ExcelRows = [];    
    data.StatPriorities.forEach(function(item) {
        var newRec = [item.Priority, item.Number];
        ExcelRows.push(newRec);
    });
    worksheet.addRows(ExcelRows);

    // create a sheet RecRepeated
    var worksheet = workbook.addWorksheet('RecRepeated');
    // Add column headers and define column keys and widths
    worksheet.columns = [];
    worksheet.columns = vHeaders;
    var ExcelRows = [];    
    var newRec = ['Total', data.NumberOfRecommendations];
    ExcelRows.push(newRec);
    newRec = ['New', data.NumberOfNewRecommendations];
    ExcelRows.push(newRec);
    newRec = ['Repeated', data.NumberOfRepRecommendations];
    ExcelRows.push(newRec);
    newRec = ['Partially Rep', data.NumberOfPartRecommendations];
    ExcelRows.push(newRec);
    worksheet.addRows(ExcelRows);

    // create a sheet RecStatus
    var worksheet = workbook.addWorksheet('RecStatus');
    // Add column headers and define column keys and widths
    worksheet.columns = [];
    worksheet.columns = vHeaders;
    var ExcelRows = [];    
    data.StatStatus.forEach(function(item) {
        var newRec = [item.Status, item.Number];
        ExcelRows.push(newRec);
    });
    worksheet.addRows(ExcelRows);

    // create a sheet RecType
    var worksheet = workbook.addWorksheet('RecType');
    // Add column headers and define column keys and widths
    worksheet.columns = [];
    worksheet.columns = vHeaders;
    var ExcelRows = [];    
    data.StatLevel.forEach(function(item) {
        var newRec = [item.Level, item.Number];
        ExcelRows.push(newRec);
    });
    worksheet.addRows(ExcelRows);

    return workbook;
};


module.exports.GenerateMethologicalMatrix = GenerateMethologicalMatrix;
module.exports.GenerateRawData = GenerateRawData;
module.exports.GenerateProcedureData = GenerateProcedureData;