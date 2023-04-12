var convert = require("xml-js");
const async = require("async");
const moment = require("moment");
const curl = require("curl");
const articleScrapers = require("./articleScrapers");

const RSSFeeds = {
    extractRssDataFromSources: function (companyName, startDate, endDate) {
        return new Promise((resolve) => {
            var rssData = [];
            async.series(
                [
                    function (callback) {
                        /*
							sourceName : cnbc
							Rss URL: https://www.cnbc.com/id/19746125/device/rss/rss.xml
						*/
                        (async () => {
                            let url = "https://www.cnbc.com/id/19746125/device/rss/rss.xml";
                            let sourceName = "cnbc";
                            let data = await RSSFeeds.getRssFromSource(url);
                            data = await RSSFeeds.formatRssData(data, sourceName);
                            rssData = rssData.concat(data);
                            callback();
                        })();
                    },

                    function (callback) {
                        /*
							sourceName : Financial Times
							Rss URL: https://www.ft.com/?format=rss
						*/
                        (async () => {
                            let url = "https://www.ft.com/?format=rss";
                            let sourceName = "financialTimes";
                            let data = await RSSFeeds.getRssFromSource(url);
                            data = await RSSFeeds.formatRssData(data, sourceName);
                            rssData = rssData.concat(data);
                            callback();
                        })();
                    },

                    function (callback) {
                        /*
							sourceName : Fortune
							Rss URL: https://fortune.com/feed
						*/
                        (async () => {
                            let url = "https://fortune.com/feed";
                            let sourceName = "fortune";
                            let data = await RSSFeeds.getRssFromSource(url);
                            data = await RSSFeeds.formatRssData(data, sourceName);
                            rssData = rssData.concat(data);
                            callback();
                        })();
                    },

                    function (callback) {
                        /*
							sourceName : Investing.com
							Rss URL: https://www.investing.com/rss/news.rss
						*/
                        (async () => {
                            let url = "https://www.investing.com/rss/news.rss";
                            let sourceName = "investingDotCom";
                            let data = await RSSFeeds.getRssFromSource(url);
                            data = await RSSFeeds.formatRssData(data, sourceName);
                            rssData = rssData.concat(data);
                            callback();
                        })();
                    },

                    function (callback) {
                        /*
							sourceName : Seeking Alpha
							Rss URL: https://seekingalpha.com/market_currents.xml
						*/
                        (async () => {
                            let url = "https://seekingalpha.com/market_currents.xml";
                            let sourceName = "seekingAlpha";
                            let data = await RSSFeeds.getRssFromSource(url);
                            data = await RSSFeeds.formatRssData(data, sourceName);
                            rssData = rssData.concat(data);
                            callback();
                        })();
                    },

                    function (callback) {
                        /*
							sourceName : Yahoo Finance
							Rss URL: https://finance.yahoo.com/news/rssindex
						*/
                        (async () => {
                            let url = "https://finance.yahoo.com/news/rssindex";
                            let sourceName = "yahooFinance";
                            let data = await RSSFeeds.getRssFromSource(url);
                            data = await RSSFeeds.formatRssData(data, sourceName);
                            rssData = rssData.concat(data);
                            callback();
                        })();
                    },

                    function (callback) {
                        /*
							sourceName : Money Web
							Rss URL: https://www.moneyweb.co.za/feed/
						*/
                        (async () => {
                            let url = "https://www.moneyweb.co.za/feed/";
                            let sourceName = "moneyWeb";
                            let data = await RSSFeeds.getRssFromSource(url);
                            data = await RSSFeeds.formatRssData(data, sourceName);
                            rssData = rssData.concat(data);
                            callback();
                        })();
                    },

                    function (callback) {
                        /*
							sourceName : Business Matters
							Rss URL: https://bmmagazine.co.uk/feed/
						*/
                        (async () => {
                            let url = "https://bmmagazine.co.uk/feed/";
                            let sourceName = "businessMatters";
                            let data = await RSSFeeds.getRssFromSource(url);
                            data = await RSSFeeds.formatRssData(data, sourceName);
                            rssData = rssData.concat(data);
                            callback();
                        })();
                    },

                    function (callback) {
                        /*
							sourceName : Business Daily
							Rss URL: https://www.businessdailyafrica.com/latestrss.rss
						*/
                        (async () => {
                            let url = "https://www.businessdailyafrica.com/latestrss.rss";
                            let sourceName = "businessDaily";
                            let data = await RSSFeeds.getRssFromSource(url);
                            data = await RSSFeeds.formatRssData(data, sourceName);
                            rssData = rssData.concat(data);
                            callback();
                        })();
                    },

                    function (callback) {
                        /*
							sourceName : Insights Success
							Rss URL: https://www.insightssuccess.com/feed/
						*/
                        (async () => {
                            let url = "https://www.insightssuccess.com/feed";
                            let sourceName = "insightsSucess";
                            let data = await RSSFeeds.getRssFromSource(url);
                            data = await RSSFeeds.formatRssData(data, sourceName);
                            rssData = rssData.concat(data);
                            callback();
                        })();
                    },

                    function (callback) {
                        /*
							sourceName : Financial Post
							Rss URL: https://financialpost.com/feed
						*/
                        (async () => {
                            let url = "https://financialpost.com/feed";
                            let sourceName = "financialPost";
                            let data = await RSSFeeds.getRssFromSource(url);
                            data = await RSSFeeds.formatRssData(data, sourceName);
                            rssData = rssData.concat(data);
                            callback();
                        })();
                    },

                    function (callback) {
                        /*
							sourceName : Morning Star
							Rss URL: https://feeds.feedburner.com/morningstar/
						*/
                        (async () => {
                            let url = "https://feeds.feedburner.com/morningstar/";
                            let sourceName = "morningStar";
                            let data = await RSSFeeds.getRssFromSource(url);
                            data = await RSSFeeds.formatRssData(data, sourceName);
                            rssData = rssData.concat(data);
                            callback();
                        })();
                    },
                ],
                function () {
                    if (companyName && startDate && endDate) {
                        let results = rssData.filter((x) => x.title.toLowerCase().includes(companyName.toLowerCase()) || x.text.toLowerCase().includes(companyName.toLowerCase()));
                        results = RSSFeeds.FilterDataByDateRange(results, startDate, endDate);
                        console.log(results);
                        resolve(results);
                    } else {
                        resolve(rssData);
                    }
                }
            );
        });
    },

    formatRssData: function (items, sourceName) {
        console.log(sourceName);
        return new Promise((resolve) => {
            let data = [];
            async.eachSeries(
                items,
                function (item, callback) {
                    (async () => {
                        let object = {};
                        if (item.elements.find((x) => x.name === "title").elements) {
                            if (item.elements.find((x) => x.name === "title").elements[0] && item.elements.find((x) => x.name === "title").elements[0].text) {
                                object.title = item.elements.find((x) => x.name === "title").elements[0].text;
                            } else if (item.elements.find((x) => x.name === "title").elements[0] && item.elements.find((x) => x.name === "title").elements[0].cdata) {
                                object.title = item.elements.find((x) => x.name === "title").elements[0].cdata;
                            }
                            object.date = moment(new Date(item.elements.find((x) => x.name === "pubDate").elements[0].text)).format("yyyy-MM-DD");
                            object.link = item.elements.find((x) => x.name === "link").elements[0].text;
                            if (sourceName === "yahooFinance" && !object.link.includes("yahoo.com")) {
                                callback();
                            } else {
                                object.source = sourceName;
                                object.text = articleScrapers[sourceName] ? await articleScrapers[sourceName](object.link) : "";
                                data.push(object);
                                callback();
                            }
                        } else {
                            callback();
                        }
                    })();
                },
                function () {
                    resolve(data);
                }
            );
        });
    },

    getRssFromSource: function (url) {
        return new Promise((resolve) => {
            try {
                curl.get(url, function (err, response, body) {
                    let result = convert.xml2json(body, { compact: false, spaces: 4, ignoreDeclaration: true, trim: true, ignoreAttributes: true });
                    result = JSON.parse(result);
                    // console.log(result);
                    let items = result.elements[0].elements[0].elements.filter((x) => x.name === "item");
                    // console.log(items);
                    resolve(items);
                });
            } catch (error) {
                console.log(error);
                resolve([]);
            }
        });
    },

    FilterDataByDateRange: function (data, startDate, endDate) {
        return data.filter((x) => moment(x.date).isBetween(moment(startDate), moment(endDate), "day", "[]"));
    },
};

// async function test(){
// 	const fs = require('fs');
// 	curl.get('https://feeds.feedburner.com/morningstar/', function(err, response, body) {
// 		 let result = convert.xml2json(body, {compact: false, spaces: 4,ignoreDeclaration:true,trim:true,ignoreAttributes:true});
// 	  	fs.writeFile('jsonOutput.json',result,function(err){
// 	  		//
// 	  	});
// 	  	result = JSON.parse(result);
// 	  	console.log(typeof result);

// 	  	let items = result.elements[0].elements[0].elements.filter(x => x.name === 'item' && x.elements[0].elements);
// 	  	let rssFormatedData = formatRssData(items);
// 	  	console.log(rssFormatedData);
// 	});
// }

module.exports = RSSFeeds;
