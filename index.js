const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const apiRoutes = require('./routes/api');
const port = 4005;
const path = require("path");
const connectDB = require('./config/database');
app.use(bodyParser.json());
app.use('/api/',apiRoutes);
app.use(express.urlencoded({ extended: true })); 
connectDB();

app.get('/', (req, res) => {
  res.send('<center>Welcome to Financial dashboard automation script <br> This script has no user interface!</center>');
})


app.listen(port, () => {
  console.log(`Automation script listening on port ${port}`);
})
