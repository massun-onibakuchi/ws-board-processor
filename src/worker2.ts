import * as cluster from 'cluster';
import FTXWs from "ftx-api-ws"
import { on } from "events"


const ws = new FTXWs() as any;
const go = async (ws) => {
    await ws.connect();
    ws.subscribe('trades', 'BTC-PERP');
    for await (const event of on(ws, "BTC-PERP::trades")) {
        process.send(event[0])
    }
}

go(ws);
