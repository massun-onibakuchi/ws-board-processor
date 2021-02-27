## order-book-processor
Connect to the exchange via websocket and analyze the orderbook, market orders and liquidation orders.

## How to use
`NODE_ENV=production npx ts-node src/index.ts`  

コマンドラインでオーバーライドできる変数  
`INTERVAL` 時系列データを採取する時間間隔 ms デフォルト(production) 60000
`MARKET` マーケット デフォルト BTC-PERP 
`MAX_RESERVE`

## Supported Exchanges
 - FTX websocket

## What you can do
 - 一定期間ごとの買い板，売り板の厚み (depth)
 - 一定期間ごとの買い板，売り板の厚みの差分 (supply)
 - 一定期間ごとの成り行きのサイドとサイズ
 - 一定期間ごとの清算注文のサイドとサイズ

## How it works
`cluster`モジュールと`worker_threads`を使用．
index.tsでプロセスをorderbookを受診する`worker1.ts`とマーケットオーダーを受信する`worker2.ts`にフォークする
マスターで二つのworkerからメッセージを受け取り，それを別のスレッドに受け流す．受け取ったら，キューに押し込み処理する．

## Dependencies
 - FTX API wrapper `tx-api-ws` 

## Bugs
コマンドラインで実行時に`INTERVAL=10000 npx ts-node src/index.ts`
`INTERVAL`を指定すると，websocketで取引所からデータを受信するが，集計，加工がされずcsvにも保存されない