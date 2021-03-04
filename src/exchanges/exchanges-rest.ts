import { ResponceFutureStats } from '../update-orderbook';
import { FTX } from './ftx';
import { Bybit } from './bybit';
import { Binance } from './binance';

const ExchangesREST = {
    'ftx': FTX,
    'bybit': Bybit,
    'binance': Binance
}
const ExchangesWS = {
    'ftx': null
}

export interface ExchangeREST {
    id: string
    futureStats: (market: string) => Promise<ResponceFutureStats>
}

export class ExchangeFactory {
    static exchangesREST(ids: string[]) {
        const exchanges = []
        for (const id of ids) {
            exchanges.push(new ExchangesREST[id.toLowerCase()](id))
        }
        return exchanges
    }
    static exchangeWS(id: string) {
        return new ExchangesWS[id.toLowerCase()]()
    }
}