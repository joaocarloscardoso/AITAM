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
        { header: 'Axis', key: 'dom01', width: 20 },
        { header: '01 IT Governance', key: 'dom01', width: 40 },
        { header: '02 IT Operations', key: 'dom02', width: 40 },
        { header: '03 Development and Acquisition', key: 'dom03', width: 40 },
        { header: '04 Outsourcing', key: 'dom04', width: 40 },
        { header: '05 Information Security', key: 'dom05', width: 40 },
        { header: '06 BCP-DRP', key: 'dom06', width: 40 },
        { header: '07 Application Controls', key: 'dom07', width: 40 }
    ];

    var ExcelRows = [];

    var vIssuesCount = 0;

    if (data.wNumber.length > 0){
        var newRec = [
            'Number',
        ];

        var vNumbers = data.wNumber.split(',');
        for (var i=0; i<vNumbers.length; i++) {
            newRec.push(vNumbers[i]);
        };
        ExcelRows.push(newRec);

        var newRec = [
            'Importance',
        ];

        vNumbers = data.wImportance.split(',');
        for (var i=0; i<vNumbers.length; i++) {
            newRec.push(vNumbers[i]);
        };
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
        { header: 'Axis', key: 'dom01', width: 20 }
    ];

    var j=1;
    data.labels.split("|").forEach(function(item) {
        var vHeader = {header: item, 
            key: 'v' + j.toString(), 
            width: 40
        }
        vHeaders.push(vHeader);
        j++;
    });

    worksheet.columns = vHeaders;
    var ExcelRows = [];

    if (data.wNumber.length > 0){
        var newRec = [
            'Number',
        ];

        var vNumbers = data.wNumber.split(',');
        for (var i=0; i<vNumbers.length; i++) {
            newRec.push(vNumbers[i]);
        };
        ExcelRows.push(newRec);

        var newRec = [
            'Importance',
        ];

        vNumbers = data.wImportance.split(',');
        for (var i=0; i<vNumbers.length; i++) {
            newRec.push(vNumbers[i]);
        };
        ExcelRows.push(newRec);

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
        { header: 'Axis', key: 'dom01', width: 20 }
    ];

    var j=1;
    data.wLabels.split("|").forEach(function(item) {
        var vHeader = {header: item, 
            key: 'v' + j.toString(), 
            width: 40
        }
        vHeaders.push(vHeader);
        j++;
    });
    worksheet.columns = vHeaders;
    var ExcelRows = [];

    if (data.wNumber.length > 0){
        var newRec = [
            'Number',
        ];

        var vNumbers = data.wNumber.split(',');
        for (var i=0; i<vNumbers.length; i++) {
            newRec.push(vNumbers[i]);
        };
        ExcelRows.push(newRec);

        var newRec = [
            'Relevant',
        ];

        vNumbers = data.wRelevant.split(',');
        for (var i=0; i<vNumbers.length; i++) {
            newRec.push(vNumbers[i]);
        };
        ExcelRows.push(newRec);

        worksheet.addRows(ExcelRows);
    };

    return workbook;
};

function GenerateWorksheetSpecificFindingDomain(workbook, fileid, DomainCode, selectedLang){
    // create a sheet with red tab colour
    var worksheet = workbook.addWorksheet('Domain' + DomainCode + 'Findings');
    var data = Findings.FindingsForSpecificDomainsAnalysis(fileid, DomainCode, selectedLang);

    // Add column headers and define column keys and widths
    var vHeaders = [
        { header: 'Axis', key: 'dom01', width: 20 }
    ];

    var j=1;
    data.wLabels.split("|").forEach(function(item) {
        var vHeader = {header: item, 
            key: 'v' + j.toString(), 
            width: 40
        }
        vHeaders.push(vHeader);
        j++;
    });
    worksheet.columns = vHeaders;
    var ExcelRows = [];

    if (data.wNumber.length > 0){
        var newRec = [
            'Number',
        ];

        var vNumbers = data.wNumber.split(',');
        for (var i=0; i<vNumbers.length; i++) {
            newRec.push(vNumbers[i]);
        };
        ExcelRows.push(newRec);

        var newRec = [
            'Importance',
        ];

        vNumbers = data.wRelevant.split(',');
        for (var i=0; i<vNumbers.length; i++) {
            newRec.push(vNumbers[i]);
        };
        ExcelRows.push(newRec);

        worksheet.addRows(ExcelRows);
    };

    return workbook;
};

function GenerateWorksheetRecCharacterization(workbook, fileid, selectedLang){
    var data = Recommendations.LoadAuditRecommendationsForAnalysis(fileid, selectedLang);
    var j=1;

    
    // create a sheet RecRiskAreas
    var worksheet = workbook.addWorksheet('RecRiskAreas');
    // Add column headers and define column keys and widths
    worksheet.columns = [];
    j=1;
    var vHeaders=[];
    data.StatCharacterization.forEach(function(item) {
        var vHeader = {header: item.Risk, 
            key: 'v' + j.toString(), 
            width: 20
        }
        vHeaders.push(vHeader);
        j++;
    });
    worksheet.columns = vHeaders;
    var ExcelRows = [];
    var newRec = [];
    data.StatCharacterization.forEach(function(item) {
        newRec.push(item.Number);
    });
    ExcelRows.push(newRec);
    worksheet.addRows(ExcelRows);

    // create a sheet RecImportance
    var worksheet = workbook.addWorksheet('RecImportance');
    // Add column headers and define column keys and widths
    worksheet.columns = [];
    j=1;
    vHeaders=[];
    data.StatImportance.forEach(function(item) {
        var vHeader = {header: item.Importance, 
            key: 'v' + j.toString(), 
            width: 20
        }
        vHeaders.push(vHeader);
        j++;
    });
    worksheet.columns = vHeaders;
    var ExcelRows = [];
    var newRec = [];
    data.StatImportance.forEach(function(item) {
        newRec.push(item.Number);
    });
    ExcelRows.push(newRec);
    worksheet.addRows(ExcelRows);

    // create a sheet RecPriority
    var worksheet = workbook.addWorksheet('RecPriority');
    // Add column headers and define column keys and widths
    worksheet.columns = [];
    j=1;
    vHeaders=[];
    data.StatPriorities.forEach(function(item) {
        var vHeader = {header: item.Priority, 
            key: 'v' + j.toString(), 
            width: 20
        }
        vHeaders.push(vHeader);
        j++;
    });
    worksheet.columns = vHeaders;
    var ExcelRows = [];
    var newRec = [];
    data.StatPriorities.forEach(function(item) {
        newRec.push(item.Number);
    });
    ExcelRows.push(newRec);
    worksheet.addRows(ExcelRows);

    // create a sheet RecRepeated
    var worksheet = workbook.addWorksheet('RecRepeated');
    // Add column headers and define column keys and widths
    worksheet.columns = [
        { header: 'Total', key: 'Total', width: 20 },
        { header: 'New', key: 'New', width: 20 },
        { header: 'Repeated', key: 'Repeated', width: 20 },
        { header: 'Partially Rep.', key: 'Partially', width: 20 }
    ];

    var ExcelRows = [];
    var newRec = [];
    newRec.push(data.NumberOfRecommendations);
    newRec.push(data.NumberOfNewRecommendations);
    newRec.push(data.NumberOfRepRecommendations);
    newRec.push(data.NumberOfPartRecommendations);
    ExcelRows.push(newRec);
    worksheet.addRows(ExcelRows);

    // create a sheet RecStatus
    var worksheet = workbook.addWorksheet('RecStatus');
    // Add column headers and define column keys and widths
    worksheet.columns = [];
    j=1;
    vHeaders=[];
    data.StatStatus.forEach(function(item) {
        var vHeader = {header: item.Status, 
            key: 'v' + j.toString(), 
            width: 20
        }
        vHeaders.push(vHeader); 
        j++;
    });
    worksheet.columns = vHeaders;
    var ExcelRows = [];
    var newRec = [];
    data.StatStatus.forEach(function(item) {
        newRec.push(item.Number);
    });
    ExcelRows.push(newRec);
    worksheet.addRows(ExcelRows);

    // create a sheet RecType
    var worksheet = workbook.addWorksheet('RecType');
    // Add column headers and define column keys and widths
    worksheet.columns = [];
    j=1;
    vHeaders=[];
    data.StatLevel.forEach(function(item) {
        var vHeader = {header: item.Level, 
            key: 'v' + j.toString(), 
            width: 20
        }
        vHeaders.push(vHeader);
        j++;
    });
    worksheet.columns = vHeaders;
    var ExcelRows = [];
    var newRec = [];
    data.StatLevel.forEach(function(item) {
        newRec.push(item.Number);
    });
    ExcelRows.push(newRec);
    worksheet.addRows(ExcelRows);


    return workbook;
};


module.exports.GenerateMethologicalMatrix = GenerateMethologicalMatrix;
module.exports.GenerateRawData = GenerateRawData;