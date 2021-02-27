import config from 'config';
import { parentPort } from "worker_threads";
import { BoardProcessor } from "./analysis";
import { ResponceMarkerOrder, ResponeBook } from "./update-orderbook";

const orderbookQueue = [];
const trades = [];
const MARKET = process.env.MARKET || config.get<number>('MARKET');
const INTERVAL = process.env.INTERVAL || config.get<number>('INTERVAL');
const MAX_RESERVE = config.get<number>('MAX_RESERVE');
const VERVOSE = config.get<boolean>('VERVOSE');
const filePath = `result-${MARKET}:${new Date(Date.now()).toISOString()}.csv`;

const logic = new BoardProcessor(filePath, INTERVAL, MAX_RESERVE);

parentPort.on('message', (msg) => {
    if (msg.channel === 'orderbook')
        orderbookQueue.push(msg.data)
    if (msg.channel === 'trades')
        trades.push(msg.data)
});

const processBook = (queue: ResponeBook[], logic: BoardProcessor, vervose = false) => {
    if (vervose) {
        console.log('orderbookQueue.length:', queue.length);
        console.log('book :>> ', queue);
    }
    for (const res of queue) {
        logic.boardAnalysis(res)
    }
    queue.splice(0, queue.length)
}
const processMarketOrders = (queue: any, logic: BoardProcessor, vervose = false) => {
    if (vervose) {
        console.log('marketOrderQueue.length:', queue.length);
        console.log('market orders :>> ', queue);
    }
    for (const res of queue) {
        logic.marketOrderAnalysis(res)
    }
    queue.splice(0, queue.length)
}
// setInterval(() => processBook(orderbookQueue, logic, false), 500)
const timerBook = setInterval(() => processBook(orderbookQueue, logic, VERVOSE), 300)
const timerMarketOrder = setInterval(() => processMarketOrders(trades, logic, VERVOSE), 500)
