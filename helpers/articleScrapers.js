var request = require("request");
var cheerio = require("cheerio");
const got = require("got");
const generalHelpers = require("../helpers/general");

const Helpers = {
    /*
		scrape article text from [seekingAlpha]
	*/
    seekingAlpha: function (url) {
        return new Promise(async (resolve) => {
            try {
                let html = await got(url);
                var $ = cheerio.load(html.body);
                var article = "";
                var text = $('[data-test-id="article-content"] p')
                    .filter(function () {
                        return $(this).text().length > 0;
                    })
                    .each((i, el) => {
                        article += $(el).text().trim();
                        article += "\n\n";
                    });
                resolve(article);
            } catch (error) {
                console.log(`error while scrape seekingAlpha article`, error);
                resolve("");
            }
        });
    },

    /*
		scrape article text from [investingDotCom]
	*/
    investingDotCom: function (url) {
        return new Promise(async (resolve) => {
            try {
                let html = await got(url);
                var $ = cheerio.load(html.body);
                $("#imgCarousel,.relatedInstrumentsWrapper").remove();
                var article = "";
                var text = $(".articlePage p")
                    .filter(function () {
                        return $(this).text().length > 0;
                    })
                    .each((i, el) => {
                        article += $(el).text().trim();
                        article += "\n\n";
                    });
                resolve(article);
            } catch (error) {
                console.log(`error while scrape investingDotCom article`, error);
                resolve("");
            }
        });
    },

    /*
		scrape article text from [yahooFinance]
	*/
    yahooFinance: function (url) {
        return new Promise(async (resolve) => {
            try {
                let html = await got(url);
                var $ = cheerio.load(html.body);
                $(".caas-list").remove();
                var article = "";
                var text = $(".caas-body p")
                    .filter(function () {
                        return $(this).text().indexOf("Most Read from") == -1 && $(this).text().length > 0;
                    })
                    .each((i, el) => {
                        article += $(el).text().trim();
                        article += "\n\n";
                    });
                resolve(article);
            } catch (error) {
                console.log(`error while scrape yahooFinance article`, error);
                resolve("");
            }
        });
    },

    /*
		scrape article text from [cnbc]
	*/
    cnbc: function (url) {
        return new Promise(async (resolve) => {
            try {
                let html = await got(url);
                var $ = cheerio.load(html.body);
                var article = "";
                var text = $("#RegularArticle-ArticleBody-5 .group p")
                    .filter(function () {
                        return $(this).text().length > 0;
                    })
                    .each((i, el) => {
                        article += $(el).text().trim();
                        article += "\n\n";
                    });
                resolve(article);
            } catch (error) {
                console.log(`error while scrape cnbc article`, error);
                resolve("");
            }
        });
    },

    /*
		scrape article text from [businessDaily]
	*/
    businessDaily: function (url) {
        return new Promise(async (resolve) => {
            try {
                let html = await got(url);
                var $ = cheerio.load(html.body);
                $(".article-story .noprint, .article-img-story , header, .article-story script").remove();
                var article = "";
                var text = $(".article-story p")
                    .filter(function () {
                        return $(this).text().length > 0;
                    })
                    .each((i, el) => {
                        article += $(el).text().trim();
                        article += "\n\n";
                    });
                resolve(article);
            } catch (error) {
                console.log(`error while scrape businessDaily article`, error);
                resolve("");
            }
        });
    },

    /*
		scrape article text from [fortune]
	*/
    fortune: function (url) {
        return new Promise(async (resolve) => {
            try {
                let html = await got(url);
                var $ = cheerio.load(html.body);
                var article = "";
                var text = $(".rawHtml-content .paywall p")
                    .filter(function () {
                        return $(this).text().length > 0;
                    })
                    .each((i, el) => {
                        article += $(el).text().trim();
                        article += "\n\n";
                    });
                resolve(article);
            } catch (error) {
                console.log(`error while scrape fortune article`, error);
                resolve("");
            }
        });
    },

    /*
		scrape article text from [moneyWeb]
	*/
    moneyWeb: function (url) {
        return new Promise(async (resolve) => {
            request(url, function (error, response, html) {
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(html);
                    $("#article-body-content script").remove();
                    var article = "";
                    var text = $("#article-body-content .article-content p")
                        .filter(function () {
                            return $(this).text().length > 0;
                        })
                        .each((i, el) => {
                            article += $(el).text().trim();
                            article += "\n\n";
                        });
                    resolve(article);
                } else {
                    console.log(`error while scrape seekingAlpha article`, error);
                    resolve("");
                }
            });
        });
    },

    /*
		scrape article text from [financialPost]
	*/
    financialPost: function (url) {
        return new Promise(async (resolve) => {
            request(url, function (error, response, html) {
                if (!error && response.statusCode == 200) {
                    var $ = cheerio.load(html);
                    $(".visually-hidden").remove();
                    var article = "";
                    var text = $("article.article-content-story section.article-content__content-group p")
                        .filter(function () {
                            return $(this).text().length > 0;
                        })
                        .each((i, el) => {
                            article += $(el).text().trim();
                            article += "\n\n";
                        });
                    resolve(article);
                } else {
                    console.log(`error while scrape seekingAlpha article`, error);
                    resolve("");
                }
            });
        });
    },

    /*
		scrape article text from [businessMatters]
	*/
    businessMatters: function (url) {
        return new Promise(async (resolve) => {
            try {
                let html = await got(url);
                var $ = cheerio.load(html.body);
                $("style").remove();
                var article = "";
                var text = $("article .entry-content p")
                    .filter(function () {
                        return $(this).text().length > 0;
                    })
                    .each((i, el) => {
                        article += $(el).text().trim();
                        article += "\n\n";
                    });
                resolve(article);
            } catch (error) {
                console.log(`error while scrape businessMatters article`, error);
                resolve("");
            }
        });
    },

    /*
		scrape article text from [insightsSucess]
	*/
    insightsSucess: function (url) {
        return new Promise(async (resolve) => {
            try {
                let html = await got(url);
                var $ = cheerio.load(html.body);
                var article = "";
                var text = $("article .entry-content p,article .entry-content h2,article .entry-content h1")
                    .filter(function () {
                        return $(this).text().length > 0;
                    })
                    .each((i, el) => {
                        article += $(el).text().trim();
                        article += "\n\n";
                    });
                resolve(article);
            } catch (error) {
                console.log(`error while scrape insightsSucess article`, error);
                resolve("");
            }
        });
    },

    /*
		scrape article text from [insightsSucess]
	*/
    // financialTimes:function(url){
    // 	return new Promise(async(resolve)=>{
    // 		try{
    // 			let username = 'anujsdatta2@googlemail.com';
    // 			let password = 'WKdUppAWB6ugMqDMK3td';
    // 			const browser = await generalHelpers.initializeBrowser();
    // 			const page = await browser.newPage();
    // 			await page.goto(url,{
    // 				timeout:120000,
    // 				waitUntil:['load','domcontentloaded']
    // 			});
    // 			console.log('financialTimes page loaded');
    // 			await page.waitForTimeout(3000);
    // 			await page.click(`a.o-header__top-link[data-trackable]`);
    // 			// await page.waitForNavigation({
    // 			// 	timeout:120000,
    // 			// 	waitUntil:['load','domcontentloaded']
    // 			// });
    // 			await page.waitForFunction("window.location.href.includes('accounts.ft.com/login')");
    // 			await page.waitForSelector('[id="enter-email"]',{visible:true});
    // 			await page.waitForTimeout(3000);
    // 			console.log('financialTimes login page loaded');
    // 			//enter username
    // 			await page.type('[id="enter-email"]',username,{delay: 200});
    // 			//click next button
    // 			await page.click('button[id="enter-email-next"]');
    // 			await page.waitForSelector('[id="enter-password"]',{visible:true});
    // 			await page.waitForTimeout(3000);
    // 			console.log('should enter password');
    // 			//enter password
    // 			await page.type('[id="enter-password"]',password,{delay: 200});
    // 			//click submit button
    // 			await page.click('button[id="sign-in-button"]');
    // 			//wait
    // 			await page.waitForNavigation({
    // 				timeout:120000,
    // 				waitUntil:['load','domcontentloaded']
    // 			});
    // 			console.log('article page loaded');

    // 			let article = await page.evaluate(()=>{
    // 				let article = '';
    // 				document.querySelectorAll('.article__content-body p').forEach((el)=>{
    // 					article += el.innerText.trim();
    // 					article += '\n\n';
    // 				});
    // 				return article;
    // 			});
    // 			await browser.close();
    // 			resolve(article);
    // 		}catch(error){
    // 			console.log(`error while scrape financialTimes article`,error);
    // 			resolve('');
    // 		}

    // 	});
    // }
};

module.exports = Helpers;

// try{
// 	(async()=>{
// 		let url = 'https://www.ft.com/content/f35f74c9-f020-4b7c-8641-9c62e27de82a';
// 		let username = 'anujsdatta2@googlemail.com';
// 		let password = 'WKdUppAWB6ugMqDMK3td';
// 		const browser = await generalHelpers.initializeBrowser();
// 		const page = await browser.newPage();
// 		await page.goto(url,{
// 			timeout:120000,
// 			waitUntil:['load','domcontentloaded']
// 		});
// 		console.log('financialTimes page loaded');
// 		await page.waitForTimeout(3000);
// 		await page.click(`a.o-header__top-link[data-trackable]`);
// 		// await page.waitForNavigation({
// 		// 	timeout:120000,
// 		// 	waitUntil:['load','domcontentloaded']
// 		// });
// 		await page.waitForFunction("window.location.href.includes('accounts.ft.com/login')");

// 		// await page.waitForNavigation({
// 		// 	timeout:120000,
// 		// 	waitUntil:['load','domcontentloaded']
// 		// });
// 		await page.waitForSelector('[id="enter-email"]',{visible:true});

// 		await page.waitForTimeout(3000);
// 		console.log('financialTimes login page loaded');
// 		//enter username
// 		await page.type('[id="enter-email"]',username,{delay: 200});
// 		//click next button
// 		await page.click('button[id="enter-email-next"]');
// 		// await page.waitForNavigation({
// 		// 	timeout:120000,
// 		// 	waitUntil:['load','domcontentloaded']
// 		// });
// 		await page.waitForSelector('[id="enter-password"]',{visible:true});

// 		await page.waitForTimeout(3000);
// 		console.log('should enter password');
// 		//enter password
// 		await page.type('[id="enter-password"]',password,{delay: 200});
// 		//click submit button
// 		await page.click('button[id="sign-in-button"]');
// 		await page.waitForTimeout(3000);
// 		await page.solveRecaptchas();
// 		//wait
// 		await page.waitForNavigation({
// 			timeout:120000,
// 			waitUntil:['load','domcontentloaded']
// 		});
// 		console.log('article page loaded');

// 		let article = await page.evaluate(()=>{
// 			let article = '';
// 			document.querySelectorAll('.article__content-body p').forEach((el)=>{
// 				article += el.innerText.trim();
// 				article += '\n\n';
// 			});
// 			return article;
// 		});

// 		console.log(article);
// 		await browser.close();
// 	})()
// }catch(error){
// 	console.log('error while scrape financialTimes article',error);
// }

// let url = 'https://finance.yahoo.com/news/twitter-offers-buy-back-outstanding-120251428.html';
// try{
// 	(async()=>{
// 		let html = await got(url);
// 		// console.log(html.body);
// 		var $ = cheerio.load(html.body);
// 		// $('.article-story .noprint, .article-img-story , header, .article-story script').remove();
// 		// $('.visually-hidden').remove();
// 		$('.caas-list').remove();
// 		var article = '';
// 		var text = $('.caas-body p').filter(function() {
// 		  return $(this).text().indexOf('Most Read from') == -1;
// 		}).each((i,el)=>{
// 				article += $(el).text().trim();
// 				article += '\n\n';
// 		});
// 		console.log(article);
// 		// resolve(text);
// 	})()
// }catch(error){
// 	console.log(`error while scrape businessDaily article`,error);
// 	// resolve('');
// }

/*
businessdaily
cnbc
fortune
investingDotCom
yahoo
moneyWeb
businessMatters
financialPost
insightsSucess
*/
