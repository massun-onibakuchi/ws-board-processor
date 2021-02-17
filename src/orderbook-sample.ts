import { BoardInterface, ResponeBook, BoardManagment } from './update-orderbook';
import { on } from 'events'
import { createWriteStream } from 'fs'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// including private channels:
// const ftx = new FTXWs({
//   key: 'x',
//   secret: 'y',
//   subaccount: 'z'
// })

class Analyze {
    boardWidth = 100
    interval = 20
    nextUpdate = 0
    depths = []
    marketOrders = []
    liquidations = [];
    diffBoard = [];

    public update() {
        if (this.nextUpdate > Date.now()) return
        const lasttime = this.nextUpdate;
        this.nextUpdate += this.interval;
        this.depths.push({ timestamp: lasttime, bid: 0, asks: 0 });
        this.marketOrders.push({ timestamp: lasttime, buySize: 0, sellSize: 0 })
        this.liquidations.push({ timestamp: lasttime, buy: 0, sell: 0 })
        this.diffBoard.push({ timestamp: lasttime, asks: 0, bids: 0 })
    }
    public calculateDepth(board: BoardInterface,) {
        // if (this.nextUpdate  < Date.now()) {
        //     depth = { timestamp: 0, bid: 0, asks: 0 };
        //     this.depths.push(depth)
        // }
        // else {
        //     depth = this.depths[this.depths.length - 1];
        //     depth.timestamp = this.nextUpdate
        // }
        const depth = this.depths[this.depths.length - 1];
        for (const key of Object.keys(depth)) {
            if (!(key in ['bids', 'asks'])) continue;
            for (const size of board[key].values()) {
                depth[key] += size
            }
        }
        this.depths[this.depths.length - 1] = depth
    }
    public calculateMarketOrder(orders) {
        // let liquidation = { timestamp: 0, buy: 0, sell: 0 }
        // let marketOrders = { timestamp: 0, buySize: 0, sellSize: 0 }
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
        // let diff = { timestamp:lasttime, asks: 0, bids: 0 };
        let board: { bids: Iterable<Iterable<number>>, asks: Iterable<Iterable<number>>, [extra: string]: any };
        if (currentBoard?.asks instanceof Map) {
            board = currentBoard;
            board.asks = [...board.asks]
            board.bids = [...board.bids]
        } else {
            board = updateData;
        }
        if (!board) return console.log("CAN NOT CALCULATE DIFF BOARD")
        for (const key of Object.keys(board)) {
            if (!(key in ['bids', 'asks'])) continue;
            board[key].forEach(([price, size],) => {
                if (prevBoard[key].has(price)) {
                    diff[key] += size - prevBoard[key].get(price)
                }
                else if (size > 0) {
                    diff[key] += size
                }
            });
        }
        this.diffBoard[this.diffBoard.length - 1] = diff;
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
const path = './orderbook.csv'
const ftx = new BoardManagment() as any;
// const stream = createWriteStream(path)

const go = async () => {
    await ftx.ws.connect();
    ftx.ws.subscribe('orderbook', 'BTC-PERP');
    // ftx.ws.on('BTC-PERP::orderbook', console.log);
    // ftx.ws.on('BTC-PERP::orderbook', (res: ResponeBook) => ftx.realtime(res));
    for await (const event of on(ftx.ws, "BTC-PERP::orderbook")) {
        ftx.realtime(event[0])
    }

    ftx.ws.subscribe('trades', 'BTC-PERP');
    // ftx.ws.on('BTC-PERP::trades', console.log);
    for await (const event of on(ftx.ws, "BTC-PERP::trades")) {
        console.log('event :>> ', event)

    }

    // ftx.ws.subscribe('market', 'BTC-PERP');
    // ftx.ws.on('BTC-PERP::market', console.log);
    // if you passed api credentials:
    ftx.ws.subscribe('fills');
    ftx.ws.on('fills', console.log);
    // if you want to know when the status of underlying socket changes
    ftx.ws.on('statusChange', console.log);
}
go();
