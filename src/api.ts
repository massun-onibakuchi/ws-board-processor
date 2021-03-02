import axios from 'axios';

export class FTX {
    URLS = { REST: 'https://ftx.com/api' };
    market: string
    config
    constructor(market = 'BTC-PERP', config = {}) {
        this.market = market;
        this.config = config;
    }
    setRequest = (targetPath: string, method: string, data = null) => {
        const request = {};
        if (method === 'GET') {
            const url = "".concat(this.URLS['REST'], targetPath);
            request['method'] = 'GET';
            request['url'] = url;
            request['params'] = data;
        }
        return request
    }
    orderbook = async (market = this.market, depth = 20) => {
        const targetPath = "".concat('/markets/', market, '/orderbook')
        const req = this.setRequest(targetPath, 'GET', { depth: depth })
        return await axios(req).then(r => r.data.result);
    }
    trades = async (market = this.market, limit = 20, startTime?: number, endTime?: number) => {
        const targetPath = "".concat('/markets/', market, '/trades')
        const params = { limit: limit }
        if (startTime)
            params['start_time'] = startTime;
        if (endTime)
            params['end_time'] = endTime;
        const req = this.setRequest(targetPath, 'GET', params)
        return await axios(req).then(r => r.data.result);
    }
}


if (require.main === module) {
    (async () => {
        const ftx = new FTX('ETH-PERP', {})
        const res = await ftx.orderbook('BTC-PERP', 20)
        console.log('res :>> ', res);
    })()
}