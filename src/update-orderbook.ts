export interface BoardInterface { asks: Map<number, number>, bids: Map<number, number> };
export interface ResponeBook { asks: number[][], bids: number[][], action: 'partial' | 'update', timestamp: number };

// let board = { asks: new Map(), bids: new Map() };

export const realtime = (responce: ResponeBook, board: BoardInterface) => {
    // if (responce['channel'] == 'orderbook') {
    // let board = { asks: new Map(), bids: new Map() };
    // function processBoard(board): BoardInterface {
    if (responce['action'] == 'partial') {
        board = reformatBoard(responce);
    }
    if (responce['action'] == 'update') {
        board = updateBoard(responce, board);
    }
    console.log('board :>> ', board);
    // return board;
    // }
    // }
    // board =` processBoard(board);

}
const reformatBoard = (data: ResponeBook): BoardInterface => {
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

const updateBoard = (data: ResponeBook, board: BoardInterface): BoardInterface => {
    for (const key of Object.keys(data)) {
        if (!(key in ['bids', 'asks'])) return
        for (const [price, size] of data[key]) {
            if (board[key].has(price)) {
                if (size == 0) board[key].delete(price);
                else board[key].set(price, size);
            }
            else if (size > 0) {
                board[key].set(price, size);
            }
        }
    }
    return board
}

export class ReadOrderBook {
    board: BoardInterface;

    public realtime = (responce: ResponeBook) => {
        if (responce['action'] == 'partial') {
            this.board = reformatBoard(responce);
        }
        if (responce['action'] == 'update') {
            this.board = updateBoard(responce, this.board);
        }
        console.log('board :>> ', this.board);
    }
    protected reformatBoard = (data: ResponeBook): BoardInterface => {
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
    protected updateBoard = (data: ResponeBook, /* board: BoardInterface */): BoardInterface => {
        for (const key of Object.keys(data)) {
            if (!(key in ['bids', 'asks'])) return
            for (const [price, size] of data[key]) {
                if (this.board[key].has(price)) {
                    if (size == 0) this.board[key].delete(price);
                    else this.board[key].set(price, size);
                }
                else if (size > 0) {
                    this.board[key].set(price, size);
                }
            }
        }
        return this.board
    }
}