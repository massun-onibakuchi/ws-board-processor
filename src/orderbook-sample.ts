import FTXWs from 'ftx-api-ws';
import { realtime, ReadOrderBook } from './update-orderbook';
// including private channels:
// const ftx = new FTXWs({
//   key: 'x',
//   secret: 'y',
//   subaccount: 'z'
// })

// only public channels:
const ftx = new FTXWs() as any;
const boardReader = new ReadOrderBook();
let board = { asks: new Map(), bids: new Map() };
class BoardManagment extends FTXWs {
    board;
}
const manager = new BoardManagment()

const go = async () => {
    await ftx.connect();

    ftx.subscribe('orderbook', 'BTC-PERP');
    // ftx.on('BTC-PERP::orderbook', console.log);
    // ftx.on('BTC-PERP::orderbook', responce => realtime(responce, board));
    ftx.on('BTC-PERP::orderbook', boardReader.realtime);

    // if you passed api credentials:
    ftx.subscribe('fills');
    ftx.on('fills', console.log);

    // if you want to know when the status of underlying socket changes
    ftx.on('statusChange', console.log);
}
go(); 
