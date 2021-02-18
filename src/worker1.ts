import * as cluster from "cluster";
import FTXWs from "ftx-api-ws"
import { on } from 'events'

if (cluster.worker && process.env.WorkerName != "worker1")
    process.exit(0)

const ws = new FTXWs();

const go = async (ws) => {
    await ws.connect();
    ws.subscribe('orderbook', 'BTC-PERP');
    for await (const event of on(ws, "BTC-PERP::orderbook")) {
        process.send(event[0])
    }
};
go(ws)

