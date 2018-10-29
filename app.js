"use strict";
var express = require("express");
var path = require("path");
var app = express();
var scraper = require('./scrapeData');

app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);

app.use(express.static(path.join(__dirname, ".")));

// ReSharper disable once PossiblyUnassignedProperty
app.set("port", process.env.PORT || 3000);

app.get('/', (req, res) => {
    res.render('index.html', {
        title: "Workshop Viewer"
    });
})

app.get('/game/:id', (req, res) => {
    var totalEntries,
        pageSize,
        currentPage = 1,
        items = [],
        itemsArray = [],
        itemsList = [];
    if (typeof req.query.page !== "undefined") {
        currentPage = +req.query.page;
    }
    scraper.main(req.params.id, currentPage).then(out => {
        var table = out;

        //Pagination
        var pageCount = parseInt(parseInt(table[0].totalItems) / 30) + 1;
        totalEntries = parseInt(table[0].totalItems);
        pageSize = table.length;
        for (let i = 0; i < table.length; i++) {
            items.push(table[i]);
        }
        while (items.length > 0) {
            itemsArray.push(items.splice(0, pageSize));
        }
        itemsList = itemsArray[0];
        res.render('game.html', {
            table: table,
            title: "Workshop Items",
            items: itemsList,
            pageSize: pageSize,
            totalEntries: totalEntries,
            pageCount: pageCount,
            currentPage: currentPage,
            id: req.params.id
        });
    });
});
var server = app.listen(8081, function () {
    console.log("Express server listening on port " + server.address().port);
});