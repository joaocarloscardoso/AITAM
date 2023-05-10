const Excel = require('exceljs');
var Docs = require('./docgeneration.js');
// statistics service
var statisticsService = require('./statistics.js');
var Findings = require('./findings.js');
var Recommendations = require('./auditrec.js');

function right(str, chr) {
    return str.slice(str.length-chr,str.length);
}

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
    var worksheetObj = workbook.addWorksheet('Objectives');
    var worksheetRisk = workbook.addWorksheet('Risks');
    var worksheetCtrl = workbook.addWorksheet('Controls');
    var worksheet = workbook.addWorksheet('Procedures');
    var worksheetStratRisk = workbook.addWorksheet('Strategic Risks');

    var data = Docs.LoadProcedureMatrix(fileid, selectedLang);

    FillWSObjectives(worksheetObj, data);
    FillWSRisk(worksheetRisk, data);
    FillWSCtrl(worksheetCtrl, data);
    FillWSProcedures(worksheet, data);
    FillWSStratRisk(worksheetStratRisk, data);

    return workbook;
};

function FillWSStratRisk(worksheetStratRisk, data){

    worksheetStratRisk.columns = [
        { header: 'FOLDER', key: 'c1', width: 40 },
        { header: 'FOLDER1', key: 'c2', width: 40 },
        { header: 'FOLDER2', key: 'c3', width: 40 },
        { header: 'STRATEGIC RISK FOLDER', key: 'c4', width: 40 },
        { header: 'Title', key: 'c5', width: 40 },
        { header: 'Code', key: 'c6', width: 40 },
        { header: 'StrategicRiskCategory1', key: 'c7', width: 40 },
        { header: 'SAPeriod', key: 'c8', width: 40 },
        { header: 'StrategicRiskText1', key: 'c9', width: 40 },
        { header: 'StrategicRiskText2', key: 'c10', width: 40 },
        { header: 'StrategicRiskText3', key: 'c11', width: 40 },
        { header: 'StrategicRiskText4', key: 'c12', width: 40 },
        { header: 'StrategicRiskText5', key: 'c13', width: 40 },
        { header: 'StrategicRiskText6', key: 'c14', width: 40 },
        { header: 'StrategicRiskText7', key: 'c15', width: 40 },
        { header: 'StrategicRiskCategory2', key: 'c16', width: 40 },	
        { header: 'StrategicRiskCategory3', key: 'c17', width: 40 },	
        { header: 'StrategicRiskCategory4', key: 'c18', width: 40 },	
        { header: 'StrategicRiskCategory5', key: 'c19', width: 40 },	
        { header: 'StrategicRiskCategory6', key: 'c20', width: 40 },	
        { header: 'StrategicRiskMultiSelectCategory1', key: 'c21', width: 40 },	
        { header: 'StrategicRiskMultiSelectCategory2', key: 'c22', width: 40 },
        { header: 'StrategicRiskMultiSelectCategory3', key: 'c24', width: 40 },
        { header: 'StrategicRiskMultiSelectCategory4', key: 'c25', width: 40 },
        { header: 'StrategicRiskNumericValue1', key: 'c26', width: 40 },
        { header: 'StrategicRiskWeight', key: 'c27', width: 40 },
        { header: 'StrategicRiskYesNo1', key: 'c28', width: 40 },
        { header: 'StrategicRiskYesNo2', key: 'c29', width: 40 }
    ];

    var ExcelRows = [];

    var newRec = [
        'Taxonomy row',
        '',
        '',
        '',
        'Assertion Factor Title',
        'Number',
        'StrategicRiskCategory1',
        'SAPeriod',
        'StrategicRiskText1',
        'StrategicRiskText2',
        'StrategicRiskText3',
        'StrategicRiskText4',
        'StrategicRiskText5',
        'StrategicRiskText6',
        'StrategicRiskText7',
        'StrategicRiskCategory2',	
        'StrategicRiskCategory3',	
        'StrategicRiskCategory4',	
        'StrategicRiskCategory5',	
        'StrategicRiskCategory6', 	
        'StrategicRiskMultiSelectCategory1', 	
        'StrategicRiskMultiSelectCategory2', 
        'StrategicRiskMultiSelectCategory3', 
        'StrategicRiskMultiSelectCategory4', 
        'StrategicRiskNumericValue1', 
        'StrategicRiskWeight',
        'StrategicRiskYesNo1', 
        'StrategicRiskYesNo2', 
    ];

    ExcelRows.push(newRec);
    worksheetStratRisk.addRows(ExcelRows);
};

function FillWSCtrl(worksheetCtrl, data){

    worksheetCtrl.columns = [
        { header: 'FOLDER', key: 'c1', width: 40 },
        { header: 'FOLDER1', key: 'c2', width: 40 },
        { header: 'FOLDER2', key: 'c3', width: 40 },
        { header: 'CONTROLFOLDER', key: 'c4', width: 40 },
        { header: 'Title', key: 'c5', width: 40 },
        { header: 'Notes', key: 'c6', width: 40 },
        { header: 'Description', key: 'c7', width: 40 },
        { header: 'Code', key: 'c8', width: 40 },
        { header: 'Key', key: 'c9', width: 40 },
        { header: 'ControlText3', key: 'c10', width: 40 },
        { header: 'ControlText4', key: 'c11', width: 40 },
        { header: 'ControlText5', key: 'c12', width: 40 },
        { header: 'ControlText6', key: 'c13', width: 40 },
        { header: 'ControlText7', key: 'c14', width: 40 },
        { header: 'ControlCategory1', key: 'c15', width: 40 },
        { header: 'ControlCategory2', key: 'c16', width: 40 },	
        { header: 'ControlCategory3', key: 'c17', width: 40 },	
        { header: 'ControlCategory4', key: 'c18', width: 40 },	
        { header: 'ControlCategory5', key: 'c19', width: 40 },	
        { header: 'ControlCategory6', key: 'c20', width: 40 },	
        { header: 'ControlCategory7', key: 'c21', width: 40 },	
        { header: 'ControlCategory8', key: 'c22', width: 40 },
        { header: 'ControlCategory11', key: 'c24', width: 40 },
        { header: 'ControlCategory12', key: 'c25', width: 40 },
        { header: 'ControlYesNo1', key: 'c26', width: 40 },
        { header: 'ControlYesNo2', key: 'c27', width: 40 },
        { header: 'ControlNumericValue1', key: 'c28', width: 40 },
        { header: 'ControlNumericValue4', key: 'c29', width: 40 },
        { header: 'ControlNumericValue5', key: 'c30', width: 40 },
        { header: 'ControlNumericValue6', key: 'c31', width: 40 },
        { header: 'ControlNumericValue7', key: 'c32', width: 40 },
        { header: 'ControlNumericValue8', key: 'c33', width: 40 },
        { header: 'ControlNumericValue9', key: 'c34', width: 40 },
        { header: 'Assertions', key: 'c35', width: 40 },
        { header: 'ControlMultiSelectCategory2', key: 'c36', width: 40 },
        { header: 'ControlMultiSelectCategory3', key: 'c37', width: 40 },
        { header: 'ControlMultiSelectCategory4', key: 'c38', width: 40 },
        { header: 'ControlMultiSelectCategory5', key: 'c39', width: 40 },
        { header: 'ControlMultiSelectCategory6', key: 'c40', width: 40 },
        { header: 'ControlMultiSelectCategory7', key: 'c41', width: 40 },
        { header: 'ControlMultiSelectCategory8', key: 'c42', width: 40 },
        { header: 'ControlMultiSelectCategory9', key: 'c43', width: 40 },
        { header: 'ControlMultiSelectCategory10', key: 'c44', width: 40 },
        { header: 'SAQuarter', key: 'c45', width: 40 }
    ];

									


    var ExcelRows = [];

    var newRec = [
        'Taxonomy row',
        '',
        '',
        '',
        'Control Title',
        'Notes',
        'Description', 
        'Code', 
        'Key', 
        'ControlText3', 
        'ControlText4', 
        'ControlText5', 
        'ControlText6', 
        'ControlText7', 
        'ControlCategory1',
        'ControlCategory2', 	
        'ControlCategory3', 	
        'ControlCategory4', 	
        'ControlCategory5', 	
        'ControlCategory6', 	
        'ControlCategory7', 	
        'ControlCategory8',
        'ControlCategory11',
        'ControlCategory12', 
        'ControlYesNo1', 
        'ControlYesNo2', 
        'ControlNumericValue1', 
        'ControlNumericValue4', 
        'ControlNumericValue5', 
        'ControlNumericValue6', 
        'ControlNumericValue7', 
        'ControlNumericValue8',
        'ControlNumericValue9', 
        'Assertions', 
        'ControlMultiSelectCategory2', 
        'ControlMultiSelectCategory3', 
        'ControlMultiSelectCategory4', 
        'ControlMultiSelectCategory5', 
        'ControlMultiSelectCategory6', 
        'ControlMultiSelectCategory7', 
        'ControlMultiSelectCategory8', 
        'ControlMultiSelectCategory9', 
        'ControlMultiSelectCategory10',
        'SAQuarter', 
    ];

    ExcelRows.push(newRec);
    worksheetCtrl.addRows(ExcelRows);
};

function FillWSRisk(worksheetRisk, data){
    worksheetRisk.columns = [
        { header: 'FOLDER', key: 'c1', width: 40 },
        { header: 'FOLDER1', key: 'c2', width: 40 },
        { header: 'FOLDER2', key: 'c3', width: 40 },
        { header: 'RISK', key: 'c4', width: 40 },
        { header: 'Title', key: 'c5', width: 40 },
        { header: 'Code', key: 'c6', width: 40 },
        { header: 'Type', key: 'c7', width: 40 },
        { header: 'Description', key: 'c8', width: 40 },
        { header: 'Notes', key: 'c9', width: 40 },
        { header: 'RiskText3', key: 'c10', width: 40 },
        { header: 'RiskText4', key: 'c11', width: 40 },
        { header: 'RiskText5', key: 'c12', width: 40 },
        { header: 'RiskText6', key: 'c13', width: 40 },
        { header: 'RiskText7', key: 'c14', width: 40 },
        { header: 'RiskCategory2', key: 'c15', width: 40 },
        { header: 'RiskCategory3', key: 'c16', width: 40 },	
        { header: 'RiskCategory4', key: 'c17', width: 40 },	
        { header: 'RiskCategory5', key: 'c18', width: 40 },	
        { header: 'RiskCategory6', key: 'c19', width: 40 },	
        { header: 'RiskMultiSelectCategory1', key: 'c20', width: 40 },	
        { header: 'RiskMultiSelectCategory2', key: 'c21', width: 40 },	
        { header: 'RiskMultiSelectCategory3', key: 'c22', width: 40 },
        { header: 'RiskMultiSelectCategory4', key: 'c24', width: 40 },
        { header: 'RiskNumericValue1', key: 'c25', width: 40 },
        { header: 'RiskYesNo1', key: 'c26', width: 40 },
        { header: 'RiskYesNo2', key: 'c27', width: 40 },
        { header: 'Weight', key: 'c28', width: 40 }
    ];

    var ExcelRows = [];

    var newRec = [
        'Taxonomy row',
        '',
        '',
        '',
        'Risk Title',
        'Number',
        'Type',
        'Administration response',
        'Remaining Risk',
        'Affected Field',
        "Auditor's Opinion",
        'RiskText5',
        'RiskText6',
        'RiskText7',
        'RiskCategory2',
        'RiskCategory3', 	
        'RiskCategory4', 	
        'RiskCategory5', 	
        'RiskCategory6', 	
        'RiskMultiSelectCategory1', 	
        'RiskMultiSelectCategory2', 	
        'RiskMultiSelectCategory3', 
        'RiskMultiSelectCategory4', 
        'RiskNumericValue1', 
        'RiskYesNo1', 
        'RiskYesNo2', 
        'Weight'
    ];

    ExcelRows.push(newRec);
    worksheetRisk.addRows(ExcelRows);
};

function FillWSProcedures(worksheet, data){
    var vFolder1='';
    var vFolder2='';
    var vDomain='';
    var vDomainControl ='';
    var vArea='';
    var vAreaControl ='';
    var vCategoryCount=0;


    // Add column headers and define column keys and widths
    worksheet.columns = [
        { header: 'FOLDER', key: 'c1', width: 40 },
        { header: 'FOLDER1', key: 'c2', width: 40 },
        { header: 'FOLDER2', key: 'c3', width: 40 },
        { header: 'WORKPROGRAMFOLDER', key: 'c4', width: 40 },
        { header: 'Title', key: 'c5', width: 40 },
        { header: 'Type', key: 'c6', width: 40 },	
        { header: 'ProcedureCategory2', key: 'c7', width: 40 },	
        { header: 'ProcedureCategory3', key: 'c8', width: 40 },	
        { header: 'ProcedureCategory4', key: 'c9', width: 40 },	
        { header: 'ProcedureCategory5', key: 'c10', width: 40 },	
        { header: 'ProcedureCategory6', key: 'c11', width: 40 },	
        { header: 'ProcedureCategory7', key: 'c12', width: 40 },	
        { header: 'ProcedureCategory8', key: 'c13', width: 40 },	
        { header: 'ProcedureCategory9', key: 'c14', width: 40 },	
        { header: 'ProcedureCategory10', key: 'c15', width: 40 },	
        { header: 'ProcedureCategory11', key: 'c16', width: 40 },	
        { header: 'ProcedureMultiSelectCategory1', key: 'c17', width: 40 },	
        { header: 'ProcedureMultiSelectCategory2', key: 'c18', width: 40 },	
        { header: 'ProcedureMultiSelectCategory3', key: 'c19', width: 40 },	
        { header: 'ProcedureMultiSelectCategory4', key: 'c20', width: 40 },	
        { header: 'ProcedureMultiSelectCategory5', key: 'c21', width: 40 },	
        { header: 'ProcedureMultiSelectCategory6', key: 'c22', width: 40 },
        { header: 'Description', key: 'c24', width: 40 },
        { header: 'Scope', key: 'c25', width: 40 },
        { header: 'Purpose', key: 'c26', width: 40 },
        { header: 'ProcedureText4', key: 'c27', width: 40 },
        { header: 'ProcedureText5', key: 'c28', width: 40 },
        { header: 'ProcedureResultsText1', key: 'c29', width: 40 },
        { header: 'ProcedureResultsText2', key: 'c30', width: 40 },
        { header: 'ProcedureResultsText3', key: 'c31', width: 40 },
        { header: 'ProcedureResultsText4', key: 'c32', width: 40 },
        { header: 'ProcedureScoreCategory1', key: 'c33', width: 40 },
        { header: 'ProcedureScoreCategory2', key: 'c34', width: 40 },
        { header: 'ProcedureScoreNumericValue1', key: 'c35', width: 40 },
        { header: 'ProcedureScoreNumericValue2', key: 'c36', width: 40 },
        { header: 'ProcedureScoreNumericValue3', key: 'c37', width: 40 },
        { header: 'ProcedureScoreNumericValue4', key: 'c38', width: 40 },
        { header: 'ProcedureScoreNumericValue5', key: 'c39', width: 40 },
        { header: 'ProcedureScoreNumericValue6', key: 'c40', width: 40 },
        { header: 'ProcedureScoreYesNo1', key: 'c41', width: 40 }
    ];

    var ExcelRows = [];

    var newRec = [
        'Taxonomy row', 
        '', 
        '', 
        '', 
        'Procedure Title', 
        'Sequence', 
        'Checklist Review', 
        'ProcedureCategory3',	
        'ProcedureCategory4',
        'ProcedureCategory5',	
        'ProcedureCategory6',
        'ProcedureCategory7',
        'ProcedureCategory8',
        'ProcedureCategory9',
        'ProcedureCategory10',
        'ProcedureCategory11', 
        'ProcedureMultiSelectCategory1', 
        'ProcedureMultiSelectCategory2',
        'ProcedureMultiSelectCategory3',
        'ProcedureMultiSelectCategory4', 
        'ProcedureMultiSelectCategory5', 
        'ProcedureMultiSelectCategory6', 
        'Description, nature, timing, and scope of the test', 
        'Criteria', 
        'Potential Risks', 
        'Required Information', 
        'Method of analysis', 
        'Remarks (Record of Work Done)', 
        'Conclusion', 
        'ProcedureResultsText3', 
        'ProcedureResultsText4', 
        'ProcedureScoreCategory1', 
        'ProcedureScoreCategory2',
        'ProcedureScoreNumericValue1', 
        'ProcedureScoreNumericValue2', 
        'ProcedureScoreNumericValue3', 
        'ProcedureScoreNumericValue4', 
        'ProcedureScoreNumericValue5',
        'ProcedureScoreNumericValue6', 
        'ProcedureScoreYesNo1'
    ];
    ExcelRows.push(newRec);

    vFolder1='AITAM';
    vFolder2='';
    vDomain='';
    vDomainControl ='';
    vArea='';
    vAreaControl ='';
    var vIssuesCount = 0;
    for (var i=0; i<data.Domains.length; i++) {
        for (var j=0; j<data.Domains[i].Areas.length; j++) {
            vIssuesCount = vIssuesCount + data.Domains[i].Areas[j].Issues.length; 
            for (var k=0; k<data.Domains[i].Areas[j].Issues.length; k++) {
                //for (var l=0; l<data.Domains[i].Areas[j].Issues[k].Procedures.length; l++) {
                    if (vDomainControl!=data.Domains[i].code) {
                        vDomainControl=data.Domains[i].code;
                        vDomain=data.Domains[i].Domain;
                    } else {
                        vDomain='';
                    };
                    if (vAreaControl!=data.Domains[i].Areas[j].code) {
                        vAreaControl=data.Domains[i].Areas[j].code;
                        vArea=data.Domains[i].Areas[j].Area;
                    } else {
                        vArea='';
                    };
                    var newRec = [
                        '',
                        vFolder1,
                        vDomain,
                        vArea,
                        data.Domains[i].Areas[j].Issues[k].Issue,
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                        data.Domains[i].Areas[j].Issues[k].description,
                        data.Domains[i].Areas[j].Issues[k].criteria, 
                        '', 
                        data.Domains[i].Areas[j].Issues[k].inforequired, 
                        data.Domains[i].Areas[j].Issues[k].method, 
                        '', 
                        '', 
                        '', 
                        '', 
                        '', 
                        '',
                        '', 
                        '', 
                        '', 
                        '', 
                        '',
                        '', 
                        ''
                    ];
                    vFolder1='';
                    vFolder2='';
                    // Add an array of rows
                    ExcelRows.push(newRec);
                //};
            };
        };
    };

    worksheet.addRows(ExcelRows);
};

function FillWSObjectives(worksheetObj, data){
    var vFolder1='';
    var vFolder2='';
    var vDomain='';
    var vDomainControl ='';
    var vCategoryCount=0;

    worksheetObj.columns = [
        { header: 'FOLDER', key: 'c1', width: 40 },
        { header: 'FOLDER1', key: 'c2', width: 40 },
        { header: 'FOLDER2', key: 'c3', width: 40 },
        { header: 'OBJECTIVE FOLDER', key: 'c4', width: 40 },
        { header: 'Title', key: 'c5', width: 40 },
        { header: 'Code', key: 'c6', width: 40 },
        { header: 'Type', key: 'c7', width: 40 },
        { header: 'Description', key: 'c8', width: 40 },
        { header: 'Notes', key: 'c9', width: 40 },
        { header: 'ObjectiveCategory2', key: 'c10', width: 40 },
        { header: 'ObjectiveCategory3', key: 'c11', width: 40 },
        { header: 'ObjectiveCategory4', key: 'c12', width: 40 },
        { header: 'ObjectiveMultiSelectCategory1', key: 'c13', width: 40 },
        { header: 'ObjectiveYesNo1', key: 'c14', width: 40 },
        { header: 'ObjectiveYesNo2', key: 'c15', width: 40 }
    ];

    var ExcelRowsObj = [];

    var newRec = [
        'Taxonomy row',
        '',
        '',
        '',
        'Checklist Title',
        'Code',
        'Type',
        'Description',
        'Notes',
        'ObjectiveCategory2',
        'ObjectiveCategory3',
        'ObjectiveCategory4',
        'ObjectiveMultiSelectCategory1',
        'ObjectiveYesNo1',
        'ObjectiveYesNo2'
    ];
    vFolder1='';
    vFolder2='';
    // Add an array of rows
    ExcelRowsObj.push(newRec);


    vFolder1='IT Audit File';
    vFolder2='IT Audit Objectives';
    vDomain='';
    vDomainControl ='';
    var vIssuesCount = 1;
    for (var i=0; i<data.Domains.length; i++) {
        for (var j=0; j<data.Domains[i].Areas.length; j++) {
            //vIssuesCount = vIssuesCount + data.Domains[i].Areas[j].Issues.length; 
            for (var k=0; k<data.Domains[i].Areas[j].Issues.length; k++) {
                if (vDomainControl!=data.Domains[i].code) {
                    vDomainControl=data.Domains[i].code;
                    vDomain=data.Domains[i].Domain;
                    vCategoryCount=0;
                } else {
                    vDomain='';
                    vCategoryCount++;
                };
                var newRec = [
                    '',
                    vFolder1,
                    vFolder2,
                    vDomain,
                    data.Domains[i].Areas[j].Area + '. ' + data.Domains[i].Areas[j].Issues[k].objective,
                    'O-' + right('000' + vIssuesCount.toString(), 3),
                    'ObjectiveCategory1:' + vCategoryCount.toString(),
                    '',
                    '',
                    'ObjectiveCategory2:' + vCategoryCount.toString(),
                    'ObjectiveCategory3:' + vCategoryCount.toString(),
                    'ObjectiveCategory4:' + vCategoryCount.toString(),
                    'ObjectiveMultiSelectCategory1:' + vCategoryCount.toString(),
                    'FALSE',
                    'FALSE'
                ];
                vFolder1='';
                vFolder2='';
                // Add an array of rows
                ExcelRowsObj.push(newRec);
                vIssuesCount++;
            };
        };
    };

    worksheetObj.addRows(ExcelRowsObj);
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