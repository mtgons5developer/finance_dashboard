const Yahoo = require("../helpers/yahoo");
const Reuters = require("../helpers/reuters");
const WSJ = require("../helpers/wsj");
const Helpers = require("../helpers/general");
const Sheets = require("../helpers/sheets");
const RSS = require("../helpers/rss");
const async = require("async");
const companyDataCollection = require("../models/companyData");
const API = {
    /*
		Fire script to start scraping company data and push to google sheets
		req.body expected params
		{companyName,companySymbol,Year}
	*/
    start: async function (req, res) {
        const { name, symbol, year, primarySource, market } = req.body;
        //initiate browser
        const browser = await Helpers.initializeBrowser();
        async.waterfall(
            [
                function (callback) {
                    //fire scripts in parallel
                    // console.log(browser);
                    let data = {};
                    async.parallel(
                        [
                            function (callback) {
                                //scrape data from yahoo
                                (async () => {
                                    let result = await Yahoo.collectData(browser, symbol, name, year, market);
                                    if (result) {
                                        data.yahoo = result;
                                        callback();
                                    } else {
                                        callback(true);
                                    }
                                })();
                            },
                            function (callback) {
                                //scrape data from reuters
                                (async () => {
                                    let result = await Reuters.collectData(browser, symbol, name, year, market);

                                    if (result) {
                                        data.reuters = result;
                                        callback();
                                    } else {
                                        callback(true);
                                    }
                                })();
                            },
                            function (callback) {
                                //scrape data from wsj
                                (async () => {
                                    let result = await WSJ.collectData(browser, symbol, name, year, market);

                                    if (result) {
                                        data.wsj = result;
                                        callback();
                                    } else {
                                        callback(true);
                                    }
                                })();
                            },
                        ],
                        function (err) {
                            if (err) {
                                (async () => {
                                    await Helpers.destroyBrowser(browser);
                                    callback(true);
                                })();
                            } else {
                                callback(null, data);
                            }
                        }
                    );
                },
                function (data, callback) {
                    //format data by source
                    (async () => {
                        console.log("data -----------> ", data);
                        let formattedData = await Helpers.formatDataBySource(primarySource, data);
                        callback(null, formattedData);
                    })();
                },
                function (formattedData, callback) {
                    //push data to google sheet
                    (async () => {
                        await Sheets.updateCompanySheetData(name, symbol, market, year, primarySource, formattedData);
                        callback(null, formattedData);
                    })();
                },
                function (formattedData, callback) {
                    //update database
                    (async () => {
                        await companyDataCollection.insertMany({ primarySource: primarySource, year: year, market: market, name: name, symbol: symbol, data: formattedData });
                        console.log("updated databse with company data", name);
                        callback(null);
                    })();
                },
                function (callback) {
                    //destroy browser
                    (async () => {
                        await Helpers.destroyBrowser(browser);
                        callback(null);
                    })();
                },
            ],
            function (err) {
                if (err) {
                    console.log("Err script exit");
                    res.status(500).send({ message: "Something went wrong, Please check server logs" });
                } else {
                    res.status(200).send({ message: "Company report updated successfully , check your financial dashboard please" });
                }
            }
        );
    },

    /*
		Delete sheet by title
	*/
    delete: async function (req, res) {
        const { symbol, year } = req.body;
        if (await Sheets.deleteSheet(symbol, year)) {
            res.status(200).send({});
        } else {
            res.status(500).send({ message: "Something went wrong while deleting sheet, check server logs" });
        }
    },

    /*
		Update RSS feeds 
	*/
    updateRSS: async function (req, res) {
        const { companyName, startDate, endDate, sheetID } = req.body;
        console.log(req.body);
        //extract news from rss feeds
        if (companyName && sheetID) {
            let results = await RSS.extractRssDataFromSources(companyName, startDate, endDate);
            if (results) {
                await Sheets.updateRssFeedSheet(sheetID, results);
                res.status(200).send({ success: true });
            } else {
                res.status(500).send({ message: "Something went wrong while updating rss sheet, check server logs" });
            }
        } else {
            res.status(500).send({ message: "Please make sure company name and sheet ID are valid values" });
        }
    },

    /*
		Testing for rss 
		return all rss data from all sources in JSON format
	*/
    getRSS: async function (req, res) {
        let results = await RSS.extractRssDataFromSources();
        if (results) {
            res.status(200).send(results);
        } else {
            res.status(500).send({ message: "Something went wrong while getting rss sheet, check server logs" });
        }
    },
};

module.exports = API;
