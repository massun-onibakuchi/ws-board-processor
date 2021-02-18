import * as cluster from "cluster";
import FTXWs from "ftx-api-ws"
import { on } from 'events'

if (cluster.worker && process.env.WorkerName == "worker1") {
    console.log('process.pid :>> ', process.pid);
    const ws = new FTXWs();
    const go = async (ws) => {
        await ws.connect();
        ws.subscribe('orderbook', 'BTC-PERP');
        // ws.on('BTC-PERP::orderbook', (res) => setTimeout(console.log, 0, res));
        // ws.on('BTC-PERP::orderbook', (res: ResponeBook) => realtime(res));
        for await (const event of on(ws, "BTC-PERP::orderbook")) {
            // ftx.boardAnalysis(event[0]);
            // console.log('bids :>> ', event[0].bids,/*  'events[0].asks :>> ',event[0].asks */);
            process.send(event)
            // ftx.realtime(event[0])
        }
        // ftx.ws.subscribe('trades', 'BTC-PERP');
        // // ftx.ws.on('BTC-PERP::trades', (res) => setTimeout(console.log, 0, res));
        // for await (const event of on(ftx.ws, "BTC-PERP::trades")) {
        //     console.log('event :>> ', event)
        // }
    };
    go(ws)
}
