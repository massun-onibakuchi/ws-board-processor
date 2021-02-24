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


if (cpus().length <= 2) {
    console.log('ERROR: cpu core <= 2');
    process.exit(1);
}

cluster.setupMaster({
    exec: path.join(process.cwd(), 'src/subscribe.ts'),
});
const worker1 = cluster.fork({ WorkerName: "worker1", target: "orderbook" });

cluster.setupMaster({
    exec: path.join(process.cwd(), 'src/subscribe.ts'),
});
const worker2 = cluster.fork({ WorkerName: "worker2", target: "trades" })

worker1.on('message', (res: ResponeBook) => thread_worker.postMessage({ channel: 'orderbook', data: res }));
worker2.on('message', (res: ResponceMarkerOrder[]) => thread_worker.postMessage({ channel: 'trades', data: res }));


/** version-2 subscribe-2.ts */
// cluster.setupMaster({
//     exec: path.join(process.cwd(), 'src/subscribe-2.ts'),
// });
// const worker1 = cluster.fork();

// worker1.on('message', (res: any) => thread_worker.postMessage(res));
