import * as cluster from 'cluster';
import config from 'config';
import FTXWs from "ftx-api-ws"
import { on } from 'events'

const MARKET = config.get('MARKET');

const ws = new FTXWs();
console.log('[Info]: subscribe... MARKET', MARKET);
const go = async (ws) => {
    await ws.connect();

    ws.subscribe('orderbook', MARKET);
    for await (const event of on(ws, MARKET + "::orderbook")) {
        process.send(event[0])
    }

    ws.subscribe('trades', MARKET);
    for await (const event of on(ws, MARKET + "::trades")) {
        process.send(event[0])
    }
}

go(ws);


