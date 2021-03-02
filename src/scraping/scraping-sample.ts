import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

(async () => {
    const url = 'https://ftx.com/trade/BTC-PERP';
    const bybitURL = 'https://www.bybit.com/data/basic/linear/contract-detail?symbol=BTCUSDT';
    // #root > div > div:nth-child(3) > div > main > div.jss585 > div:nth-child(2) > div > div:nth-child(6) > div > div > div:nth-child(3) > span > div > p:nth-child(2) > b
    const res = await fetch(bybitURL);
    const html = await res.text();
    // //*[@id="root"]/div/div[2]/div/main/div[3]/div[3]/div
    const dom = new JSDOM(html);
    const document = dom.window.document;
    // const nodes = document.querySelectorAll('#infotablefont tr:nth-child(4) td');
    //#root > div > main > section > div > div.bd-cd > ul > li:nth-child(16) > span.bdcd__info-value
    const nodes = document.querySelectorAll('li[class="bdcd__info-item"]')
    const tokyoWeathers = Array.from<any>(nodes).map(td => td.textContent.trim());
    console.log('document :>> ', JSON.stringify(document));
    console.log('nodes :>> ', nodes);
    console.log(tokyoWeathers);
})();