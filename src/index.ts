import * as cluster from "cluster";
import { isMainThread, Worker } from "worker_threads";
import * as path from "path";
import { ResponceMarkerOrder, ResponeBook } from "./update-orderbook";

if (!cluster.isMaster) process.exit(0)

const thread_worker = new Worker(path.join(process.cwd(), 'src/worker_thread.js'), {
    workerData: {
        path: path.join(process.cwd(), 'src/worker_thread.ts')
    }
});

cluster.setupMaster({
    exec: path.join(process.cwd(), 'src/worker1.ts'),
});
const worker1 = cluster.fork({ WorkerName: "worker1" });

cluster.setupMaster({
    exec: path.join(process.cwd(), 'src/worker2.ts'),
});
const worker2 = cluster.fork({ WorkerName: "worker2" })

const closeCluster = (workers) => {
    console.log('Master stopped');
    for (const worker of workers) {
        worker.destroy('SIGTERM');
    }
    process.exit(0);
}

worker1.on('message', (res: ResponeBook) => thread_worker.postMessage({ channel: 'orderbook', data: res }));
worker2.on('message', (res: ResponceMarkerOrder[]) => thread_worker.postMessage({ channel: 'marketOrder', data: res }));

cluster.on("exit", (worker, code, signal) => {
    console.log('worker %d died (%s). restarting...',
        worker.process.pid, signal || code);
});

process.on('SIGINT', (worker1, worker2) => closeCluster([worker1, worker2]));

thread_worker.on('error', async (err) => {
    console.log('err :>> ', err);
    const code = await thread_worker.terminate();
    console.log('code :>> ', code);
})

// else {
//     const orderbookQueue = [];
//     const marketOrderQueue = [];

//     const logic = new BoardProcessor();

//     const processBook = (queue: any[], logic: BoardProcessor, vervose = false) => {
//         console.log('orderbookQueue.length:', queue.length);
//         for (const res of queue) {
//             vervose && console.log('book :>> ', res);
//             logic.boardAnalysis(res)
//         }
//         queue.splice(0, queue.length)
//     }
//     const processMarketOrders = (queue: any[], logic: BoardProcessor, vervose = false) => {
//         console.log('marketOrderQueue.length:', queue.length);
//         for (const res of queue) {
//             vervose && console.log('market orders :>> ', res);
//             logic.marketOrderAnalysis(res)
//         }
//         queue.splice(0, queue.length)
//     }
//     // setInterval(() => processBook(orderbookQueue, logic, false), 500)
//     const timerBook = setInterval(() => processBook(orderbookQueue, logic), 300)
//     const timerMarketOrder = setInterval(() => processMarketOrders(marketOrderQueue, logic), 500)
// }