const puppeteer = require("puppeteer");
var pageId;
var maxPageSize = 0;

async function main(gameId, pages) {
    pageId = pages;
    var output = [];
    const browser = await puppeteer.launch({
        headless: true
    });
    console.log(`Loading Page ${pageId}`);
    const page = await browser.newPage();
    page.setUserAgent("Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3571.0 Mobile Safari/537.36");
    await page.goto(`https://steamcommunity.com/workshop/browse/?appid=${gameId}&browsesort=trend&section=readytouseitems&actualsort=trend&p=${pageId}`);
    const elem = "div.workshopItem";
    await page.waitForSelector(elem);
    if (pageId === 1) {
        maxPageSize = await page.$eval('a.pagelink:nth-child(4)', page => parseInt(page.innerText.replace(',', '')));
        console.log(`Found ${maxPageSize} Page(s)`);
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