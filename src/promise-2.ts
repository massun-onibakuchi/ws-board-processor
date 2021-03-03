import { ExchangeFactory, ExchangeREST } from './exchanges/exchanges-rest';
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class Exchange2 {
    i: number;
    ms: any;
    id: any;
    constructor(ms) {
        this.i = 0;
        this.ms = ms
        this.id = ms
    }
    futureStats = async () => {
        console.log('ms1 ', this.ms, Date.now());
        // await wait(this.ms);
        this.i += 2
        return Promise.resolve(this.i)
    }
}

class Sample2 {
    SampleREST: any[] = []
    exchangeRESTs: ExchangeREST[];
    statsTimer;
    promise2;
    interval: number;
    timer
    nextUpdate: any;
    waitingPromise: Promise<any>;
    market = 'BTC-PERP'
    constructor() {
        this.interval = 7000;
        this.setting();
        this.nextUpdate = Date.now() + 60000 - (Date.now() % 60000) + this.interval;
        if (this.nextUpdate < Date.now()) {
            console.log('[ERROR]: next_update_time < now.');
            this.nextUpdate += this.interval;
        }
        // this.statsTimer = setInterval(() => this.promise2.push(this.futureStats()), this.interval);
        this.exchangeRESTs = ExchangeFactory.exchangesREST(['ftx']);
        this.promise2 = this.exchangeRESTs[0].futureStats(this.market).catch(e => e);
        // this.promise2 = this.futureStats(this.market);
        this.timer = setInterval(() => this.update(), 3000)
    }
    async update(): Promise<void> {
        console.log("----------check---------------");
        if (this.nextUpdate > Date.now()) return
        console.log("----------update---------------");
        const lasttime = this.nextUpdate;
        this.nextUpdate += this.interval;

        console.log('this.promise2 :>> ', this.promise2);
        const result = await this.promise2
        console.log('result :>> ', result);
        this.promise2 = this.exchangeRESTs[0].futureStats(this.market).catch(e => e)
    }
    public setting = () => {
        this.SampleREST = [new Exchange2(1000), new Exchange2(0)]
    }
    public futureStats = (market) => {
        console.log('------------------------');
        return Promise.all(
            this.SampleREST.map(exchange => this.futureStatsTimeout(exchange, market))
        )
    }
    private futureStatsTimeout = async (exchange: ExchangeREST, market) => {
        await wait(this.nextUpdate - Date.now() - 1000);
        return { id: exchange.id, responce: exchange.futureStats(market).catch(e => e) }
    }
    // private testAPI = async () => {
    //     const res = await this.exchangeRESTs[0].futureStats();
    //     console.log('res :>> ', res);
    //     // return this.exchangeRESTs[0].futureStats();
    // }
}

const sample = new Sample2();
const ois = [];
const exchanges = ['ftx','bybit']
ois.push(exchanges.reduce((accum, v) => accum[v] = 0, {}))

console.log('ois :>> ', ois);
// sample.setting();
// sample.futureStats();
// sample.main();