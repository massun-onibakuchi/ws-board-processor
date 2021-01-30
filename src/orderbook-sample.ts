import { BoardInterface, ResponeBook, BoardManagment } from './update-orderbook';
// including private channels:
// const ftx = new FTXWs({
//   key: 'x',
//   secret: 'y',
//   subaccount: 'z'
// })

// only public channels:
const ftx = new BoardManagment() as any;
const go = async () => {
    await ftx.ws.connect();
    ftx.ws.subscribe('orderbook', 'BTC-PERP');
    ftx.ws.subscribe('trades', 'BTC-PERP');
    ftx.ws.on('BTC-PERP::trades', console.log);
    ftx.ws.on('BTC-PERP::orderbook', (res: ResponeBook) => ftx.realtime(res));
    // if you passed api credentials:
    ftx.ws.subscribe('fills');
    ftx.ws.on('fills', console.log);
    // if you want to know when the status of underlying socket changes
    ftx.ws.on('statusChange', console.log);
}
go();
