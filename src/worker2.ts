import * as cluster from 'cluster';
import FTXWs from "ftx-api-ws"
import { on } from "events"

const ws = new FTXWs() as any;
const go = async (ws) => {
    await ws.connect();
    ws.subscribe('trades', 'BTC-PERP');
    // ws.on('BTC-PERP::trades', (res) => setTimeout(console.log, 0, res));
    for await (const event of on(ws, "BTC-PERP::trades")) {
        // console.log('event :>> ', event);
        process.send(event[0])
        // queue.push(event)
    }
    process.on('message', (msg) => {
        console.log('msg [worker]:>> ', msg);
        if (msg == 'shutdown') {
            process.exit(0)
        }
    });
    // process.exit(0)
    // setInterval(() => {
    // process.send(queue)
    // }, 2000)
}
if (cluster.worker && process.env.WorkerName == "worker2") {
    go(ws);
}
