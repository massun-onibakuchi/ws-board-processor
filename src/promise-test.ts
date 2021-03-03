
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
        if (this.ms === 2000)
            return Promise.reject(new Error('Error'))
        else return Promise.resolve(this.i)
    }
}

class Sample {
    REST_APIS: any[] = []
    statsTimer;
    promise2 = [];
    interval: number;
    timer
    nextUpdate: any;
    constructor() {
        this.interval = 7000;
        this.setting();
        this.nextUpdate = Date.now() + 60000 - (Date.now() % 60000) + this.interval;
        if (this.nextUpdate < Date.now()) {
            console.log('[ERROR]: next_update_time < now.');
            this.nextUpdate += this.interval;
        }
        // this.statsTimer = setInterval(() => this.promise2.push(this.futureStats()), this.interval);
        this.statsTimer = this.promise2.push(this.futureStats());
        this.timer = setInterval(() => this.update(), 3000)
    }
    async update(): Promise<void> {
        if (this.nextUpdate > Date.now()) return
        console.log("----------update---------------");
        const lasttime = this.nextUpdate;
        this.nextUpdate += this.interval;
        this.promise2.push(this.futureStats());

        console.log('this.promise2 :>> ', this.promise2);
        // const result = await this.promise2[this.promise2.length - 1];
        // console.log('result :>> ', result);
        if (this.promise2.length) {
            const result = await this.promise2[this.promise2.length - 1];
            console.log('result :>> ', result);
            this.promise2.splice(0, this.promise2.length - 1)
        }
    }
    public setting = () => {
        this.REST_APIS = [new Exchange(2000), new Exchange(0)]
    }
    public futureStats = async () => {
        console.log('------------------------');
        return Promise.all(
            this.REST_APIS.map(async exchange => {
                await wait(this.interval);
                return exchange.futureStats().catch(e => e);
                // return this.futureStatsTimeout(exchange).catch(e => e);
            })
        )
    }
    private futureStatsTimeout = (exchange) => {
        return new Promise(() => {
            setTimeout(() => exchange.futureStats(), this.interval);
        })
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