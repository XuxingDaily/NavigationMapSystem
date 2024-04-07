const mysql = require("mysql");

const config = {
    host: 'localhost',
    user: 'root',
    password: '020313',
    database: 'sys'
};

/**
 * 创建连接
 */
const connection = mysql.createConnection(config);

/**
 * 通过名称进行模糊查询poi
 * @param {string} name 模糊搜索名称
 * @returns {Promise<Array>} 返回符合条件的POI数组
 */
function findPOIByName(name) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM sys.poi WHERE name LIKE '%${name}%'`;
        connection.query(query, (err, results) => {
            if (err) {
                console.error('查询POI失败：', err);
                reject(err);
                return;
            }
            resolve(results);
        });
    });
}

/**
 * 通过POI名字返回X和Y
 * @param {string} name POI名称
 * @returns {Promise<{x: number, y: number} | null>} 返回POI的坐标信息，如果不存在则返回null
 */
async function getXYByName(name) {
    return new Promise((resolve, reject) => {
        // 1. 精准搜索，查看是否有该POI
        let query = `SELECT name, X, Y FROM sys.poi WHERE name = '${name}'`;
        connection.query(query, (err1, results1) => {
            if (err1) {
                // 2. 精准搜索不到POI，则采用模糊搜索
                results1 = findPOIByName(name);
            }
            if (results1.length > 0) {
                // 3. 采用模糊搜索最接近该name的POI，再次精准搜索
                query = `SELECT name, X, Y FROM sys.poi WHERE name = '${results1[0].name}';`
                connection.query(query, (err2, results2) => {
                    if (err2) {
                        console.error('查询POI失败：', err);
                        reject(err);
                        return;
                    }
                    // 4. 返回POI的X,Y
                    if (results2.length > 0) {
                        const { X, Y } = results2[0];
                        resolve({ x: X, y: Y });
                    } else {
                        resolve(null);
                    }
                })
            } else {
                resolve(null);
            }
        });
    });
}

function loadLineJson() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM line_info", (err, lineData) => {
            if (err) {
                console.error("加载线json信息失败：", err);
                reject(err);
                return;
            }
            resolve(lineData);
        }); 
    });
}

/**
 * 加载所有起始点
 * @returns {Promise<Array>} 返回起始点数组
 */
function loadStartPoints() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM startnode', (err, startPoints) => {
            if (err) {
                console.error('加载起点坐标信息失败：', err);
                reject(err);
                return;
            }
            resolve(startPoints);
        });
    });
}

/**
 * 加载所有终点
 * @returns {Promise<Array>} 返回终点数组
 */
function loadEndPoints() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM endnode', (err, endPoints) => {
            if (err) {
                console.error('加载终点坐标信息失败：', err);
                reject(err);
                return;
            }
            resolve(endPoints);
        });
    });
}

/**
 * 加载所有的线
 * @returns {Promise<Array>} 返回连接关系数组
 */
function loadConnections() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT startnum, endnum, linenum, Shape_Leng FROM sys.line_info', (err, connections) => {
            if (err) {
                console.error('加载连接关系失败：', err);
                reject(err);
                return;
            }
            resolve(connections);
        });
    });
}

/**
 * 关闭数据库连接
 * @returns {Promise<void>} 返回一个Promise，在数据库连接关闭后resolve
 */
function closeConnection() {
    return new Promise((resolve, reject) => {
        connection.end((err) => {
            if (err) {
                console.error('关闭数据库连接失败：', err);
                reject(err);
                return;
            }
            console.log('成功关闭数据库连接');
            resolve();
        });
    });
}

function loadBusStation() { 
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM sys.bus_route;", (err, results) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve(results);
        })
    });
}

module.exports = {
    connection,
    findPOIByName,
    getXYByName,
    loadConnections,
    loadStartPoints,
    loadEndPoints,
    closeConnection,
    loadLineJson,
    loadBusStation
}