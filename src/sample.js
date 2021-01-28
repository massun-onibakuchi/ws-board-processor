const FTXWs = require('ftx-api-ws');

// including private channels:
// const ftx = new FTXWs({
//   key: 'x',
//   secret: 'y',
//   subaccount: 'z'
// })

// only public channels:
const ftx = new FTXWs();

const go = async () => {
    await ftx.connect();

    ftx.subscribe('ticker', 'BTC-PERP');
    ftx.on('BTC-PERP::ticker', console.log);

    // if you passed api credentials:
    ftx.subscribe('fills');
    ftx.on('fills', console.log);

    // if you want to know when the status of underlying socket changes
    ftx.on('statusChange', console.log);
}

// go();
const obj1 = { 'asks': [[2, 3], [4, 5]], 'bids': [[21, 31], [41, 51]] };
const [key,value] = Object.entries(obj1);
console.log('key , value :>> ', key , value);