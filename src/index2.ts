import { on } from 'events'
import config from 'config';
import FTXWs from "ftx-api-ws"
import { BoardProcessor } from "./analysis";
import { ResponceMarkerOrder, ResponeBook } from "./update-orderbook";

/**
 * marketOrderが受信されない（記録されない）
 */
const orderbookQueue: ResponeBook[] = [];
const trades: ResponceMarkerOrder[][] = [];
const MARKET: string = process.env.MARKET || config.get<string>('MARKET');
const INTERVAL: number = parseInt(process.env.INTERVAL) || config.get<number>('INTERVAL');
const MAX_RESERVE: number = config.get<number>('MAX_RESERVE');
const VERVOSE: boolean = config.get<boolean>('VERVOSE');
const filePath = `result-${MARKET}:${new Date(Date.now()).toISOString()}.csv`;
console.log('[Info]: subscribe... MARKET', MARKET);

const ws = new FTXWs();
const logic = new BoardProcessor(filePath, INTERVAL, MAX_RESERVE);

const go = async (ws) => {
    await ws.connect();

    ws.subscribe('orderbook', MARKET);
    for await (const event of on(ws, MARKET + "::orderbook")) {
        setTimeout(() => logic.boardAnalysis(event[0]), 0)
    }

    ws.subscribe('trades', MARKET);
    for await (const event of on(ws, MARKET + "::trades")) {
        setTimeout(() => logic.marketOrderAnalysis(event[0]), 0);
    }
}
go(ws);