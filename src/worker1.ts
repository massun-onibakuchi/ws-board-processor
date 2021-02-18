import * as cluster from "cluster";
import { on, once } from 'events'
import { BoardManagment } from "./update-orderbook";

if (cluster.worker && process.env.WorkerName == "worker1") {
    console.log('process.pid :>> ', process.pid);
    const go = async () => {
        const ftx = new BoardManagment();
        await ftx.ws.connect();
        ftx.ws.subscribe('orderbook', 'BTC-PERP');
        // ftx.ws.on('BTC-PERP::orderbook', (res) => setTimeout(console.log, 0, res));
        // ftx.ws.on('BTC-PERP::orderbook', (res: ResponeBook) => ftx.realtime(res));
        for await (const event of on(ftx.ws, "BTC-PERP::orderbook")) {
            // ftx.boardAnalysis(event[0]);
            // console.log('bids :>> ', event[0].bids,/*  'events[0].asks :>> ',event[0].asks */);
            process.send(event[0].bids)
            // ftx.realtime(event[0])
        }
        // ftx.ws.subscribe('trades', 'BTC-PERP');
        // // ftx.ws.on('BTC-PERP::trades', (res) => setTimeout(console.log, 0, res));
        // for await (const event of on(ftx.ws, "BTC-PERP::trades")) {
        //     console.log('event :>> ', event)
        // }
    };
    go()
}
