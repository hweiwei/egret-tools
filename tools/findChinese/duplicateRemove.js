/**
 * 查找中文字符
 * @author 黄伟伟
 */
var fs = require('fs'),
    readline = require('readline'),
    path = require('path');
var writeFileName = "zh_duplicate.txt";
var duplicateFile = "duplicate.txt";

var zh_duplicate = [];
fs.writeFile(writeFileName, '', function (err) {
    if (err) throw err;
});
fs.writeFile(duplicateFile, '', function (err) {
    if (err) throw err;
});

readFile('zh.txt')
function readFile(filePath) {
    var reads = fs.createReadStream(filePath);
    var rd = readline.createInterface({
        input: reads,
        output: process.stdout,
        // output: writes,
        terminal: false
    });

    var count = 1;
    rd.on('line', function (line) {
        var result = line + "\n";
        line = line.trim();
        var zh = line.match(/"(.*?)"+/g);
        if (zh) {
            for (var i of zh) {
                if (isChineseChar(i)) {
                    if (checkZh(i)) {
                        fs.appendFileSync(duplicateFile, result);
                    } else {
                        fs.appendFileSync(writeFileName, result);
                    }
                }
            }
        }

    });
}

function checkZh(line) {
    for (let i of zh_duplicate) {
        if (i === line) {
            return true;
        }
    }
    zh_duplicate.push(line);
    return false;
}


function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}
function isChineseChar(str) {
    var reg = /[\u4E00-\u9FA5\uF900-\uFA2D\uFF00-\uFFEF]/;
    return reg.test(str);
}
function getChineseChar(str) {
    var reg = /[\u4E00-\u9FA5\uF900-\uFA2D\uFF00-\uFFEF]+/g;
    return str.match(reg);
}
function findChineseCharPos(str) {
    var reg = /[\u4E00-\u9FA5\uF900-\uFA2D\uFF00-\uFFEF]/;
    var char = reg.exec(str);
    return str.indexOf(char);
}
