import { BoardInterface, ResponeBook, BoardManagment } from './update-orderbook';

export class Logic extends BoardManagment {
    boardWidth = 100
    interval = 20
    maxLength = 50
    nextUpdate = Date.now() + this.interval;
    depths = [{ timestamp: 0, bids: 0, asks: 0 }]
    marketOrders = [{ timestamp: 0, buySize: 0, sellSize: 0 }]
    liquidations = [{ timestamp: 0, buy: 0, sell: 0 }];
    diffBoard = [{ timestamp: 0, asks: 0, bids: 0 }];
    timer;
    constructor(interval = 10, config = {}, vervose = false) {
        super(config, vervose);
        this.interval = interval;
        this.timer = setInterval(() => this.update(), 2000);
    }
    public boardAnalysis = (responce: ResponeBook) => {
        this.realtime(responce);
        this.calculateDepth(this.board);
        this.calculateDiffBoard(this.prevBoard, this.board)
    }
    public update() {
        console.log("===================================");
        if (this.nextUpdate > Date.now()) return
        const lasttime = this.nextUpdate;
        this.nextUpdate += this.interval;
        this.depths.push({ timestamp: lasttime, bids: 0, asks: 0 });
        this.marketOrders.push({ timestamp: lasttime, buySize: 0, sellSize: 0 })
        this.liquidations.push({ timestamp: lasttime, buy: 0, sell: 0 })
        this.diffBoard.push({ timestamp: lasttime, asks: 0, bids: 0 })
        console.log('this.diffBoard :>> ', this.diffBoard);
    }
    public calculateDepth(board: BoardInterface) {
        const depth = this.depths[this.depths.length - 1];
        for (const key of Object.keys(depth)) {
            if (!(key == 'bids' || key == 'asks')) continue;
            for (const size of board[key].values()) {
                depth[key] += size
            }
        }
        this.depths[this.depths.length - 1] = depth
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
        const diff = this.diffBoard[this.diffBoard.length - 1]
        // let diff = { timestamp: 0, asks: 0, bids: 0 };
        let board: { bids: IterableIterator<[number, number]> | number[][], asks: IterableIterator<[number, number]> | number[][], [extra: string]: any };
        if (currentBoard?.asks instanceof Map) {
            board = { bids: currentBoard.bids.entries(), asks: currentBoard.asks.entries() };
        } else {
            board = updateData;
        }
        if (!board) return console.log("CAN_NOT_CALCULATE_DIFF_BOARD")
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
            // board[key].forEach(quate => {
            //     const [price, size] = quate;
            //     if (prevBoard[key].has(price)) {
            //         diff[key] += size - prevBoard[key].get(price)
            //     }
            //     else if (size > 0) {
            //         diff[key] += size
            //     }
            // });
        }
        this.diffBoard[this.diffBoard.length - 1] = diff;

        // this.diffBoard[this.diffBoard.length - 1].asks += diff.asks;
        // this.diffBoard[this.diffBoard.length - 1].bids += diff.bids;
        console.log('diff :>> ', diff);
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