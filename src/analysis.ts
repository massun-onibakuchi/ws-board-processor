import { BoardInterface, ResponeBook, BoardUpdater, ResponceMarkerOrder } from './update-orderbook';
import { StreamRecord } from './stream-record';
import { PathLike } from 'fs';

export class BoardProcessor extends BoardUpdater {
    boardWidth = 100
    maxLength
    interval;
    nextUpdate = Date.now();
    depths = [{ timestamp: this.nextUpdate, bids: 0, asks: 0 }]
    marketOrders = [{ timestamp: this.nextUpdate, buy: 0, sell: 0, liqBuy: 0, liqSell: 0 }]
    ohlcvs = [{ timestamp: this.nextUpdate, close: 0, open: 0, high: 0, low: 0 }];
    diffBoard = [{ timestamp: this.nextUpdate, asks: 0, bids: 0 }];
    // liquidations = [{ timestamp: this.nextUpdate, buy: 0, sell: 0 }];
    timer: NodeJS.Timeout;
    streamRecord: StreamRecord;
    csvIndex = 'timestamp,asksSize,bidsSize,asksSupply,bidsSupply,buyTake,sellTake,liqBuy,liqSell,open,high,low,close\n';
    constructor(filePath: PathLike, interval = 10000, maxLength = 10, vervose = false) {
        super(null, vervose);
        console.log('[Info]:Set up...' +
            '\ndata collecting interval: ' + interval +
            '\ncsv file path: ' + filePath
        );
        this.interval = interval;
        this.maxLength = maxLength > 3 ? maxLength : 10;
        this.nextUpdate = Date.now() + 60000 - (Date.now() % 60000) + interval;
        this.timer = setInterval(() => this.update(), 2000);
        this.streamRecord = new StreamRecord(filePath, this.csvIndex);
    }
    public boardAnalysis = (responce: ResponeBook) => {
        if (!responce) return console.log('[WARN] at boardAnaysis:RESPONCE_IS_INVALID', responce);
        /** 板の差分はリアルタイムに必要ない場合は，保存したデータから前後の板の厚さの差でほぼ同じ？ものが求められる */
        this.board && this.calculateDiffBoard(this.board, null, responce);
        setImmediate(() => this.realtime(responce));
        setImmediate(() => this.calculateDepth(this.board));
        setImmediate(() => this.recordPrice(this.board));
    }
    public marketOrderAnalysis = (responce: ResponceMarkerOrder[]) => {
        if (!responce) return console.log('[WARN] at marketOrderAnalysis:RESPONCE_IS_INVALID', responce);
        setImmediate(() => this.calculateMarketOrder(responce));
    }
    public update() {
        if (this.nextUpdate > Date.now()) return
        console.log("-------------------------");
        const lasttime = this.nextUpdate;
        this.nextUpdate += this.interval;

        const bestPricesLength = this.ohlcvs.length;
        const bestAsk = Math.max(...this.board.asks.keys());
        this.ohlcvs[bestPricesLength - 1].close = bestAsk

        this.ohlcvs.push({ timestamp: lasttime, open: bestAsk, close: 0, high: 0, low: 0 });
        this.depths.push({ timestamp: lasttime, bids: 0, asks: 0 });
        this.marketOrders.push({ timestamp: lasttime, buy: 0, sell: 0, liqBuy: 0, liqSell: 0 })
        this.diffBoard.push({ timestamp: lasttime, asks: 0, bids: 0 })
        // this.liquidations.push({ timestamp: lasttime, buy: 0, sell: 0 })

        const length = this.depths.length;
        if (length > 2) {
            console.log('[Info]:  Writing result...');
            const chunk = this.nextUpdate + ',' +
                this.depths[length - 2].asks + ',' +
                this.depths[length - 2].bids + ',' +
                this.diffBoard[length - 2].asks + ',' +
                this.diffBoard[length - 2].bids + ',' +
                this.marketOrders[length - 2].buy + ',' +
                this.marketOrders[length - 2].sell + ',' +
                this.marketOrders[length - 2].liqBuy + ',' +
                this.marketOrders[length - 2].liqSell + ',' +
                this.ohlcvs[length - 2].open + ',' +
                this.ohlcvs[length - 2].high + ',' +
                this.ohlcvs[length - 2].low + ',' +
                this.ohlcvs[length - 2].close + '\n';
            this.streamRecord.write(chunk);
        }
        /** leave the last `this.maxLength` element */
        if (length > this.maxLength) {
            console.log('[Info]: cut off some old data...');
            this.depths = this.depths.splice(-this.maxLength);
            this.diffBoard = this.diffBoard.splice(-this.maxLength);
            this.marketOrders = this.marketOrders.splice(-this.maxLength);
            this.ohlcvs = this.ohlcvs.splice(-this.maxLength);
            // this.liquidations.splice(0, this.maxLength - this.liquidations.length)
        }
        console.log('this.diffBoard :>> ', this.diffBoard);
        console.log('this.depths :>> ', this.depths);
        console.log('this.marketOrders :>> ', this.marketOrders);
        console.log('this.ohlcvs :>> ', this.ohlcvs);
    }

    public recordPrice(board: BoardInterface) {
        const high = Math.max(...board.asks.keys());
        const low = Math.min(...board.bids.keys());
        const lastData = this.ohlcvs[this.ohlcvs.length - 1];

        lastData.high = Math.max(high, lastData.high);
        lastData.low = lastData.low ? Math.min(low, lastData.low) : low;
        // override 
        this.ohlcvs[this.ohlcvs.length - 1] = lastData
    }
    public calculateDepth(board: BoardInterface) {
        if (!board) return console.log('[WARN]: BOARD_IS_NOT_FOUND', board);
        const depth = { timestamp: 0, bids: 0, asks: 0 }
        for (const key of Object.keys(depth)) {
            if (!(key == 'bids' || key == 'asks')) continue;
            for (const size of board[key].values()) {
                depth[key] += size
            }
        }
        this.depths[this.depths.length - 1]['bids'] += depth['bids']
        this.depths[this.depths.length - 1]['asks'] += depth['asks']
    }
    public calculateMarketOrder(orders: ResponceMarkerOrder[]) {
        // const liq = this.liquidations[this.liquidations.length - 1]
        const morders = this.marketOrders[this.marketOrders.length - 1]
        for (const ord of orders) {
            if (ord.liquidation) {
                if (ord.side == "buy")
                    morders.liqBuy += ord.size;
                else morders.liqSell += ord.size;
            }
            if (ord.side == "buy") {
                morders.buy += ord.size
            }
            if (ord.side == "sell") {
                morders.sell += ord.size
            }
        }
        // this.liquidations[this.liquidations.length - 1] = liq
        this.marketOrders[this.marketOrders.length - 1] = morders
    }
    public calculateDiffBoard(prevBoard: BoardInterface, currentBoard?: BoardInterface, updateData?: ResponeBook) {
        // const diff = this.diffBoard[this.diffBoard.length - 1]
        const diff = { timestamp: 0, asks: 0, bids: 0 };
        let board: { bids: IterableIterator<[number, number]> | number[][], asks: IterableIterator<[number, number]> | number[][], [extra: string]: any };
        if (currentBoard?.asks instanceof Map) {
            board = { bids: currentBoard.bids.entries(), asks: currentBoard.asks.entries() };
        }
        else if (updateData) {
            board = updateData;
        }
        if (!board || !prevBoard) return console.log("[WARN]: CAN_NOT_CALCULATE_DIFF_BOARD", board)
        for (const key of Object.keys(board)) {
            if (!(key == 'bids' || key == 'asks')) continue;
            for (const [price, size] of board[key]) {
                if (prevBoard[key].has(price)) {
                    diff[key] += size - prevBoard[key].get(price);
                }
                else if (size > 0) {
                    diff[key] += size
                }
            }
        }
        this.diffBoard[this.diffBoard.length - 1].asks += diff.asks;
        this.diffBoard[this.diffBoard.length - 1].bids += diff.bids;
    }
}