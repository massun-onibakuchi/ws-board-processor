import * as cluster from "cluster";
import { on, once } from 'events'
import { cpus } from "os";
import * as path from "path";
import { Logic } from "./analysis";
const numCPUs = cpus().length
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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
worker1.on('message', (res) => orderbookQueue.push(res));
worker2.on('message', (res) => marketOrderQueue.push(res));

const logic = new Logic();

const processBook = (queue, logic, vervose = true) => {
    // if (queue.length > 2) {
    // }
    for (const res of queue) {
        // vervose && console.log('book :>> ', res);
        console.log('logic.board :>> ', logic.board);
        logic.boardAnalysis(res)
    }
}
const processMarketOrders = (queue, logic, vervose = true) => {
    // if (queue.length > 2) {
    // }
    for (const res of queue) {
        vervose && console.log('market orders :>> ', res);
        logic.marketOrdersAnalysis(res)
    }
}
setInterval(() => processBook(orderbookQueue, logic), 1800)
// const timerBook = setInterval(() => processBook(orderbookQueue, logic), 300)
// const timerMarketOrder = setInterval(() => processBook(marketOrderQueue, logic), 300)
