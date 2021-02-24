import config from 'config';
import FTXWs from "ftx-api-ws"
import { on } from 'events'

const MARKET = config.get('MARKET');
const TARGET = process.env.target;
const ws = new FTXWs();

console.log('[Info]: subscribe... channel ', `${MARKET}::${TARGET}`);
const go = async (ws) => {
    await ws.connect();
    ws.subscribe(TARGET, MARKET);
    for await (const event of on(ws, `${MARKET}::${TARGET}`)) {
        process.send(event[0])
    }
};
go(ws)

