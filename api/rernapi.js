var express = require('express');
var fs = require('fs');
var app = express();
var router = express.Router();
var port = process.env.PORT || 80;

global.__root = require('path').resolve(__dirname);
var chipData = require("../chip.json");
//var virusData = Object.assign(require(__root + "/storage/virus1.json"), require(__root + "/storage/virus2.json"));

router.get('/chip', function(req, res) {
    res.json(chipData);
});

router.get('/chip/age', function(req, res) {
    fs.stat(__root + "../chip.json", (err,stats) => {
        res.send(stats.mtime.toString());
    });
});

app.use('/api', router);
app.listen(port);
console.log(`RERN API online. Port: ${port}`);