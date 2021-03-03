import { ResponceFutureStats } from '../update-orderbook';
import { FTX } from './ftx-api';

const ExchangesREST = {
    'ftx': FTX
}
const ExchangesWS = {
    'ftx': null
}

export interface ExchangeREST {
    id: string
    futureStats: (market: string) => Promise<ResponceFutureStats>
}
export class ExchangeFactory {
    static futureStats() {
        throw new Error('Method not implemented.');
    }
    static REST_INSTANCES = [];

    static initExchangesREST(exchanges: string[]) {
        for (const id of exchanges) {
            this.REST_INSTANCES.push(new ExchangesREST[id.toLowerCase()]())
        }
    }
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