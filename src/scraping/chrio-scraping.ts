import cheerio from 'cheerio';
import fetch from 'node-fetch';

(async () => {
    const url = 'https://ftx.com/trade/BTC-PERP';
    const res = await fetch(url);
    const html = await res.text();
    try {
        const $ = cheerio.load(html)
        const latestDate = $('#root div div:nth-child(3) div main div.jss585 div:nth-child(2) div div:nth-child(6) div div div:nth-child(3) span div p:nth-child(2) b').text()
        console.log('latestDate :>> ', latestDate);
        // const latestDate = $('.newsList').children().first().text().trim()
        // console.log(`最新の新着情報の日付は${latestDate}です。`)
    } catch (e) {
        console.error(e)
    }
})();