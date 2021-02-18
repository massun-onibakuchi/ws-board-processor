import { parentPort } from "worker_threads";
import { BoardProcessor } from "./analysis";
import { ResponceMarkerOrder, ResponeBook } from "./update-orderbook";

const orderbookQueue = [];
const marketOrderQueue = [];

const logic = new BoardProcessor();

parentPort.on('message', (msg) => {
    if (msg.channel === 'orderbook')
        orderbookQueue.push(msg.data)
    if (msg.channel === 'marketOrder')
        marketOrderQueue.push(msg.data)
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
const timerBook = setInterval(() => processBook(orderbookQueue, logic), 300)
const timerMarketOrder = setInterval(() => processMarketOrders(marketOrderQueue, logic), 500)
