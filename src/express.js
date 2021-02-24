var express = require('express');
var app = express();

// HTTPリクエストを受け取る部分
app.get('/', function (req, res,next) {
    res.set({ 'Access-Control-Allow-Origin': 'http://127.0.0.1:3000' }); // ここでヘッダーにアクセス許可の情報を追加
    res.send('Hello World!');
});

// サーバーを起動する部分
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});