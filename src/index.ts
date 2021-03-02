import * as cluster from "cluster";
import path from "path";
import config from 'config';
import { BoardProcessor } from "./analysis";
import { ResponceMarkerOrder, ResponeBook } from "./update-orderbook";
import { cpus } from 'os';

if (cpus().length < 2) {
    console.log('ERROR: cpu core < 2');
    process.exit(1);
}

const EXCHANGE: string = process.env.EXCHANGE || config.get<string>('EXCHANGE');
const MARKET: string = process.env.MARKET || config.get<string>('MARKET');
const INTERVAL: number = parseInt(process.env.INTERVAL) || config.get<number>('INTERVAL');
const MAX_RESERVE: number = config.get<number>('MAX_RESERVE');
const filePath = `result_${MARKET}_${INTERVAL}_${new Date(Date.now()).toISOString().replace(/\....Z/, '')}.csv`;

const logic = new BoardProcessor(EXCHANGE, filePath, INTERVAL, MAX_RESERVE);

cluster.setupMaster({
    exec: path.join(process.cwd(), 'src/subscribe.ts'),
});
const worker1 = cluster.fork({ target: "orderbook" });
const worker2 = cluster.fork({ target: "trades" })

worker1.on('message', (res: ResponeBook) => setTimeout(() => logic.boardAnalysis(res), 0));
worker2.on('message', (res: ResponceMarkerOrder[]) => setTimeout(() => logic.marketOrderAnalysis(res), 0));
