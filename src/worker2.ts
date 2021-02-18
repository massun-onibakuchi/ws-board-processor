import * as cluster from 'cluster';
import { BoardManagment } from "./update-orderbook";
import { on } from "events"

const ftx = new BoardManagment();
const ws = async (ftx) => {
    await ftx.ws.connect();
    let queue = [];
    ftx.ws.subscribe('trades', 'BTC-PERP');
    // ftx.ws.on('BTC-PERP::trades', (res) => setTimeout(console.log, 0, res));
    for await (const event of on(ftx.ws, "BTC-PERP::trades")) {
        // console.log('event :>> ', event);
        process.send(event)
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
    ws(ftx);
}
