import axios, { AxiosRequestConfig } from 'axios';

export class Bybit {
    id = 'bybit';
    URLS = { REST: 'https://api.bybit.com' };
    market: string
    config;
    // Inverse Perp :BTCUSD
    // USDT Perp : BTCUSDT
    /** Map<commonSymbol, bybitSymbol> */
    // symbolMapping = new Map([['BTC', 'BTCUSD'], ['BTC-PERP', 'BTCUSDT'], ['BTC/USD', null]]);
    constructor(market = 'BTCUSD', config = {}) {
        this.market = market;
        this.config = config;
    }
    convertSymbol = (input: string) => {
        if (input.includes('/USD')) {
            throw new Error("[INVALID_SYMBOL]: symbol" + input);
        }
        if (input.includes('-PERP'))
            return input.replace('-PERP', 'USDT');
        if (input.includes('USD'))
            return input;
        else throw new Error("[INVALID_SYMBOL]: symbol" + input);
    }
    setRequest = (targetPath: string, method: string, data = null) => {
        const request: AxiosRequestConfig = {};
        if (method === 'GET') {
            const url = "".concat(this.URLS['REST'], targetPath);
            request['method'] = 'GET';
            request['url'] = url;
            request['params'] = data;
        }
        return request
    }
    // orderbook = async (market, depth = 20) => {
    //     const targetPath = "".concat('/markets/', market, '/orderbook')
    //     const req = this.setRequest(targetPath, 'GET', { depth: depth })
    //     return await axios(req).then(r => r.data.result);
    // }
    // trades = async (market, limit = 20, startTime?: number, endTime?: number) => {
    //     const targetPath = "".concat('/markets/', market, '/trades')
    //     const params = { limit: limit }
    //     if (startTime)
    //         params['start_time'] = startTime;
    //     if (endTime)
    //         params['end_time'] = endTime;
    //     const req = this.setRequest(targetPath, 'GET', params)
    //     return await axios(req).then(r => r.data.result);
    // }
    futureStats = async (market: string) => {
        //  /v2/public/tickers
        const targetPath = '/v2/public/tickers'
        const req = this.setRequest(targetPath, 'GET', { symbol: this.convertSymbol(market) })
        return await axios(req).then(r => r.data.result);
    }
}


if (require.main === module) {
    (async () => {
        const bybit = new Bybit('ETHUSD', {})
        const res2 = await bybit.futureStats('BTCUSD')
        console.log('res2 :>> ', res2);
    })()
}