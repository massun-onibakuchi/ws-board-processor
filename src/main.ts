import * as cluster from "cluster";
import * as path from "path";
import { BoardProcessor } from "./analysis";
import { ResponceMarkerOrder, ResponeBook } from "./update-orderbook";

if (!cluster.isMaster) process.exit(0)

const orderbookQueue = [];
const marketOrderQueue = [];

cluster.setupMaster({
    exec: path.join(process.cwd(), 'src/worker1.ts'),
});
const worker1 = cluster.fork({ WorkerName: "worker1" });

cluster.setupMaster({
    exec: path.join(process.cwd(), 'src/worker2.ts'),
});
const worker2 = cluster.fork({ WorkerName: "worker2" })

// cluster.on("exit", function (worker, code, signal) {
//     if (worker == worker1) worker1 = cluster.fork({ WorkerName: "worker1" });
//     if (worker == worker2) worker2 = cluster.fork({ WorkerName: "worker2" });
// });

worker1.on('message', (res: ResponeBook) => orderbookQueue.push(res));
worker2.on('message', (res: ResponceMarkerOrder[]) => marketOrderQueue.push(res));

const logic = new BoardProcessor();

const processBook = (queue: any[], logic: BoardProcessor, vervose = false) => {
    console.log('orderbookQueue.length:', queue.length);
    for (const res of queue) {
        vervose && console.log('book :>> ', res);
        logic.boardAnalysis(res)
    }
    queue.splice(0, queue.length)
}
const processMarketOrders = (queue: any[], logic: BoardProcessor, vervose = false) => {
    console.log('marketOrderQueue.length:', queue.length);
    for (const res of queue) {
        vervose && console.log('market orders :>> ', res);
        logic.marketOrderAnalysis(res)
    }
    queue.splice(0, queue.length)
}
// setInterval(() => processBook(orderbookQueue, logic, false), 500)
const timerBook = setInterval(() => processBook(orderbookQueue, logic), 300)
const timerMarketOrder = setInterval(() => processMarketOrders(marketOrderQueue, logic), 500)
