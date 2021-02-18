const { parentPort } = require("worker_threads");
const { BoardProcessor } = require("./analysis");

const orderbookQueue = [];
const marketOrderQueue = [];

const logic = new BoardProcessor();

parentPort.on('message', (msg) => {
    if (msg.channel === 'orderbook')
        orderbookQueue.push(msg.data)
    if (msg.channel === 'marketOrder')
        marketOrderQueue.push(msg.data)
});

const processBook = (queue, logic, vervose = false) => {
    console.log('orderbookQueue.length:', queue.length);
    for (const res of queue) {
        vervose && console.log('book :>> ', res);
        logic.boardAnalysis(res)
    }
    queue.splice(0, queue.length)
}
const processMarketOrders = (queue, logic, vervose = false) => {
    console.log('marketOrderQueue.length:', queue.length);
    for (const res of queue) {
        vervose && console.log('market orders :>> ', res);
        logic.marketOrderAnalysis(res)
    }
    queue.splice(0, queue.length)
}

const timerBook = setInterval(() => processBook(orderbookQueue, logic), 300)
const timerMarketOrder = setInterval(() => processMarketOrders(marketOrderQueue, logic), 500)
