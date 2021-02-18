import * as cluster from "cluster";
import { on, once } from 'events'
import { cpus } from "os";
import * as path from "path";
import { Logic } from "./analysis";
const numCPUs = cpus().length
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

if (cluster.isMaster) {
    const workerPath = path.join(process.cwd(), 'src/worker2.ts');
    cluster.setupMaster({
        exec: path.join(process.cwd(), 'src/worker1.ts'),
    });
    const worker1 = cluster.fork({ WorkerName: "worker1" });

    cluster.setupMaster({
        exec: workerPath,
    });
    const worker2 = cluster.fork({ WorkerName: "worker2" })
    // let worker1 = cluster.fork({ WorkerName: "worker1" });
    // let worker2 = cluster.fork({ WorkerName: "worker2" });
    // cluster.on("exit", function (worker, code, signal) {
    //     if (worker == worker1) worker1 = cluster.fork({ WorkerName: "worker1" });
    //     if (worker == worker2) worker2 = cluster.fork({ WorkerName: "worker2" });
    // });
    worker2.on('message', function (msg) {
        console.log('msg [worker2]:>> ', msg);
        // worker2.send({ "data": sharedData });
    });
    worker1.on('message', function (msg) {
        console.log('msg [worker1]:>> ', msg);
        // worker2.send({ "data": sharedData });
    });
    // setInterval(() => worker2.send({ 'mesage': 'feee' }), 2000)
}
