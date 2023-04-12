//set server public IP
const serverPublicIP = `20.8.168.164`;

//delete company sheet
function deleteCompanySheet() {
    let symbol = SpreadsheetApp.getActiveSheet().getRange("B17").getValue();
    let year = SpreadsheetApp.getActiveSheet().getRange("T17").getValue();
    let url = `http://${serverPublicIP}:3005/api/delete`;
    var options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify({ symbol: symbol, year: year }),
    };
    let response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
        SpreadsheetApp.getUi().alert("Company sheet deleted successfully");
    } else {
        SpreadsheetApp.getUi().alert("Something went wrong, try again or check server logs");
    }
}

//update/refresh company data
function refreshCompanySheet() {
    let data = {};
    data.name = SpreadsheetApp.getActiveSheet().getRange("C17").getValue();
    data.symbol = SpreadsheetApp.getActiveSheet().getRange("B17").getValue();
    data.year = SpreadsheetApp.getActiveSheet().getRange("T17").getValue();
    data.market = SpreadsheetApp.getActiveSheet().getRange("E17").getValue();
    data.primarySource = SpreadsheetApp.getActiveSheet().getRange("C10").getValue();
    // console.log('data ------------>',data);
    // SpreadsheetApp.getUi().alert(JSON.stringify(data));
    let url = `http://${serverPublicIP}:3005/api/start`;
    var options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(data),
    };
    let response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() === 200) {
        SpreadsheetApp.getUi().alert("Company sheet updated successfully");
    } else {
        SpreadsheetApp.getUi().alert("Something went wrong, try again or check server logs");
    }
}

//show create new company popup
function showNewCompanyPopup() {
    var template = HtmlService.createTemplateFromFile("index");
    var html = template.evaluate();
    html.setTitle("Add new company");
    SpreadsheetApp.getUi().showSidebar(html);
}

//create new company
function createNewCompanySheet(data) {
    let url = `http://${serverPublicIP}:3005/api/start`;
    var options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(data),
    };
    let response = UrlFetchApp.fetch(url, options);
}

//Refresh company rss feeds
function refreshCompanyRssFeeds() {
    let sheetID = SpreadsheetApp.getActiveSheet().getSheetId();
    let startDate = SpreadsheetApp.getActiveSheet().getRange("G139").getValue();
    let endDate = SpreadsheetApp.getActiveSheet().getRange("H139").getValue();
    let companyName = SpreadsheetApp.getActiveSheet().getRange("C17").getValue();
    let obj = {
        sheetID: sheetID,
        startDate: startDate,
        endDate: endDate,
        companyName: companyName,
    };
    let url = `http://${serverPublicIP}:3005/api/rss/update`;
    var options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(obj),
    };
    let response = UrlFetchApp.fetch(url, options);

    if (response.getResponseCode() === 200) {
        SpreadsheetApp.getUi().alert("Company RSS feeds updated successfully");
        //update last updated date value
        SpreadsheetApp.getActiveSheet().getRange("C139").setValue(new Date());
    } else {
        SpreadsheetApp.getUi().alert("Something went wrong, try again or check server logs");
    }
}


//scroll to rss section
function scrollToRSS(){
  SpreadsheetApp.getActiveSheet().setActiveRange(SpreadsheetApp.getActiveSheet().getRange('B145:I146'));
}

//scroll to financial section
function scrollToFinancial(){
  SpreadsheetApp.getActiveSheet().setActiveRange(SpreadsheetApp.getActiveSheet().getRange('B4:J12'));
}
