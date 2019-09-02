var express = require("express");
var path = require("path");
var app = express();
var scraper = require('./js/scrapeData.min');
var axios = require('axios');

app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);

app.use(express.static(path.join(__dirname, ".")));

app.set("port", process.env.PORT || 3000);

app.get('/', (req, res) => {
    res.render('index.html', {
        title: "Workshop Scraper"
    });
});

app.get('/search/:id', (req, res) => {
    axios.get(`https://steamcommunity.com/workshop/ajaxfindworkshops/?searchText=${req.params.id}`).then((data) => {
        res.json(data.data);
    }).catch(err => console.log(err));
});

app.get('/game/:id', (req, res) => {
    var totalEntries,
        pageSize,
        currentPage = 1,
        items = [],
        itemsArray = [],
        itemsList = [],
        maxPage = 1000;
    if (typeof req.query.page !== "undefined") {
        currentPage = +req.query.page;
    }
    scraper.main(req.params.id, currentPage).then(out => {
        var table = out;

        //Pagination

        var pageCount = parseInt(parseInt(table[0].totalItems) / 30) + 1;
        if (pageCount > maxPage) {
            pageCount = 1000;
        }
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
            title: "Game " + req.params.id + " - Workshop Scraper",
            items: itemsList,
            pageSize: pageSize,
            totalEntries: totalEntries,
            pageCount: pageCount,
            currentPage: currentPage,
            id: req.params.id
        });
    }).catch((r) => {
        res.status(408).render('error.html');
    });
});
var server = app.listen(app.get("port"), function () {
    console.log("Express server listening on port " + server.address().port);
});