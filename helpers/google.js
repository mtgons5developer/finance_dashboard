const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const async = require("async");
puppeteer.use(StealthPlugin());

/*
  This is google finance script 
  It's developed to scrape company data 
  but @Mark asked not to push it's data to excel sheet or to go further just for now
*/


let url = "https://www.google.com/finance/quote/AAPL:NASDAQ?hl=en";
let year = "2021";

puppeteer.launch({ headless: false }).then(async (browser) => {
    const page = await browser.newPage();
    await page.goto(url, {
        timeout: 120000,
        waitUntil: ["load", "domcontentloaded"],
    });
    console.log("page loaded");

    let data = {};

    //extract data from Balance sheet
    try {
        let balanceSheetData = await page.evaluate((year) => {
            // let rowsArray = Array.from(rowsElements);
            // let values = rowsArray.map(x => x.querySelector('[data-test="fin-col"]').innerText);

            //get columns index for each row

            let section = document.querySelectorAll(".UulDgc .v5gaBd .mT05K")[0];
            // let tableHeaderCells = Array.from(section.querySelectorAll('.financials-table__table__3YAwt thead th'));
            // let specificYearCellsIndex = 1;

            let tableRows = section.querySelectorAll("table tr");
            let data = [];
            tableRows.forEach((x) => {
                let object = {};
                if (x.querySelector("td")) {
                    object.name = x.querySelector("td div.rsPbEe").innerText;
                    object.value = parseFloat(x.querySelectorAll("td")[1].innerText.replace(/[^0-9\.]+/g, "") || 0);
                    data.push(object);
                }
            });

            return data;
        }, year);

        //push balance sheet data to main object
        data.balanceSheet = balanceSheetData;

        console.log("extracted data from balance sheet successfully");
        // console.log(data);
    } catch (e) {
        console.log(e);
    }

    // return;

    //extract data from from cash flow
    try {
        console.log("start interacting with cash flow page");

        //add some delay a little bit
        // await page.waitForTimeout(2000);

        let cashFlowData = await page.evaluate((year) => {
            // let rowsArray = Array.from(rowsElements);
            // let values = rowsArray.map(x => x.querySelector('[data-test="fin-col"]').innerText);

            //get columns index for each row
            //expand all values
            // document.querySelector('#Col1-1-Financials-Proxy .expandPf').click();

            let section = document.querySelectorAll(".UulDgc .v5gaBd .mT05K")[1];
            // let tableHeaderCells = Array.from(section.querySelectorAll('.financials-table__table__3YAwt thead th'));
            // let specificYearCellsIndex = 1;

            let tableRows = section.querySelectorAll("table tr");
            let data = [];
            tableRows.forEach((x) => {
                let object = {};
                if (x.querySelector("td")) {
                    object.name = x.querySelector("td div.rsPbEe").innerText;
                    object.value = parseFloat(x.querySelectorAll("td")[1].innerText.replace(/[^0-9\.]+/g, "") || 0);
                    data.push(object);
                }
            });

            return data;
        }, year);

        //push cash flow data to main object
        data.cashFlow = cashFlowData;
    } catch (e) {
        console.log("err extracting data from cash-flow");
        console.log(e);
    }

    //extract data from from income statement
    try {
        console.log("start interacting with income statement page");

        // await page.waitForTimeout(2000);

        let incomeStatementData = await page.evaluate((year) => {
            // let rowsArray = Array.from(rowsElements);
            // let values = rowsArray.map(x => x.querySelector('[data-test="fin-col"]').innerText);

            //get columns index for each row
            //expand all values
            // document.querySelector('#Col1-1-Financials-Proxy .expandPf').click();

            let section = document.querySelectorAll(".UulDgc .v5gaBd .mT05K")[2];
            // let tableHeaderCells = Array.from(section.querySelectorAll('.financials-table__table__3YAwt thead th'));
            // let specificYearCellsIndex = 1;

            let tableRows = section.querySelectorAll("table tr");
            let data = [];
            tableRows.forEach((x) => {
                let object = {};
                if (x.querySelector("td")) {
                    object.name = x.querySelector("td div.rsPbEe").innerText;
                    object.value = parseFloat(x.querySelectorAll("td")[1].innerText.replace(/[^0-9\.]+/g, "") || 0);
                    data.push(object);
                }
            });

            return data;
        }, year);

        //push cash flow data to main object
        data.incomeStatement = incomeStatementData;
    } catch (e) {
        console.log("err extracting data from income statement");
        console.log(e);
    }

    //extract data from from historical data
    // try{
    //   console.log('start interacting with historical data page');
    //   //interact with page
    //   let historicalDataURL = await page.evaluate(()=>{
    //     // let tabsListElements = Array.from(document.querySelectorAll('#quote-nav li a'));
    //     //open cash-flow page
    //     return document.querySelector('#quote-nav [data-test="HISTORICAL_DATA"] a').href;
    //   });

    //   //format search date
    //   let date = new Date(`Sep 30, ${year}`).getTime()/1000;
    //   historicalDataURL = new URL(historicalDataURL);
    //   historicalDataURL.searchParams.set('period1',date);
    //   historicalDataURL.searchParams.set('period2',date);
    //   historicalDataURL.searchParams.set('interval','1d');
    //   historicalDataURL = historicalDataURL.toString();

    //   await page.goto(historicalDataURL,{
    //     timeout:120000,
    //     waitUntil:['load','domcontentloaded']
    //   });

    //   // await page.waitForNavigation({timeout:120000,waitUntil:['networkidle0','load','domcontentloaded']});
    //   console.log('historical data page loaded');

    //   //add some delay a little bit
    //   // await page.waitForTimeout(2000);

    //   let adjustedClose = await page.evaluate(()=>{

    //     let adjustedClose = document.querySelectorAll('[data-test="historical-prices"] tbody tr td')[5].innerText;

    //     return adjustedClose;

    //   });

    //   //push adjusted close data to main object
    //   data.adjustedClose = adjustedClose;

    // }catch(e){
    //   console.log('err extracting data from historical data');
    //   console.log(e);
    // }

    //extract data from from summary data
    // try{
    //   console.log('start interacting with summary data page');
    //   //interact with page
    //   let summaryURL = await page.evaluate(()=>{
    //     // let tabsListElements = Array.from(document.querySelectorAll('#quote-nav li[data-test="SUMMARY"]'));
    //     //open cash-flow page
    //     return document.querySelector('#quote-nav [data-test="SUMMARY"] a').href;
    //   });

    //   await page.goto(summaryURL,{
    //     timeout:120000,
    //     waitUntil:['load','domcontentloaded']
    //   });

    //   // await page.waitForNavigation({timeout:120000,waitUntil:['networkidle0','load','domcontentloaded']});
    //   console.log('summary data page loaded');

    //   //add some delay a little bit
    //   // await page.waitForTimeout(2000);

    //   let beta_5y_monthly = await page.evaluate(()=>{

    //     let beta_5y_monthly = document.querySelector('[data-test="BETA_5Y-value"]').innerText;

    //     return beta_5y_monthly;

    //   });

    //   //push beta_5y_monthly to main object
    //   data.beta_5y_monthly = beta_5y_monthly;

    // }catch(e){
    //   console.log('err extracting data from summary data');
    //   console.log(e);
    // }

    console.log(`table data : `, data);

    //
});
