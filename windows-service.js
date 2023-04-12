var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'Financial dashboard Scraper',
  script: require('path').join(__dirname,'index.js')
});


svc.on('install',function(){
  svc.start();
});


svc.install();