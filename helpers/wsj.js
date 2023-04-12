const Helpers = require("../helpers/general");

/*
    Reuters company data scraper
*/

const WSJ = {
    /*
    Collect data from source
  */
    collectData: function (browser, symbol, name, year, market) {
        return new Promise(async (resolve) => {
            let url = await Helpers.generateValidCompanyURL(browser, "wsj", symbol, market, name);
            const page = await browser.newPage();
            await page.goto(url, {
                timeout: 120000,
                waitUntil: ["load", "domcontentloaded"],
            });
            console.log("page loaded");

            let data = {};

            if (!(await page.$("#nav-strap .wsj-theme__selected_2qIFjAZtBMfKkHm3AgwFQc .wsj-theme__dropdown-menu_1LZXSJauh8wdxEnrZ10zE7 a"))) {
                console.log("Can not load company page on wsj");
                resolve([]);
                return;
            }

            //extract data from Balance sheet
            try {
                //a little bit delay
                await page.waitForTimeout(2000);
                //interact with page
                //extract balance sheet data
                let balanceSheetData = await page.evaluate((year) => {
                    //get columns index for each row
                    let tableHeaderCells = Array.from(document.querySelectorAll("#cr_cashflow thead th"));
                    let specificYearCellsIndex = Array.from(tableHeaderCells.filter((x) => x.innerText)).findIndex((x) => x.innerText.includes(year));

                    let tableRows = document.querySelectorAll(".cr_cashflow_table table tbody tr:not(.hide):not(.barPos):not(.barNeg)");
                    let data = [];
                    Array.from(tableRows)
                        .filter((x) => x.querySelector("td") && x.querySelector("td").innerText)
                        .forEach((x) => {
                            let object = {};
                            object.name = x.querySelector("td").innerText.trim();
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

                console.log(balanceSheetData);

                //build new object with only needed data
                //object keys are attached to excel sheet labels
                let object = [];
                // object.push({label:"N",position:"D37",index:"37",value:balanceSheetData.find(x => x.name === "Cash And Cash Equivalents").value});
                if (balanceSheetData.find((x) => x.name === "Common Stocks")) object.push({ label: "J", position: "D33", index: "33", value: balanceSheetData.find((x) => x.name === "Common Stocks").value });
                if (balanceSheetData.find((x) => x.name === "Total Debt")) object.push({ label: "K", position: "D34", index: "34", value: balanceSheetData.find((x) => x.name === "Total Debt").value });
                // object.push({label:"B",position:"D25",index:"25",value:balanceSheetData.find(x => x.name === "Ordinary Shares Number").value});
                object.map((x) => (x.source = "The WallStreet Journal"));
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
                    let tabsListElements = Array.from(document.querySelectorAll("#nav-strap .wsj-theme__selected_2qIFjAZtBMfKkHm3AgwFQc .wsj-theme__dropdown-menu_1LZXSJauh8wdxEnrZ10zE7 a"));
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
                // await page.waitForTimeout(2000);

                await page.waitForTimeout(1000);

                //interact with page
                let cashFlowData = await page.evaluate((year) => {
                    //get columns index for each row

                    let tableHeaderCells = Array.from(document.querySelectorAll("#cr_cashflow thead th"));
                    let specificYearCellsIndex = Array.from(tableHeaderCells.filter((x) => x.innerText)).findIndex((x) => x.innerText.includes(year));

                    let tableRows = document.querySelectorAll(".cr_cashflow_table table tbody tr:not(.hide):not(.barPos):not(.barNeg)");
                    let data = [];
                    Array.from(tableRows)
                        .filter((x) => x.querySelector("td") && x.querySelector("td").innerText)
                        .forEach((x) => {
                            let object = {};
                            object.name = x.querySelector("td").innerText;
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
                if (cashFlowData.find((x) => x.name === "Net Operating Cash Flow")) object.push({ label: "O", position: "D38", index: "38", value: cashFlowData.find((x) => x.name === "Net Operating Cash Flow").value });
                if (cashFlowData.find((x) => x.name === "Capital Expenditures (Fixed Assets)"))
                    object.push({ label: "E", position: "D28", index: "28", value: cashFlowData.find((x) => x.name === "Capital Expenditures (Fixed Assets)").value });
                if (cashFlowData.find((x) => x.name === "Cash Dividends Paid")) object.push({ label: "D", position: "D27", index: "27", value: cashFlowData.find((x) => x.name === "Cash Dividends Paid").value });
                // object.push({label:"I",position:"D32",index:"32",value:cashFlowData.find(x => x.name === "Income Tax Paid Supplemental Data").value});
                // object.push({label:"H",position:"D31",index:"31",value:cashFlowData.find(x => x.name === "Interest Paid Supplemental Data").value});
                if (cashFlowData.find((x) => x.name === "Sale of Fixed Assets & Businesses")) object.push({ label: "F", position: "D30", index: "30", value: cashFlowData.find((x) => x.name === "Sale of Fixed Assets & Businesses").value });
                object.map((x) => (x.source = "The WallStreet Journal"));
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
                    let tabsListElements = Array.from(document.querySelectorAll("#nav-strap .wsj-theme__selected_2qIFjAZtBMfKkHm3AgwFQc .wsj-theme__dropdown-menu_1LZXSJauh8wdxEnrZ10zE7 a"));
                    //open cash-flow page
                    return tabsListElements.filter((x) => x.href).find((x) => x.href.includes("/income-statement")).href;
                });

                await page.goto(incomeStatementURL, {
                    timeout: 120000,
                    waitUntil: ["load", "domcontentloaded"],
                });

                // await page.waitForNavigation({timeout:120000,waitUntil:['networkidle0','load','domcontentloaded']});
                console.log("income statement page loaded");

                //add some delay a little bit
                // await page.waitForTimeout(2000);
                await page.waitForTimeout(1000);
                //interact with page
                let incomeStatementData = await page.evaluate((year) => {
                    //get columns index for each row
                    let tableHeaderCells = Array.from(document.querySelectorAll("#cr_cashflow thead th"));
                    let specificYearCellsIndex = Array.from(tableHeaderCells.filter((x) => x.innerText)).findIndex((x) => x.innerText.includes(year));

                    let tableRows = document.querySelectorAll(".cr_cashflow_table table tbody tr:not(.hide):not(.barPos):not(.barNeg)");
                    let data = [];
                    Array.from(tableRows)
                        .filter((x) => x.querySelector("td") && x.querySelector("td").innerText)
                        .forEach((x) => {
                            let object = {};
                            object.name = x.querySelector("td").innerText;
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
                //extract income statement data from previos year
                let incomeStatementDataPreviousYear = await page.evaluate((year) => {
                    //get columns index for each row
                    let tableHeaderCells = Array.from(document.querySelectorAll("#cr_cashflow thead th"));
                    let specificYearCellsIndex = Array.from(tableHeaderCells.filter((x) => x.innerText)).findIndex((x) => x.innerText.includes(parseInt(year) - 1));
                    let tableRows = document.querySelectorAll(".cr_cashflow_table table tbody tr:not(.hide):not(.barPos):not(.barNeg)");
                    let data = [];
                    Array.from(tableRows)
                        .filter((x) => x.querySelector("td") && x.querySelector("td").innerText)
                        .forEach((x) => {
                            let object = {};
                            object.name = x.querySelector("td").innerText;
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
                if (incomeStatementData.find((x) => x.name === "EPS (Basic)")) object.push({ label: "L", position: "D35", index: "35", value: incomeStatementData.find((x) => x.name === "EPS (Basic)").value });
                if (incomeStatementData.find((x) => x.name === "EPS (Diluted)")) object.push({ label: "P", position: "D39", index: "39", value: incomeStatementData.find((x) => x.name === "EPS (Diluted)").value });
                if (incomeStatementData.find((x) => x.name === "Basic Shares Outstanding")) object.push({ label: "R", position: "D41", index: "41", value: incomeStatementData.find((x) => x.name === "Basic Shares Outstanding").value });
                // object.push({label:"M",position:"D36",index:"36",value:incomeStatementData.find(x => x.name === "Normalized EBITDA").value});
                if (incomeStatementDataPreviousYear.find((x) => x.name === "EPS (Basic)")) object.push({ label: "Q", position: "D40", index: "40", value: incomeStatementDataPreviousYear.find((x) => x.name === "EPS (Basic)").value });
                object.map((x) => (x.source = "The WallStreet Journal"));
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

module.exports = WSJ;
