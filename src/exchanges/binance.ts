import axios, { AxiosRequestConfig } from 'axios';
import { ResponceFutureStats } from '../update-orderbook';

export class Binance {
    id = 'binance';
    URLS = { REST: 'https://fapi.binance.com' };
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
    reformatResponce = (type, responce) => {
        if (type === 'futureStats') {
            return {
                nextFundingRate: responce['predicted_funding_rate'],
                openInterest: responce['open_interest'],
                volume: responce['volume_24h'],
            }
        }
    }
    convertSymbol = (input: string) => {
        if (input.includes('/')) {
            throw new Error("[INVALID_SYMBOL]:SPOT symbol" + input);
        }
        if (input.includes('-PERP')) {
            console.log('[Info]: Replaced -PERP to USDT');
            return input.replace('-PERP', 'USDT');
        }
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
    futureStats = async (market: string): Promise<ResponceFutureStats> => {
        const targetPath = '/fapi/v1/openInterest'
        const req = this.setRequest(targetPath, 'GET', { symbol: this.convertSymbol(market) })
        return await axios(req).then(r => r.data)
    }
}


if (require.main === module) {
    (async () => {
        const binance = new Binance('BTCUSDT', {})
        const res2 = await binance.futureStats('BTCUSDT')
        console.log('res2 :>> ', res2);
    })()
}