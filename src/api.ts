import * as path from 'path';
import * as querystring from 'querystring';
import axios from 'axios';

export class FTX {
    END_POINT = 'https://ftx.com/api';
    market: string
    constructor(market = 'BTC-PERP', config = {}) {
        this.market = market;
    }
    request = async (target, market = this.market, data?) => {
        if (target === 'orderbook')
            return this.orderbook(market, data);
        if (target === 'trades')
            return this.trades(market, data);
    }
    setRequest = (targetPath, method, data = {}) => {
        const request = {};
        if (method === 'GET') {
            let url = path.join(this.END_POINT, targetPath)
            if (data)
                url = url + '?' + querystring.stringify(data)
            request['method'] = 'GET';
            request['url'] = url;
        }
        return request
    }
    orderbook = async (market = this.market, data?: { depth: number }) => {
        const targetPath = path.join('markets/', market, '/orderbook')
        const query = data || {}
        const req = this.setRequest(targetPath, 'GET', query)
        console.log('req :>> ', req);
        return await axios(req)//.then(r => r.data);
    }
    trades = async (market = this.market, query?: { limit: number, start_time: number, end_time: number }) => {
        const targetPath = path.join('markets/', market, '/trades')
        const data = Object.keys(query).reduce((prev, current,) => query[current] && (prev[current] = query[current]), {})
        const req = this.setRequest(targetPath, 'GET', data)
        return await axios(req)//.then(r => r.data);
    }
}

const ftx = new FTX('ETH-PERP', {})
const request = async (exchange, target, data?, market?) => {
    try {
        if (exchange === 'ftx')
            return await ftx.request(target, market, data);
    } catch (e) {
        console.log('e :>> ', e.message);
    }
}

if (require.main === module) {
    (async () => {
        const res = await request('ftx', 'orderbook', { depth: 20 })
        console.log('res :>> ', res);
    })()
}