import * as cluster from "cluster";
import FTXWs from "ftx-api-ws"
import { on } from 'events'

const ws = new FTXWs();

const go = async (ws) => {
    await ws.connect();
    ws.subscribe('orderbook', 'BTC-PERP');
    for await (const event of on(ws, "BTC-PERP::orderbook")) {
        process.send(event[0])
    }
};
go(ws)

