# Financial dashboard automation script

This nodeJs script aims to scrappe financial data from wide range of Financial websites

## Tech stack
- NodeJs
- Puppeteer & puppeteer-extra
- Google APIs
- Google Scripts
- MongoDB

## List of Features
- Scrape data from supported financial websites
- Integrate with Google sheets API to store scraped data
- Integrate with Google Apps Script to work as middle-man between nodeJs server and Google sheet
- Store data on mongoDB Database

## List of supported websites

- yahoo (www.yahoo.com)
- reuters (www.reuters.com)
- wsj (www.wsj.com)


## Project structure
```bash
├── .env //store all essential credentials needed for script to access different websites
├── controllers //This is where we hold logic and data manipulation
|   └── api.js //Main script API functions
├── focal-cooler-364814-88773190571b.json //Google Service bot , used to authenticate actions done through API
├── google scripts //Google scripts and code needed for each Google Sheet to be able to connect with nodeJs
|   |   ├── .gs //contains functions responsible for connecting with nodeJs API endpoints to control script actions 
|   |   └── index.html //loading page html code
├── helpers
|   ├── general.js //contains common functions shared between all script parts
|   ├── google.js //contains main logic and code functions to scrape google data
|   ├── reuters.js //contains main logic and code functions to scrape reuters data
|   ├── sheets.js //contains main logic and code functions to integrate with Google sheets
|   └── wsj.js //contains main logic and code functions to scrape wsj data
|   └── yahoo.js //contains main logic and code functions to scrape yahoo data
├── index.js //main script server initialization code
└── models //contains all script API endpoints and routing rules
|   └── companyData.js //Holds database model
└── routes //contains all script API endpoints and routing rules
    └── api.js //conatins routing rules and API endpoints functions
```

## Deployment

To deploy this project make sure you have the following requirements installed on your linux or windows machine and updated to the latest version
- Node.js
- NPM


for First time installation make sure you install project depencdencies via running

```bash
  npm i
```

then to run project server run 

```bash
    npm run start
```

*** 
Important Note:
Make sure to update MongoDB URL exist in .env file with your new MongoDB URL
* We recommend using MongoDB atlas free tier for easier experience and you may upgrade if there's a need

