import FTXWs from 'ftx-api-ws';
import { report } from 'process';
import { ReplOptions } from 'repl';

// including private channels:
// const ftx = new FTXWs({
//   key: 'x',
//   secret: 'y',
//   subaccount: 'z'
// })

// only public channels:
const ftx = new FTXWs() as any;

const go = async () => {
    await ftx.connect();

    ftx.subscribe('orderbook', 'BTC-PERP');
    ftx.on('BTC-PERP::orderbook', console.log);

    // if you passed api credentials:
    ftx.subscribe('fills');
    ftx.on('fills', console.log);

    // if you want to know when the status of underlying socket changes
    ftx.on('statusChange', console.log);
}

const board = { 'asks': [], 'bids': [] };
const asks: Map<number, number> = new Map();
const bids: Map<number, number> = new Map();
interface BoardInterface { asks: Map<number, number>, bids: Map<number, number> };
const board1: BoardInterface = { asks: asks, bids: bids };

interface ResponeBook { asks: number[][], bids: number[][] };
const realtime = (responce, board) => {
    if (responce['channel'] == 'orderbook') {
        if (responce['action'] == 'partial') {
            board = reformatBoard(responce);
        }
        if (responce['action'] == 'update') {
            if (board) {
                board = updateBoard(responce, board);
            }
        }
        console.log('board :>> ', board);
    }
}
const reformatBoard = (data: ResponeBook) => {
    const board: BoardInterface = { asks: new Map(), bids: new Map() };
    for (const key of Object.keys(data)) {
        if (key == 'bids' || key == 'asks') {
            data[key].forEach(quate => {
                board[key].set(quate[0], quate[1]);
            })
        }
    }
    return board;
}

const updateBoard = (data: ResponeBook, board: BoardInterface) => {
    for (const key of Object.keys(data)) {
        if (!(key in ['bids', 'asks'])) return
        for (const [price, size] of data[key]) {
            if (board[key].has(price)) {
                if (size == 0) board[key].delete(price);
            }
            else {
                board[key].set(price, size);
            }
        }
    }
}
go(); 