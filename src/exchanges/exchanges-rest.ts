import { FTX } from './ftx-api';

const ExchangesREST = {
    'ftx': FTX
}
const ExchangesWS = {
    'ftx': null
}

export interface ExchangeREST {
    futureStats: () => Promise<any>
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
        const instances = {};
        const exchanges = []
        for (const id of ids) {
            instances[id] = new ExchangesREST[id.toLowerCase()]();
            exchanges.push(new ExchangesREST[id.toLowerCase()]())
        }
        // return instances;
        return exchanges
    }
    static exchangeREST(id: string): ExchangeREST {
        return new ExchangesREST[id.toLowerCase()]()
    }

    static exchangeWS(id: string) {
        return new ExchangesWS[id.toLowerCase()]()
    }
}