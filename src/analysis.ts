import { BoardInterface, ResponeBook, BoardManagment } from './update-orderbook';


export class Logic extends BoardManagment {
    boardWidth = 100
    maxLength
    interval;
    nextUpdate = Date.now();
    depths = [{ timestamp: this.nextUpdate, bids: 0, asks: 0 }]
    marketOrders = [{ timestamp: this.nextUpdate, buySize: 0, sellSize: 0 }]
    liquidations = [{ timestamp: this.nextUpdate, buy: 0, sell: 0 }];
    diffBoard = [{ timestamp: this.nextUpdate, asks: 0, bids: 0 }];
    timer;
    constructor(interval = 10000, maxLength = 30, apiConfig = {}, vervose = false) {
        super(apiConfig, vervose);
        this.interval = interval;
        this.maxLength = maxLength;
        this.nextUpdate = Date.now() + interval;
        this.timer = setInterval(() => this.update(), 2000);
    }
    public boardAnalysis = (responce: ResponeBook) => {
        this.board && this.calculateDiffBoard(this.board, null, responce);
        setImmediate(() => this.realtime(responce));
        setImmediate(() => this.calculateDepth(this.board));
        // this.realtime(responce);
        // this.calculateDepth(this.board);
    }
    public update() {
        if (this.nextUpdate > Date.now()) return
        console.log("===================================");
        const lasttime = this.nextUpdate;
        this.nextUpdate += this.interval;
        this.depths.push({ timestamp: lasttime, bids: 0, asks: 0 });
        this.marketOrders.push({ timestamp: lasttime, buySize: 0, sellSize: 0 })
        this.liquidations.push({ timestamp: lasttime, buy: 0, sell: 0 })
        this.diffBoard.push({ timestamp: lasttime, asks: 0, bids: 0 })
        /** slice data to  the max length */
        if (this.depths.length > this.maxLength) {
            this.depths.splice(0, this.maxLength - this.depths.length)
            this.marketOrders.splice(0, this.maxLength - this.marketOrders.length)
            this.liquidations.splice(0, this.maxLength - this.liquidations.length)
            this.diffBoard.splice(0, this.maxLength - this.diffBoard.length)
        }
        console.log('this.diffBoard :>> ', this.diffBoard);
        console.log('this.depths :>> ', this.depths);
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
    public calculateMarketOrder(orders) {
        const liq = this.liquidations[this.liquidations.length - 1]
        const morders = this.marketOrders[this.marketOrders.length - 1]
        for (const ord of orders) {
            if (ord.liquidation) {
                if (ord.side == "buy")
                    liq.buy += ord.size;
                else liq.sell += ord.size;
            }
            if (ord.side == "buy") {
                morders.buySize += ord.size
            }
            if (ord.side == "sell") {
                morders.sellSize += ord.size
            }
        }
        this.liquidations[this.liquidations.length - 1] = liq
        this.marketOrders[this.marketOrders.length - 1] = morders
    }
    public calculateDiffBoard(prevBoard: BoardInterface, currentBoard?: BoardInterface, updateData?: ResponeBook) {
        // const diff = this.diffBoard[this.diffBoard.length - 1]
        const diff = { timestamp: 0, asks: 0, bids: 0 };
        let board: { bids: IterableIterator<[number, number]> | number[][], asks: IterableIterator<[number, number]> | number[][], [extra: string]: any };
        if (currentBoard instanceof Array) {
            board = updateData;
        } else if (currentBoard?.asks instanceof Map) {
            board = { bids: currentBoard.bids.entries(), asks: currentBoard.asks.entries() };
        }
        if (!board || !prevBoard) return console.log("[WARN]: CAN_NOT_CALCULATE_DIFF_BOARD")
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
        // for (const key of Object.keys(board)) {
        //     if (!(key in ['bids', 'asks'])) continue;
        //     board[key].forEach((size: number, price: number) => {
        //         if (prevBoard[key].has(price)) {
        //             diff[key] += size - prevBoard[key].get(price)
        //         }
        //         else if (size > 0) {
        //             diff[key] += size
        //         }
        //     });
        // }
    }
}