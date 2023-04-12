const express = require('express');
const router = express.Router();
const API = require('../controllers/api');
//endpoint to file script and add new company
router.post('/start', API.start);
//endpoint to delete company data
router.post('/delete', API.delete);
//endpoint for updating rss in sheet
router.post('/rss/update',API.updateRSS);
//endpoint for getting rss data in JSON format -- just for TESTING
router.get('/rss/get',API.getRSS);

module.exports = router;