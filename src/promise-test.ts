
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class Exchange {
    i: number;
    ms: any;
    constructor(ms) {
        this.i = 0;
        this.ms = ms
    }
    futureStats = async () => {
        console.log('ms1 ', this.ms, Date.now());
        await wait(this.ms);
        this.i += 2
        console.log('ms2', this.ms, Date.now());
        return Promise.resolve(this.i)
    }
}

class Sample {
    REST_APIS: any[] = []
    statsTimer;
    promise2 = [];
    interval: number;
    timer
    constructor() {
        this.interval = 7000;
        this.setting();
        this.statsTimer = setInterval(() => this.promise2.push(this.futureStats()), this.interval);
        // this.statsTimer = this.promise2.push(this.futureStats());
        this.timer = setInterval(() => this.update(), 2000)
    }
    async update(): Promise<void> {
        console.log('this.promise2 :>> ', this.promise2);
        if (this.promise2.length) {
            const result = await this.promise2[this.promise2.length - 1];
            console.log('result :>> ', result);
            this.promise2.splice(0, this.promise2.length - 1)
        }
    }
    public setting = () => {
        this.REST_APIS = [new Exchange(2000), new Exchange(8000)]
    }
    public futureStats = async () => {
        console.log('------------------------');
        console.log('this. :>> ', this.promise2);
        // if (this.promise2.length)
        // console.log('await this.promise2[0] :>> ', await this.promise2[0]);
        return Promise.all(
            this.REST_APIS.map(exchange => {
                return exchange.futureStats().catch(e => e);
            })
        )
    }
    public main = async () => {
        console.log('===============');
        if (this.promise2.length) {
            const result = await this.promise2[this.promise2.length - 1];
            console.log('result :>> ', result);
        }
    }
}

const sample = new Sample();
// sample.setting();
// sample.futureStats();
// sample.main();