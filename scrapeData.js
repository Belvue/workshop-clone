const puppeteer = require("puppeteer");
var pageId;
var maxPageSize = 0;

async function main(gameId, pages) {
    pageId = pages;
    var output = [];
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: true
    });
    console.log(`Loading Page ${pageId} for ${gameId}`);
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });

    await page.setRequestInterception(true);

    page.on('request', (req) => {
        if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
            req.abort();
        } else {
            req.continue();
        }
    });

    page.setUserAgent("Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3571.0 Mobile Safari/537.36");
    await page.goto(`https://steamcommunity.com/workshop/browse/?appid=${gameId}&browsesort=trend&section=readytouseitems&actualsort=trend&p=${pageId}`);
    const elem = "div.workshopItem";
    await page.waitForSelector(elem, {
        timeout: 2000
    });
    if (pageId === 1) {
        try {
            maxPageSize = await page.$eval('a.pagelink:nth-child(4)', page => parseInt(page.innerText.replace(',', '')));
            console.log(`Found ${maxPageSize} Page(s)`);
        } catch (ex) {
            maxPageSize = 1;
            console.log('couldn\'t find maxpage assuming 1 page');
        }
    }
    const collection = await page.$$(elem);

    for (let i = 0; i < collection.length; i++) {
        const elemz = collection[i];
        const mod = await elemz.$eval(".workshopItemTitle", modName => modName.innerText);
        const link = await elemz.$eval("a", href => href.href.replace("&searchtext=", ""));
        const author = await elemz.$eval(".workshopItemAuthorName a", author => author.innerText);
        const totalItems = await page.$eval(".workshopBrowsePagingInfo", items => parseInt(items.innerText.split(" ")[3].replace(",", "")));
        const image = await elemz.$eval('.workshopItemPreviewHolder .workshopItemPreviewImage', image => image.src);
        output.push({
            Mod: mod,
            Author: author,
            Link: link,
            Image: image,
            totalItems: totalItems
        });
    }
    await browser.close();
    return new Promise(resolve => {
        resolve(output);
    });
};

module.exports = {
    main: main
}