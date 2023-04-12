const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '..', '.env') });
const spreadSheetId = process.env.spreadSheetId;
const { GoogleSpreadsheet } = require("google-spreadsheet");
const GoogleSpreadSheetCredentials = require("../focal-cooler-364814-88773190571b.json");
const templateSheetID = process.env.templateSheetID;
const summarySheetID = process.env.summarySheetID;
const async = require("async");
const moment = require("moment");

const Sheets = {
    /*
	  Check if sheet already exist
	  expects 2 parameters 
	  name : name of company
	  symbol : standard company symbol
	*/
    checkIfCompanyExist: function (name, symbol, year) {
        return new Promise(async (resolve) => {
            //access main document
            const doc = new GoogleSpreadsheet(spreadSheetId);
            //authenticate
            await doc.useServiceAccountAuth(GoogleSpreadSheetCredentials);
            //load document info
            await doc.loadInfo();
            console.log("DOC TITLE ------>", doc.title);
            //check for sheet by title
            const sheet = doc.sheetsByTitle[`Company (${symbol}) - ${year}`];
            if (sheet) {
                console.log("Sheet exist");
                console.log(sheet.sheetId);
                resolve(sheet.sheetId);
            } else {
                console.log("Sheet not exist");
                resolve(false);
            }
        });
    },

    /*
	  Create new company sheet 
	  expects 3 parameters 
	  name : name of company
	  symbol : standard company symbol
	  year : financial year
	*/
    addNewCompany: function (name, symbol, market, year, primarySource) {
        return new Promise(async (resolve) => {
            //access main document
            const doc = new GoogleSpreadsheet(spreadSheetId);
            //authenticate
            await doc.useServiceAccountAuth(GoogleSpreadSheetCredentials);
            //load document info
            await doc.loadInfo();
            console.log("DOC TITLE ------>", doc.title);
            //access template sheet
            const sheet = doc.sheetsById[templateSheetID];
            //create new sheet
            const newSheet = await sheet.duplicate({ title: `Company (${symbol}) - ${year}`, index: doc.sheetCount + 1 });
            //load cells
            await newSheet.loadCells(["B17:T17", "C10:C11"]);
            console.log(newSheet.cellStats);
            //update symbol
            newSheet.getCellByA1("B17").value = symbol;
            //update name
            newSheet.getCellByA1("C17").value = name;
            //update date
            newSheet.getCellByA1("D17").value = moment().format("DD-MMM-YY");
            //update data source
            newSheet.getCellByA1("C11").value = `${year} End of Year Statement`;
            //update Exchange listing
            newSheet.getCellByA1("E17").value = market;
            //update Exchange
            newSheet.getCellByA1("F17").value = market;
            //update source name
            newSheet.getCellByA1("C10").value = primarySource;
            //update Year
            newSheet.getCellByA1("T17").value = year;
            await newSheet.saveUpdatedCells();
            console.log("New company sheet created successfully", newSheet.sheetId);
            resolve(newSheet.sheetId);
        });
    },

    /*
	  Create or update company sheet data
	  it expects 3 parameters 
	  name : name of company
	  symbol : standard company symbol
	  data : company extracted data
	*/
    updateCompanySheetData: function (name, symbol, market, year, primarySource, data) {
        return new Promise(async (resolve) => {
            //join all arrays into one array
            // let formattedData = data.balanceSheet.concat(data.incomeStatement,data.cashFlow,data.adjustedClose,data.beta_5y_monthly);

            const doc = new GoogleSpreadsheet(spreadSheetId);
            //authenticate
            await doc.useServiceAccountAuth(GoogleSpreadSheetCredentials);
            await doc.loadInfo(); // loads document properties and worksheets
            // const sheet = await doc.sheetsByIndex[0];
            console.log("DOC TITLE ------>", doc.title);
            // return;

            //access template sheet
            const sheet = doc.sheetsById[templateSheetID];
            let companySheet;
            //check if company sheet already exist
            let sheetExistId = await Sheets.checkIfCompanyExist(name, symbol, year);
            if (sheetExistId) {
                companySheet = doc.sheetsById[sheetExistId];
            } else {
                let id = await Sheets.addNewCompany(name, symbol, market, year, primarySource);
                await doc.loadInfo();
                companySheet = doc.sheetsById[id];
            }

            //load cells
            await companySheet.loadCells(["D24:G45", "B17:T17", "C10:C11"]);
            console.log(companySheet.cellStats);

            //loop over data and update google sheet
            async.eachSeries(
                data,
                function (cell, callback) {
                    companySheet.getCellByA1(cell.position).value = cell.value;
                    if (cell.position !== "G17") {
                        companySheet.getCellByA1(`E${cell.index}`).value = cell.source;
                        companySheet.getCellByA1(`F${cell.index}`).value = cell.section;
                        companySheet.getCellByA1(`G${cell.index}`).value = cell.url;
                    }

                    callback();
                },
                async function () {
                    await companySheet.saveUpdatedCells();
                    await companySheet.loadCells(["B17:T17"]);
                    /*
			Prepare summary data
	      */
                    let cells = ["B17", "C17", "D17", "E17", "F17", "G17", "H17", "I17", "J17", "K17", "L17", "M17", "N17", "O17", "P17", "Q17", "R17", "S17", "T17"];
                    let summaryData = [];
                    for (let i = 0; i < cells.length; i++) {
                        summaryData.push(companySheet.getCellByA1(cells[i]).formattedValue);
                    }

                    await Sheets.updateSummarySheet(symbol, year, summaryData);

                    console.log("done updating company sheet");
                    resolve(true);
                }
            );
        });
    },

    /*
		Delete sheet by title
		expects 1 parameter
		symbol : standard company symbol
	*/
    deleteSheet: function (symbol, year) {
        return new Promise(async (resolve) => {
            const doc = new GoogleSpreadsheet(spreadSheetId);
            //authenticate
            await doc.useServiceAccountAuth(GoogleSpreadSheetCredentials);
            await doc.loadInfo(); // loads document properties and worksheets
            // const sheet = await doc.sheetsByIndex[0];
            console.log("DOC TITLE ------>", doc.title);
            // return;

            //access template sheet
            const sheet = doc.sheetsByTitle[`Company (${symbol}) - ${year}`];
            if (sheet) {
                await sheet.delete();
                await Sheets.deleteFromSummarySheet(symbol);
            }
            resolve(true);
        });
    },

    /*
		Update summary sheet file
		expects 3 parameters 
		symbol : standard company symbol
		year : year of company report
		summaryData : data cloned from main company sheet
	*/
    updateSummarySheet: function (symbol, year, summaryData) {
        return new Promise(async (resolve) => {
            const doc = new GoogleSpreadsheet(spreadSheetId);
            //authenticate
            await doc.useServiceAccountAuth(GoogleSpreadSheetCredentials);
            await doc.loadInfo(); // loads document properties and worksheets
            // const sheet = await doc.sheetsByIndex[0];
            console.log("update summary sheet");
            let sheet = doc.sheetsById[summarySheetID];
            console.log(sheet.cellStats);
            const rows = await sheet.getRows();
            let rowNumber;
            if (rows.find((x) => x["Ticker Symbol"] === symbol) && rows.find((x) => x["Year"] === year)) {
                console.log("Company row exist");
                rowNumber = rows.find((x) => x["Ticker Symbol"] === symbol && x["Year"] === year)._rowNumber;
                // console.log(rows);
                console.log(rowNumber);
            } else {
                console.log("Company row does not exist, should insert new one");
                let lastSheetSymbol = doc.sheetsByIndex[doc.sheetCount - 2].title.split("(").pop().split(")")[0];
                console.log("lastSheetSymbol", lastSheetSymbol);
                if (rows.find((x) => x["Ticker Symbol"] === lastSheetSymbol)) {
                    rowNumber = rows.find((x) => x["Ticker Symbol"] === lastSheetSymbol)._rowNumber + 1;
                } else {
                    rowNumber = 2;
                }

                console.log(rowNumber);
            }
            await sheet.loadCells([`A${rowNumber}:AC${rowNumber}`]);
            let cells = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "AC"];
            for (let i = 0; i < cells.length; i++) {
                console.log(summaryData[i]);
                sheet.getCellByA1(cells[i] + rowNumber).value = summaryData[i] || 1;
            }
            await sheet.saveUpdatedCells();
            resolve(true);
        });
    },

    /*
		Delete company data from summary sheet
		expects 1 parameters 
		symbol : standard company symbol
	*/
    deleteFromSummarySheet: function (symbol) {
        return new Promise(async (resolve) => {
            const doc = new GoogleSpreadsheet(spreadSheetId);
            //authenticate
            await doc.useServiceAccountAuth(GoogleSpreadSheetCredentials);
            await doc.loadInfo(); // loads document properties and worksheets
            // const sheet = await doc.sheetsByIndex[0];
            console.log("DOC TITLE ------>", doc.title);
            let sheet = doc.sheetsById[summarySheetID];
            console.log(sheet.cellStats);

            const rows = await sheet.getRows();
            const row = rows.find((x) => x["Ticker Symbol"] === symbol);
            if (row) {
                row.delete();
            }
            resolve(true);
        });
    },

    /*
		Update rss feeds template
		expects 3 parameters 
		companySheetId : ID of company reposrt's sheet
		data : rss data
	*/
    updateRssFeedSheet: function (companySheetId, data) {
        return new Promise(async (resolve) => {
            const doc = new GoogleSpreadsheet(spreadSheetId);
            //authenticate
            await doc.useServiceAccountAuth(GoogleSpreadSheetCredentials);
            //load document info
            await doc.loadInfo();

            console.log("DOC TITLE ------>", doc.title);
            const sheet = doc.sheetsById[companySheetId];
            await sheet.loadCells(["B135:O274"]);
            console.log(sheet.cellStats);
            await sheet.clear("B147:O274");
            await sheet.loadCells(["B135:O274"]);

            let index = 147;
            data.forEach((row) => {
                // console.log(`=HYPERLINK("${row.link}","${row.title}")`);
                sheet.getCellByA1(`C${index}`).formula = `=HYPERLINK("${row.link}","${row.title}")`;
                sheet.getCellByA1(`B${index}`).value = row.source;
                sheet.getCellByA1(`D${index}`).value = moment(row.date).format("DD-MMM-YY");
                // sheet.getCellByA1(`AB${index}`).value = row.link;
                sheet.getCellByA1(`E${index}:O${index}`).value = row.text;
                index = index + 2;
            });

            await sheet.saveUpdatedCells();
            console.log("Company sheet with RSS feeds updated updated");
            resolve(true);
        });
    },
};

module.exports = Sheets;
