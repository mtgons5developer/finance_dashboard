const Helpers = require("../helpers/general");

/*
    Reuters company data scraper
*/

const Yahoo = {
    /*
    Collect data from source
  */
    collectData: function (browser, symbol, name, year, market) {
        return new Promise(async (resolve) => {
            let url = await Helpers.generateValidCompanyURL(browser, "yahoo", symbol, market, name);
            const page = await browser.newPage();
            await page.goto(url, {
                timeout: 120000,
                waitUntil: ["load", "domcontentloaded"],
            });
            console.log("page loaded");

            await page.waitForTimeout(2000);

            //handle terms of service popup if exists
            if (await page.$("#consent-page")) {
                console.log("should accept terms");
                await page.$eval('#consent-page button[name="agree"]', (el) => el.click());

                await page.waitForNavigation({ waitUntil: ["load", "domcontentloaded"], timeout: 120000 });

                await page.waitForTimeout(2000);
            }

            // return;

            let data = {};

            //extract data from Balance sheet
            try {
                //interact with page
                if (await page.$('#Col1-1-Financials-Proxy [role="tab"]')) {
                    let balanceSheetData = await page.evaluate((year) => {
                        //get columns index for each row
                        //expand all values
                        if(document.querySelector("#Col1-1-Financials-Proxy .expandPf")) document.querySelector("#Col1-1-Financials-Proxy .expandPf").click();

                        let tableHeaderCells = Array.from(document.querySelectorAll('#Col1-1-Financials-Proxy [class="D(tbhg)"] div')[0].querySelectorAll("div"));
                        let specificYearCellsIndex = Array.from(tableHeaderCells.filter((x) => x.innerText)).findIndex((x) => x.innerText.includes(year)) - 1;

                        let tableRows = document.querySelectorAll('#Col1-1-Financials-Proxy [class="D(tbrg)"] [class="D(tbr) fi-row Bgc($hoverBgColor):h"]');
                        let data = [];
                        tableRows.forEach((x) => {
                            let object = {};
                            object.name = x.querySelector("div").innerText.trim();
                            object.value = x.querySelectorAll('[data-test="fin-col"]')[specificYearCellsIndex]
                                ? parseFloat(x.querySelectorAll('[data-test="fin-col"]')[specificYearCellsIndex].innerText.replaceAll(",", "") || 0) / 1000
                                : null;
                            data.push(object);
                        });

                        return data;
                    }, year);

                    // console.log(balanceSheetData);

                    //build new object with only needed data
                    //object keys are attached to excel sheet labels
                    let object = [];
                    if (balanceSheetData.find((x) => x.name === "Cash And Cash Equivalents")) object.push({ label: "N", position: "D37", index: "37", value: balanceSheetData.find((x) => x.name === "Cash And Cash Equivalents").value });
                    if (balanceSheetData.find((x) => x.name === "Common Stock Equity")) object.push({ label: "J", position: "D33", index: "33", value: balanceSheetData.find((x) => x.name === "Common Stock Equity").value });
                    if (balanceSheetData.find((x) => x.name === "Total Debt")) object.push({ label: "K", position: "D34", index: "34", value: balanceSheetData.find((x) => x.name === "Total Debt").value });
                    if (balanceSheetData.find((x) => x.name === "Ordinary Shares Number")) object.push({ label: "B", position: "D25", index: "25", value: balanceSheetData.find((x) => x.name === "Ordinary Shares Number").value });
                    object.map((x) => (x.source = "Yahoo Finance"));
                    object.map((x) => (x.section = "Financial/ Balance Sheet"));
                    object.map((x) => (x.url = url));

                    //push balance sheet data to main object
                    data.balanceSheet = object;

                    console.log("extracted data from balance sheet successfully");
                } else {
                    console.log("can not load yahoo balanceSheet page");
                }
            } catch (e) {
                console.log(e);
                resolve(false);
            }

            //extract data from from cash flow
            try {
                if (await page.$('#Col1-1-Financials-Proxy [role="tab"]')) {
                    console.log("start interacting with cash flow page");
                    //interact with page
                    let cashFlowURL = await page.evaluate(() => {
                        let tabsListElements = Array.from(document.querySelectorAll('#Col1-1-Financials-Proxy [role="tab"]'));
                        //open cash-flow page
                        return tabsListElements.filter((x) => x.href).find((x) => x.href.includes("/cash-flow")).href;
                    });

                    cashFlowURL = new URL(cashFlowURL);
                    cashFlowURL.searchParams.set("guccounter", "2");
                    cashFlowURL = cashFlowURL.toString();

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
                        // let rowsArray = Array.from(rowsElements);
                        // let values = rowsArray.map(x => x.querySelector('[data-test="fin-col"]').innerText);

                        //get columns index for each row
                        //expand all values
                        if(document.querySelector("#Col1-1-Financials-Proxy .expandPf")) document.querySelector("#Col1-1-Financials-Proxy .expandPf").click();

                        let tableHeaderCells = Array.from(document.querySelectorAll('#Col1-1-Financials-Proxy [class="D(tbhg)"] div')[0].querySelectorAll("div"));
                        let specificYearCellsIndex = Array.from(tableHeaderCells.filter((x) => x.innerText)).findIndex((x) => x.innerText.includes(year)) - 1;

                        let tableRows = document.querySelectorAll('#Col1-1-Financials-Proxy [class="D(tbrg)"] [class="D(tbr) fi-row Bgc($hoverBgColor):h"]');
                        let data = [];
                        tableRows.forEach((x) => {
                            let object = {};
                            object.name = x.querySelector("div").innerText.trim();
                            object.value = x.querySelectorAll('[data-test="fin-col"]')[specificYearCellsIndex]
                                ? parseFloat(x.querySelectorAll('[data-test="fin-col"]')[specificYearCellsIndex].innerText.replaceAll(",", "") || 0) / 1000
                                : null;
                            data.push(object);
                        });

                        return data;
                    }, year);

                    console.log(cashFlowData);

                    //build new object with only needed data
                    //object keys are attached to excel sheet labels
                    let object = [];
                    if (cashFlowData.find((x) => x.name === "Operating Cash Flow")) object.push({ label: "O", position: "D38", index: "38", value: cashFlowData.find((x) => x.name === "Operating Cash Flow").value });
                    if (cashFlowData.find((x) => x.name === "Purchase of PPE")) object.push({ label: "E", position: "D28", index: "28", value: cashFlowData.find((x) => x.name === "Purchase of PPE").value });
                    if (cashFlowData.find((x) => x.name === "Cash Dividends Paid")) object.push({ label: "D", position: "D27", index: "27", value: cashFlowData.find((x) => x.name === "Cash Dividends Paid").value });
                    if (cashFlowData.find((x) => x.name === "Income Tax Paid Supplemental Data"))
                        object.push({ label: "I", position: "D32", index: "32", value: cashFlowData.find((x) => x.name === "Income Tax Paid Supplemental Data").value });
                    if (cashFlowData.find((x) => x.name === "Interest Paid Supplemental Data")) object.push({ label: "H", position: "D31", index: "31", value: cashFlowData.find((x) => x.name === "Interest Paid Supplemental Data").value });
                    object.map((x) => (x.source = "Yahoo Finance"));
                    object.map((x) => (x.section = "Financial/ Cash Flow"));
                    object.map((x) => (x.url = cashFlowURL));
                    //push cash flow data to main object
                    data.cashFlow = object;
                } else {
                    console.log("Can not load yahoo cashFlow page");
                }
            } catch (e) {
                console.log("err extracting data from cash-flow");
                console.log(e);
                resolve(false);
            }

            //extract data from from income statement
            try {
                if (await page.$('#Col1-1-Financials-Proxy [role="tab"]')) {
                    console.log("start interacting with income statement page");
                    //interact with page
                    let incomeStatementURL = await page.evaluate(() => {
                        let tabsListElements = Array.from(document.querySelectorAll('#Col1-1-Financials-Proxy [role="tab"]'));
                        //open cash-flow page
                        return tabsListElements.filter((x) => x.href).find((x) => x.href.includes("/financials")).href;
                    });

                    incomeStatementURL = new URL(incomeStatementURL);
                    incomeStatementURL.searchParams.set("guccounter", "2");
                    incomeStatementURL = incomeStatementURL.toString();

                    await page.goto(incomeStatementURL, {
                        timeout: 120000,
                        waitUntil: ["load", "domcontentloaded"],
                    });

                    // await page.waitForNavigation({timeout:120000,waitUntil:['networkidle0','load','domcontentloaded']});
                    console.log("income statement page loaded");

                    //add some delay a little bit
                    await page.waitForTimeout(2000);
                    //interact with page
                    let incomeStatementData = await page.evaluate((year) => {
                        // let rowsArray = Array.from(rowsElements);
                        // let values = rowsArray.map(x => x.querySelector('[data-test="fin-col"]').innerText);

                        //get columns index for each row
                        //expand all values
                        if(document.querySelector("#Col1-1-Financials-Proxy .expandPf")) document.querySelector("#Col1-1-Financials-Proxy .expandPf").click();

                        let tableHeaderCells = Array.from(document.querySelectorAll('#Col1-1-Financials-Proxy [class="D(tbhg)"] div')[0].querySelectorAll("div"));
                        let specificYearCellsIndex = Array.from(tableHeaderCells.filter((x) => x.innerText)).findIndex((x) => x.innerText.includes(year)) - 1;

                        let tableRows = document.querySelectorAll('#Col1-1-Financials-Proxy [class="D(tbrg)"] [class="D(tbr) fi-row Bgc($hoverBgColor):h"]');
                        let data = [];
                        tableRows.forEach((x) => {
                            let object = {};
                            object.name = x.querySelector("div").innerText.trim();
                            object.value = x.querySelectorAll('[data-test="fin-col"]')[specificYearCellsIndex]
                                ? parseFloat(x.querySelectorAll('[data-test="fin-col"]')[specificYearCellsIndex].innerText.replaceAll(",", "") || 0) / 1000
                                : null;
                            data.push(object);
                        });

                        return data;
                    }, year);

                    let incomeStatementDataPreviousYear = await page.evaluate((year) => {
                        // let rowsArray = Array.from(rowsElements);
                        // let values = rowsArray.map(x => x.querySelector('[data-test="fin-col"]').innerText);

                        //get columns index for each row
                        //expand all values
                        if(document.querySelector("#Col1-1-Financials-Proxy .expandPf")) document.querySelector("#Col1-1-Financials-Proxy .expandPf").click();

                        let tableHeaderCells = Array.from(document.querySelectorAll('#Col1-1-Financials-Proxy [class="D(tbhg)"] div')[0].querySelectorAll("div"));
                        let specificYearCellsIndex = Array.from(tableHeaderCells.filter((x) => x.innerText)).findIndex((x) => x.innerText.includes(parseInt(year) - 1)) - 1;

                        let tableRows = document.querySelectorAll('#Col1-1-Financials-Proxy [class="D(tbrg)"] [class="D(tbr) fi-row Bgc($hoverBgColor):h"]');
                        let data = [];
                        tableRows.forEach((x) => {
                            let object = {};
                            object.name = x.querySelector("div").innerText.trim();
                            object.value = x.querySelectorAll('[data-test="fin-col"]')[specificYearCellsIndex]
                                ? parseFloat(x.querySelectorAll('[data-test="fin-col"]')[specificYearCellsIndex].innerText.replaceAll(",", "") || 0) / 1000
                                : null;
                            data.push(object);
                        });

                        return data;
                    }, year);

                    //build new object with only needed data
                    //object keys are attached to excel sheet labels
                    let object = [];
                    if (incomeStatementData.find((x) => x.name === "Basic EPS"))
                        object.push({ label: "L", position: "D35", index: "35", value: incomeStatementData.find((x) => x.name === "Basic EPS").value ? incomeStatementData.find((x) => x.name === "Basic EPS").value * 1000 : null });
                    if (incomeStatementData.find((x) => x.name === "Diluted EPS"))
                        object.push({ label: "P", position: "D39", index: "39", value: incomeStatementData.find((x) => x.name === "Diluted EPS").value ? incomeStatementData.find((x) => x.name === "Diluted EPS").value * 1000 : null });
                    if (incomeStatementData.find((x) => x.name === "Basic Average Shares")) object.push({ label: "R", position: "D41", index: "41", value: incomeStatementData.find((x) => x.name === "Basic Average Shares").value });
                    if (incomeStatementData.find((x) => x.name === "Normalized EBITDA")) object.push({ label: "M", position: "D36", index: "36", value: incomeStatementData.find((x) => x.name === "Normalized EBITDA").value });
                    if (incomeStatementDataPreviousYear.find((x) => x.name === "Basic EPS"))
                        object.push({
                            label: "Q",
                            position: "D40",
                            index: "40",
                            value: incomeStatementDataPreviousYear.find((x) => x.name === "Basic EPS").value ? incomeStatementDataPreviousYear.find((x) => x.name === "Basic EPS").value * 1000 : null,
                        });
                    object.map((x) => (x.source = "Yahoo Finance"));
                    object.map((x) => (x.section = "Financial/ Income Statement"));
                    object.map((x) => (x.url = incomeStatementURL));

                    //push cash flow data to main object
                    data.incomeStatement = object;
                } else {
                    console.log("Can not load yahoo incomeStatement page");
                }
            } catch (e) {
                console.log("err extracting data from income statement");
                console.log(e);
                resolve(false);
            }

            // //extract data from from historical data
            // try{
            //   console.log('start interacting with historical data page');
            //   //interact with page
            //   let historicalDataURL = await page.evaluate(()=>{
            //     // let tabsListElements = Array.from(document.querySelectorAll('#quote-nav li a'));
            //     //open cash-flow page
            //     return document.querySelector('#quote-nav [data-test="HISTORICAL_DATA"] a').href;
            //   });

            //   //format search date
            //   let date1 = new Date(`Sep 30, ${year}`).getTime()/1000;
            //   let date2 = new Date(`Oct 1, ${year}`).getTime()/1000;
            //   historicalDataURL = new URL(historicalDataURL);
            //   historicalDataURL.searchParams.set('period1',date1);
            //   historicalDataURL.searchParams.set('period2',date2);
            //   historicalDataURL.searchParams.set('interval','1d');
            //   historicalDataURL.searchParams.set('guccounter','2');
            //   historicalDataURL = historicalDataURL.toString();

            //   console.log(historicalDataURL);

            //   await page.goto(historicalDataURL,{
            //     timeout:120000,
            //     waitUntil:['load','domcontentloaded']
            //   });

            //   // await page.waitForNavigation({timeout:120000,waitUntil:['networkidle0','load','domcontentloaded']});
            //   console.log('historical data page loaded');

            //   //add some delay a little bit
            //   await page.waitForTimeout(2000);
            //   //interact with page
            //   let adjustedClose = await page.evaluate(()=>{

            //     let adjustedClose = document.querySelectorAll('[data-test="historical-prices"] tbody tr td')[5] ? document.querySelectorAll('[data-test="historical-prices"] tbody tr td')[5].innerText : null;

            //     return adjustedClose;

            //   });

            //   let object = [];
            //   if(adjustedClose) object.push({label:"C",position:"D26",index:"26",value:adjustedClose});
            //   object.map(x => x.source = 'Yahoo Finance');
            //   object.map(x => x.section = 'Historical Data');
            //   object.map(x => x.url = historicalDataURL);
            //   // object. = adjustedClose;
            //   //push adjusted close data to main object
            //   data.adjustedClose = object;

            // }catch(e){
            //   console.log('err extracting data from historical data');
            //   console.log(e);
            //   resolve(false);
            // }

            //extract data from from summary data
            try {
                console.log("start interacting with summary data page");
                //interact with page
                let summaryURL = await page.evaluate(() => {
                    // let tabsListElements = Array.from(document.querySelectorAll('#quote-nav li[data-test="SUMMARY"]'));
                    //open cash-flow page
                    return document.querySelector('#quote-nav [data-test="SUMMARY"] a').href;
                });

                summaryURL = new URL(summaryURL);
                summaryURL.searchParams.set("guccounter", "2");
                summaryURL = summaryURL.toString();

                await page.goto(summaryURL, {
                    timeout: 120000,
                    waitUntil: ["load", "domcontentloaded"],
                });

                // await page.waitForNavigation({timeout:120000,waitUntil:['networkidle0','load','domcontentloaded']});
                console.log("summary data page loaded");

                //add some delay a little bit
                await page.waitForTimeout(2000);

                //extract beta
                let beta_5y_monthly = await page.evaluate(() => {
                    return document.querySelector('[data-test="BETA_5Y-value"]') ? document.querySelector('[data-test="BETA_5Y-value"]').innerText : null;
                });

                //extract divedend date
                let dividend_date = await page.evaluate(() => {
                    return document.querySelector('[data-test="EX_DIVIDEND_DATE-value"]') ? document.querySelector('[data-test="EX_DIVIDEND_DATE-value"]').innerText : null;
                });

                //extract adjusted close
                let adjustedClose = await page.evaluate(() => {
                    return (adjustedClose = document.querySelector('#quote-header-info [data-field="regularMarketPrice"]') ? parseFloat(document.querySelector('#quote-header-info [data-field="regularMarketPrice"]').innerText) : null);
                });

                let object = [];
                if (beta_5y_monthly) object.push({ label: "S", position: "D44", index: "44", value: beta_5y_monthly });
                if (dividend_date) object.push({ label: "ZZ", position: "G17", index: "17", value: dividend_date });
                if (adjustedClose) object.push({ label: "C", position: "D26", index: "26", value: adjustedClose });
                object.map((x) => (x.source = "Yahoo Finance"));
                object.map((x) => (x.section = "Financial/ Summary"));
                object.map((x) => (x.url = summaryURL));
                // object. = beta_5y_monthly;

                //push beta_5y_monthly to main object
                data.beta_5y_monthly = object;
            } catch (e) {
                console.log("err extracting data from summary data");
                console.log(e);
                resolve(false);
            }

            //close page
            await page.close();
            //concat all data parts into one object
            let formattedData = (data.balanceSheet || []).concat(data.incomeStatement || [], data.cashFlow || [], data.beta_5y_monthly);
            console.log(`table data : `, formattedData);
            //return data
            resolve(formattedData);
        });
    },
};

module.exports = Yahoo;
