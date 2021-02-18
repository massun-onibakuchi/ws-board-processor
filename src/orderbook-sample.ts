import * as cluster from "cluster";
import { on, once } from 'events'
import { createWriteStream } from 'fs'
import { Logic } from './analysis';
import { cpus } from "os";

const numCPUs = cpus().length
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// including private channels:
// const ftx = new FTXWs({
//   key: 'x',
//   secret: 'y',
//   subaccount: 'z'
// })

const path = './orderbook.csv'
const ftx = new Logic() as any;
// const stream = createWriteStream(path)
// const ftx = new BoardManagment() as any

// if (cluster.isMaster) {
//     for (var i = 0; i < numCPUs; i++) {
//         // Create a worker
//         cluster.fork();
//     }
// }
const go = async () => {
    const queue = []
    await ftx.ws.connect();
    ftx.ws.subscribe('orderbook', 'BTC-PERP');
    // ftx.ws.on('BTC-PERP::orderbook', (res) => setTimeout(console.log, 0, res));
    // ftx.ws.on('BTC-PERP::orderbook', (res: ResponeBook) => ftx.realtime(res));
    for await (const event of on(ftx.ws, "BTC-PERP::orderbook")) {
        // ftx.boardAnalysis(event[0]);
        console.log('events[0].bids :>> ', event[0].bids,/*  'events[0].asks :>> ',event[0].asks */);
        // ftx.realtime(event[0])
    }

    ftx.ws.subscribe('trades', 'BTC-PERP');
    // ftx.ws.on('BTC-PERP::trades', (res) => setTimeout(console.log, 0, res));
    for await (const event of on(ftx.ws, "BTC-PERP::trades")) {
        console.log('event :>> ', event)
    }
    // ftx.ws.subscribe('market', 'BTC-PERP');
    // ftx.ws.on('BTC-PERP::market', console.log);
    // if you passed api credentials:
    // ftx.ws.subscribe('fills');
    // ftx.ws.on('fills', console.log);
    // // if you want to know when the status of underlying socket changes
    // ftx.ws.on('statusChange', console.log);
};
go();
