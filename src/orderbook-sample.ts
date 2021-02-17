import { formatDiagnostic } from 'typescript';
import { BoardInterface, ResponeBook, BoardManagment } from './update-orderbook';
import { on } from 'events'
// including private channels:
// const ftx = new FTXWs({
//   key: 'x',
//   secret: 'y',
//   subaccount: 'z'
// })

class Analyze {
    constructor() {

    }
    priceBandWidth = 150
    public calculateDepth(borad: BoardInterface) {

    }
}
// only public channels:
const ftx = new BoardManagment() as any;

const go = async () => {
    await ftx.ws.connect();
    ftx.ws.subscribe('orderbook', 'BTC-PERP');
    // ftx.ws.on('BTC-PERP::orderbook', (res: ResponeBook) => ftx.realtime(res));

    for await (const event of on(ftx.ws, "BTC-PERP::orderbook")) {
        ftx.realtime(event[0])
    }
    // ftx.ws.subscribe('trades', 'BTC-PERP');
    // ftx.ws.on('BTC-PERP::trades', console.log);

    // ftx.ws.subscribe('market', 'BTC-PERP');
    // ftx.ws.on('BTC-PERP::market', console.log);
    // if you passed api credentials:
    ftx.ws.subscribe('fills');
    ftx.ws.on('fills', console.log);
    // if you want to know when the status of underlying socket changes
    ftx.ws.on('statusChange', console.log);
}
go();
