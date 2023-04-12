const Helpers = require("../helpers/general");

/*
    Reuters company data scraper
*/

const Reuters = {
    /*
    Collect data from source
  */
    collectData: function (browser, symbol, name, year, market) {
        return new Promise(async (resolve) => {
            let url = await Helpers.generateValidCompanyURL(browser, "reuters", symbol, market, name);
            const page = await browser.newPage();
            await page.goto(url, {
                timeout: 120000,
                waitUntil: ["load", "domcontentloaded"],
            });
            console.log("page loaded");

            let data = {};

            if (!(await page.$('[id="Financials Data"] li a'))) {
                console.log("Can not load company page on reuters");
                resolve([]);
                return;
            }

            //extract data from Balance sheet
            try {
                //interact with page
                let balanceSheetData = await page.evaluate((year) => {
                    //get columns index for each row

                    let tableHeaderCells = Array.from(document.querySelectorAll(".financials-table__table__3YAwt thead th"));
                    let specificYearCellsIndex = Array.from(tableHeaderCells.filter((x) => x.innerText)).findIndex((x) => x.innerText.includes(year)) - 1;

                    let tableRows = document.querySelectorAll(".financials-table__table__3YAwt tbody tr");
                    let data = [];
                    tableRows.forEach((x) => {
                        let object = {};
                        object.name = x.querySelector("th").innerText;
                        if (x.querySelectorAll("td")[specificYearCellsIndex]) {
                            if (x.querySelectorAll("td")[specificYearCellsIndex].innerText.includes("(")) {
                                object.value = x.querySelectorAll("td")[specificYearCellsIndex] ? parseFloat(x.querySelectorAll("td")[specificYearCellsIndex].innerText.replace(/[^0-9\.]+/g, "") || 0) * -1 : null;
                            } else {
                                object.value = x.querySelectorAll("td")[specificYearCellsIndex] ? parseFloat(x.querySelectorAll("td")[specificYearCellsIndex].innerText.replace(/[^0-9\.]+/g, "") || 0) : null;
                            }
                        }

                        data.push(object);
                    });

                    return data;
                }, year);

                //object keys are attached to excel sheet labels
                let object = [];
                if (balanceSheetData.find((x) => x.name === "Cash")) object.push({ label: "N", position: "D37", index: "37", value: balanceSheetData.find((x) => x.name === "Cash").value });
                if (balanceSheetData.find((x) => x.name === "Common Stock, Total")) object.push({ label: "J", position: "D33", index: "33", value: balanceSheetData.find((x) => x.name === "Common Stock, Total").value });
                if (balanceSheetData.find((x) => x.name === "Total Debt")) object.push({ label: "K", position: "D34", index: "34", value: balanceSheetData.find((x) => x.name === "Total Debt").value });
                if (balanceSheetData.find((x) => x.name === "Total Common Shares Outstanding"))
                    object.push({ label: "B", position: "D25", index: "25", value: balanceSheetData.find((x) => x.name === "Total Common Shares Outstanding").value });
                object.map((x) => (x.source = "Reuters"));
                object.map((x) => (x.section = "Financial/ Balance Sheet"));
                object.map((x) => (x.url = url));

                //push balance sheet data to main object
                data.balanceSheet = object;

                console.log("extracted data from balance sheet successfully");
            } catch (e) {
                console.log(e);
                resolve(false);
            }

            //extract data from from cash flow
            try {
                console.log("start interacting with cash flow page");
                //interact with page
                let cashFlowURL = await page.evaluate(() => {
                    let tabsListElements = Array.from(document.querySelectorAll('[id="Financials Data"] li a'));
                    //open cash-flow page
                    return tabsListElements.filter((x) => x.href).find((x) => x.href.includes("/cash-flow")).href;
                });

                await page.goto(cashFlowURL, {
                    timeout: 120000,
                    waitUntil: ["load", "domcontentloaded"],
                });

                // await page.waitForNavigation({timeout:120000,waitUntil:['networkidle0','load','domcontentloaded']});
                console.log("cash flow page loaded");

                //add some delay a little bit
                await page.waitForTimeout(2000);
                //interact with page
                let cashFlowData = await page.evaluate((year) => {
                    //get columns index for each row

                    let tableHeaderCells = Array.from(document.querySelectorAll(".financials-table__table__3YAwt thead th"));
                    let specificYearCellsIndex = Array.from(tableHeaderCells.filter((x) => x.innerText)).findIndex((x) => x.innerText.includes(year)) - 1;

                    let tableRows = document.querySelectorAll(".financials-table__table__3YAwt tbody tr");
                    let data = [];
                    tableRows.forEach((x) => {
                        let object = {};
                        object.name = x.querySelector("th").innerText;
                        if (x.querySelectorAll("td")[specificYearCellsIndex]) {
                            if (x.querySelectorAll("td")[specificYearCellsIndex].innerText.includes("(")) {
                                object.value = x.querySelectorAll("td")[specificYearCellsIndex] ? parseFloat(x.querySelectorAll("td")[specificYearCellsIndex].innerText.replace(/[^0-9\.]+/g, "") || 0) * -1 : null;
                            } else {
                                object.value = x.querySelectorAll("td")[specificYearCellsIndex] ? parseFloat(x.querySelectorAll("td")[specificYearCellsIndex].innerText.replace(/[^0-9\.]+/g, "") || 0) : null;
                            }
                        }
                        data.push(object);
                    });

                    return data;
                }, year);

                //build new object with only needed data
                //object keys are attached to excel sheet labels
                let object = [];
                if (cashFlowData.find((x) => x.name === "Cash from Operating Activities")) object.push({ label: "O", position: "D38", index: "38", value: cashFlowData.find((x) => x.name === "Cash from Operating Activities").value });
                if (cashFlowData.find((x) => x.name === "Capital Expenditures")) object.push({ label: "E", position: "D28", index: "28", value: cashFlowData.find((x) => x.name === "Capital Expenditures").value });
                if (cashFlowData.find((x) => x.name === "Total Cash Dividends Paid")) object.push({ label: "D", position: "D27", index: "27", value: cashFlowData.find((x) => x.name === "Total Cash Dividends Paid").value });
                if (cashFlowData.find((x) => x.name === "Cash Taxes Paid")) object.push({ label: "I", position: "D32", index: "32", value: cashFlowData.find((x) => x.name === "Cash Taxes Paid").value });
                if (cashFlowData.find((x) => x.name === "Cash Interest Paid")) object.push({ label: "H", position: "D31", index: "31", value: cashFlowData.find((x) => x.name === "Cash Interest Paid").value });
                // if(cashFlowData.find(x => x.name === "Sale of Fixed Assets & Businesses")) object.push({label:"F",position:"D30",index:"30",value:cashFlowData.find(x => x.name === "Sale of Fixed Assets & Businesses").value});
                object.map((x) => (x.source = "Reuters"));
                object.map((x) => (x.section = "Financial/ Cash Flow"));
                object.map((x) => (x.url = cashFlowURL));
                //push cash flow data to main object
                data.cashFlow = object;
            } catch (e) {
                console.log("err extracting data from cash-flow");
                console.log(e);
                resolve(false);
            }

            //extract data from from income statement
            try {
                console.log("start interacting with income statement page");
                //interact with page
                let incomeStatementURL = await page.evaluate(() => {
                    let tabsListElements = Array.from(document.querySelectorAll('[id="Financials Data"] li a'));
                    //open cash-flow page
                    return tabsListElements.filter((x) => x.href).find((x) => x.href.includes("/income-annual")).href;
                });

                await page.goto(incomeStatementURL, {
                    timeout: 120000,
                    waitUntil: ["load", "domcontentloaded"],
                });

                // await page.waitForNavigation({timeout:120000,waitUntil:['networkidle0','load','domcontentloaded']});
                console.log("income statement page loaded");

                //add some delay a little bit
                await page.waitForTimeout(2000);

                //interact with page
                //extract income statement data
                let incomeStatementData = await page.evaluate((year) => {
                    let tableHeaderCells = Array.from(document.querySelectorAll(".financials-table__table__3YAwt thead th"));
                    let specificYearCellsIndex = Array.from(tableHeaderCells.filter((x) => x.innerText)).findIndex((x) => x.innerText.includes(year)) - 1;

                    let tableRows = document.querySelectorAll(".financials-table__table__3YAwt tbody tr");
                    let data = [];
                    tableRows.forEach((x) => {
                        let object = {};
                        object.name = x.querySelector("th").innerText;
                        if (x.querySelectorAll("td")[specificYearCellsIndex]) {
                            if (x.querySelectorAll("td")[specificYearCellsIndex].innerText.includes("(")) {
                                object.value = x.querySelectorAll("td")[specificYearCellsIndex] ? parseFloat(x.querySelectorAll("td")[specificYearCellsIndex].innerText.replace(/[^0-9\.]+/g, "") || 0) * -1 : null;
                            } else {
                                object.value = x.querySelectorAll("td")[specificYearCellsIndex] ? parseFloat(x.querySelectorAll("td")[specificYearCellsIndex].innerText.replace(/[^0-9\.]+/g, "") || 0) : null;
                            }
                        }
                        data.push(object);
                    });

                    return data;
                }, year);

                //interact with page
                //extract income statement data from previous year
                let incomeStatementDataPreviousYear = await page.evaluate((year) => {
                    let tableHeaderCells = Array.from(document.querySelectorAll(".financials-table__table__3YAwt thead th"));
                    let specificYearCellsIndex = Array.from(tableHeaderCells.filter((x) => x.innerText)).findIndex((x) => x.innerText.includes(parseInt(year) - 1)) - 1;

                    let tableRows = document.querySelectorAll(".financials-table__table__3YAwt tbody tr");
                    let data = [];
                    tableRows.forEach((x) => {
                        let object = {};
                        object.name = x.querySelector("th").innerText;
                        if (x.querySelectorAll("td")[specificYearCellsIndex]) {
                            if (x.querySelectorAll("td")[specificYearCellsIndex].innerText.includes("(")) {
                                object.value = x.querySelectorAll("td")[specificYearCellsIndex] ? parseFloat(x.querySelectorAll("td")[specificYearCellsIndex].innerText.replace(/[^0-9\.]+/g, "") || 0) * -1 : null;
                            } else {
                                object.value = x.querySelectorAll("td")[specificYearCellsIndex] ? parseFloat(x.querySelectorAll("td")[specificYearCellsIndex].innerText.replace(/[^0-9\.]+/g, "") || 0) : null;
                            }
                        }
                        data.push(object);
                    });

                    return data;
                }, year);

                //build new object with only needed data
                //object keys are attached to excel sheet labels
                let object = [];
                if (incomeStatementData.find((x) => x.name === "Diluted Normalized EPS")) object.push({ label: "L", position: "D35", index: "35", value: incomeStatementData.find((x) => x.name === "Diluted Normalized EPS").value });
                if (incomeStatementData.find((x) => x.name === "Diluted EPS Excluding ExtraOrd Items"))
                    object.push({ label: "P", position: "D39", index: "39", value: incomeStatementData.find((x) => x.name === "Diluted EPS Excluding ExtraOrd Items").value });
                if (incomeStatementData.find((x) => x.name === "Basic EPS")) object.push({ label: "R", position: "D41", index: "41", value: incomeStatementData.find((x) => x.name === "Basic EPS").value });
                if (incomeStatementData.find((x) => x.name === "EBITDA")) object.push({ label: "M", position: "D36", index: "36", value: incomeStatementData.find((x) => x.name === "EBITDA").value });
                if (incomeStatementDataPreviousYear.find((x) => x.name === "Diluted EPS Excluding ExtraOrd Items"))
                    object.push({ label: "Q", position: "D40", index: "40", value: incomeStatementDataPreviousYear.find((x) => x.name === "Diluted EPS Excluding ExtraOrd Items").value });
                object.map((x) => (x.source = "Reuters"));
                object.map((x) => (x.section = "Financial/ Income Statement"));
                object.map((x) => (x.url = incomeStatementURL));

                //push cash flow data to main object
                data.incomeStatement = object;
            } catch (e) {
                console.log("err extracting data from income statement");
                console.log(e);
                resolve(false);
            }

            //close page
            await page.close();
            //concat all data parts into one object
            let formattedData = data.balanceSheet.concat(data.incomeStatement, data.cashFlow);
            console.log(`table data : `, formattedData);
            //return data
            resolve(formattedData);
        });
    },
};

module.exports = Reuters;
