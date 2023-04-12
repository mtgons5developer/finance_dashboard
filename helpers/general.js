const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
//use puppeteer capatcha solver plugin
puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: "2captcha",
            token: "de303a286e72ea5a97b8e917bcfdafa6", // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
        },
        visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
    })
);
//use puppeteer stealth plugin
puppeteer.use(StealthPlugin());

const General = {
    /*
		launch a new browser instance and return browser object 
	*/
    initializeBrowser: function () {
        return new Promise(async (resolve) => {
            let browser = await puppeteer.launch({
                headless: true,
                ignoreDefaultArgs: ["--disable-extensions"],
                args: ["--no-sandbox", "--disable-setuid-sandbox", `--window-size=1280,960`],
            });
            resolve(browser);
        });
    },
    /*
		Close browser
	*/
    destroyBrowser: function (browser) {
        return new Promise(async (resolve) => {
            await browser.close();
            resolve(true);
        });
    },
    /*
		Format financial data 
		primarysource data comes first and missing data comes from other sources
	*/
    formatDataBySource: function (primarySource, data) {
        return new Promise((resolve) => {
            let mainObject = data[primarySource].filter((x) => x.value);
            console.log(mainObject.length);
            let otherObject = [];
            Object.entries(data)
                .filter((x) => x[0] !== primarySource && x[1].length)
                .forEach((entry) => {
                    const [key, value] = entry;
                    otherObject = otherObject.concat(value);
                });
            otherObject.sort((a, b) => {
                return b.value - a.value;
            });
            let otherObjectUniqueValues = [...new Map(otherObject.filter((item) => item && item["label"]).map((item) => [item["label"], item])).values()];

            otherObjectUniqueValues.map((x) => {
                let exist = mainObject.find((y) => y.label === x.label);
                if (!exist) mainObject.push(x);
            });

            resolve(mainObject);
        });
    },
    /*
		Search google and generate valid company URL by source
	*/
    generateValidCompanyURL(browser, source, symbol, name, market) {
        return new Promise(async (resolve) => {
            const page = await browser.newPage();
            let url = `https://bing.com/search?q=${source + " " + market + " " + name + " "} financial`;
            console.log(url);
            await page.goto(url, {
                timeout: 120000,
                waitUntil: ["load", "domcontentloaded"],
            });

            let resultURL = await page.evaluate(() => {
                return document.querySelector("#b_results .b_algo cite").innerText;
            });

            switch (source) {
                case "yahoo":
                    // resultURL = resultURL+'/balance-sheet?guccounter=2';
                    resultURL = new URL(resultURL);
                    if (resultURL.pathname.toLowerCase().includes("financials")) {
                        resultURL = resultURL.toString();
                        resultURL = resultURL.replace("/financials", "") + "/balance-sheet?guccounter=2";
                    } else {
                        resultURL = resultURL.toString();
                        resultURL = resultURL + "/balance-sheet?guccounter=2";
                    }
                    break;
                case "reuters":
                    resultURL = resultURL + "/financials/balance-sheet-annual";
                    break;
                case "wsj":
                    resultURL = new URL(resultURL);
                    if (resultURL.pathname.toLowerCase().includes("financials")) {
                        resultURL = resultURL.toString();
                        resultURL = resultURL + "/annual/balance-sheet";
                    } else {
                        resultURL = resultURL.toString();
                        resultURL = resultURL + "/financials/annual/balance-sheet";
                    }

                    break;
            }

            console.log(resultURL);
            await page.close();
            resolve(resultURL);
        });
    },
};

module.exports = General;
