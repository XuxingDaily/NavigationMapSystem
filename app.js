const express = require('express');
const cors = require("cors");
const controller = require('./controller');

// 创建 Express 应用程序
const app = express();

app.use(cors());    // 解决跨域问题
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/dist"));

app.get('/', controller.getIndexHTML);
app.use("/search-poi", controller.searchPOI);
app.use("/search-car-road", controller.searchCarRoad);
app.use("/search-bus-road", controller.searchBusRoad);

// 启动服务器
app.listen(3300, () => {
    console.log('服务器已启动，监听端口 3300');
});


