import * as cluster from "cluster";
import { Worker } from "worker_threads";
import * as path from "path";
import { ResponceMarkerOrder, ResponeBook } from "./update-orderbook";
import { cpus } from "os";

if (!cluster.isMaster) process.exit(0)

const thread_worker = new Worker(path.join(process.cwd(), 'src/board-process.js'), {
    workerData: {
        path: path.join(process.cwd(), 'src/board-process-ts.ts')
    }
});

thread_worker.on('error', async (err) => {
    console.log('err :>> ', err);
    const code = await thread_worker.terminate();
    console.log('code :>> ', code);
})

cluster.on("exit", (worker, code, signal) => {
    console.log('worker %d died (%s). restarting...',
        worker.process.pid, signal || code);
});

process.on('SIGINT', (worker1, worker2) => closeCluster([worker1, worker2]));

if (cpus().length >= 2) {
    cluster.setupMaster({
        exec: path.join(process.cwd(), 'src/subscribe.ts'),
    });
    const worker1 = cluster.fork({ WorkerName: "worker1", target: "orderbook" });
    cluster.setupMaster({
        exec: path.join(process.cwd(), 'src/subscribe.ts'),
    });
    const worker2 = cluster.fork({ WorkerName: "worker2", target: "trades" })
    worker1.on('message', (res: ResponeBook) => thread_worker.postMessage({ channel: 'orderbook', data: res }));
    worker2.on('message', (res: ResponceMarkerOrder[]) => thread_worker.postMessage({ channel: 'marketOrder', data: res }));
} else throw Error('CLUSTERING_ERROR')

const closeCluster = (workers) => {
    console.log('Master stopped');
    for (const worker of workers) {
        worker.destroy('SIGTERM');
    }
    process.exit(0);
}