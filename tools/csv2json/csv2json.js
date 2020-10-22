let fs = require('fs');
let xlsx = require('node-xlsx');
var iconv = require("iconv-lite");
let csv = require('node-csv').createParser();

let xlsxPath = "input/";
let outPath = "output/";
//创建客户端代码结构
var defFileStr = `/**\n * 该文件为工具自动生成，请勿自行修改。\n * @author huangww\n */\n`;
defFileStr += `module config { \n`;
var templete = `  export interface {0} {\n{1}}\n`
// console.log(`读取目录：${xlsxPath}  读取系统：${os}`);

fs.readdir(xlsxPath, function (err, files) {
    if (err) {
        console.log(`读取目录失败:${err.message}`);
        return;
    }
    if (!fs.existsSync(outPath)) {
        fs.mkdirSync(outPath);
    }

    let clientDir = `${outPath}\\client`;

    if (!fs.existsSync(clientDir)) {
        fs.mkdirSync(clientDir);
    }

    //读取文件
    if (files) {
        for (let i = 0, iLen = files.length; i < iLen; i++) {
            let file = files[i];
            if ((file.indexOf('.xlsx') >= 0 && file.indexOf('~$') == -1)) {
                parseXlsx2Json(file);
            } else if ((file.indexOf('.csv') >= 0 && file.indexOf('~$') == -1)) {
                parseCsv2Json(file);
            }
        }
    }
    let defFileName = 'ConfigDefine';
    let defFilePath = `${outPath}\\client\\${defFileName}.ts`;
    // if (os == 'mac') {
    //     defFilePath = `${outPath}/client/${defFileName}.ts`;
    // }

    defFileStr += `\n}`;
    writeFile(defFilePath, defFileStr);
})

function parseXlsx2Json(file) {
    console.log(`读取文件：${file}`);
    let fileDir = `${xlsxPath}\\${file}`;
    let buffer = fs.readFileSync(fileDir);
    const sheets = xlsx.parse(buffer);
    if (sheets.length == 0) {
        return;
    }
    let sheet = sheets[0];
    let sheetData = sheet.data;
    //解析结构数据
    let fileName = file.substring(0, file.length - 5);
    let remarks = sheetData[0];
    let keys = sheetData[1];
    let types = sheetData[2];
    parse(sheetData,fileName,remarks,keys,types);
}
function parseCsv2Json(file) {
    console.log(`读取文件：${file}`);
    let fileDir = `${xlsxPath}\\${file}`;

    let buffer = fs.readFileSync(fileDir);
    let data = iconv.decode(buffer, "gbk");

    let sheetData = ConvertToTable(data);
    //解析结构数据
    let fileName = file.substring(0, file.length - 4);
    let remarks = sheetData[0];
    let keys = sheetData[1];
    let types = sheetData[2];
    parse(sheetData,fileName,remarks,keys,types);
}
function parse(sheetData,fileName,remarks,keys,types) {
    //创建客户端配置定义代码
    let keyTemplate = "";
    for (let i = 1, iLen = keys.length; i < iLen; i++) {
        let remark = remarks[i] || "";
        remark = remark.replace(/\n/g, '\n   * ');
        let remarkStr = `     \/**\n   * ${remark}\n   *\/`;
        let variableStr = `${keys[i]}: ${formatKeyType(types[i])};\n`
        keyTemplate += `${remarkStr}\n  ${variableStr}`;
    }
    keyTemplate = keyTemplate.replace(/\n/g, '\n\t');
    defFileStr += formatString(templete, [fileName, keyTemplate]);
    //创建文件数据
    let clientData = {};
    let startIndex = 4;
    //解析表数据
    for (let i = startIndex, iLen = sheetData.length; i < iLen; i++) {
        let rowData = sheetData[i];
        if (rowData && rowData.length > 0) {
            let key = rowData[0];
            clientData[key] = {};
            let data_client = {};
            for (let j = 1, jLen = rowData.length; j < jLen; j++) {
                data_client[keys[j]] = formatValueType(types[j], rowData[j]);
            }
            clientData[key] = data_client;
        }
    }
    //创建配置文件
    let clientFilePath = `${outPath}\\client\\${fileName}.json`;
    writeFile(clientFilePath, JSON.stringify(clientData));
}
function ConvertToTable(data) {
    data = data.toString();
    var table = new Array();
    var rows = new Array();
    rows = data.split("\r\n");
    for (var i = 0; i < rows.length; i++) {
        table.push(rows[i].split(","));
    }
    return table;
}
function writeFile(path, data) {
    let fd = fs.openSync(path, 'w');
    fs.writeFileSync(path, data, { flag: 'w' });
    fs.closeSync(fd);
    console.log(`创建文件成功：${path}`);
}

/**
 *  字符参数替换
 * @param str       "参数替换{0}和{1}"
 * @param args      [x,y]    
 */
function formatString(str, args) {
    if (str) {
        let reg = /\{[0-9]+?\}/;
        while (str.match(reg)) {
            let arr = str.match(reg);
            let arg = arr[0].match(/[0-9]+?/);
            str = str.replace(reg, args[parseInt(arg[0])]);
        }
        return str;
    }
    return "";
}

function formatKeyType(type) {
    switch (type) {
        case "index":
        case "int":
        case "float":
            return "number";
        case "string":
            return "string";
        case "boolean":
            return "boolean";
        default:
            return type;
        // throw new TypeError(`${type}类型未定义`);
    }
}

function formatValueType(type, value) {
    switch (type) {
        case "index":
        case "int":
        case "float":
            if (isNaN(value)) {
                return null;
            } else {
                return Number(value);
            }
        case "string":
            if (value === null || value === undefined) {
                return null;
            }
            return value + "";
        case "boolean":
            return Boolean(value);
        default:
            return type;
        // throw new Error(`${type}类型未定义`);
    }
}
function Gb2312ToUtf8(s1) {
    var s = escape(s1);
    var sa = s.split("%");
    var retV = "";
    if (sa[0] != "") {
        retV = sa[0];
    }
    for (var i = 1; i < sa.length; i++) {
        if (sa[i].substring(0, 1) == "u") {
            retV += this.Hex2Utf8(this.Str2Hex(sa[i].substring(1, 5)));
            if (sa[i].length) {
                retV += sa[i].substring(5);
            }
        }
        else {
            retV += unescape("%" + sa[i]);
            if (sa[i].length) {
                retV += sa[i].substring(5);
            }
        }
    }
    return retV;
}

function GB2312UTF8() {
    this.Dig2Dec = function (s) {
        var retV = 0;
        if (s.length == 4) {
            for (var i = 0; i < 4; i++) {
                retV += eval(s.charAt(i)) * Math.pow(2, 3 - i);
            }
            return retV;
        }
        return -1;
    }
    this.Hex2Utf8 = function (s) {
        var retS = "";
        var tempS = "";
        var ss = "";
        if (s.length == 16) {
            tempS = "1110" + s.substring(0, 4);
            tempS += "10" + s.substring(4, 10);
            tempS += "10" + s.substring(10, 16);
            var sss = "0123456789ABCDEF";
            for (var i = 0; i < 3; i++) {
                retS += "%";
                ss = tempS.substring(i * 8, (eval(i) + 1) * 8);
                retS += sss.charAt(this.Dig2Dec(ss.substring(0, 4)));
                retS += sss.charAt(this.Dig2Dec(ss.substring(4, 8)));
            }
            return retS;
        }
        return "";
    }
    this.Dec2Dig = function (n1) {
        var s = "";
        var n2 = 0;
        for (var i = 0; i < 4; i++) {
            n2 = Math.pow(2, 3 - i);
            if (n1 >= n2) {
                s += '1';
                n1 = n1 - n2;
            }
            else
                s += '0';
        }
        return s;
    }

    this.Str2Hex = function (s) {
        var c = "";
        var n;
        var ss = "0123456789ABCDEF";
        var digS = "";
        for (var i = 0; i < s.length; i++) {
            c = s.charAt(i);
            n = ss.indexOf(c);
            digS += this.Dec2Dig(eval(n));
        }
        return digS;
    }
    this.Gb2312ToUtf8 = function (s1) {
        var s = escape(s1);
        var sa = s.split("%");
        var retV = "";
        if (sa[0] != "") {
            retV = sa[0];
        }
        for (var i = 1; i < sa.length; i++) {
            if (sa[i].substring(0, 1) == "u") {
                retV += this.Hex2Utf8(this.Str2Hex(sa[i].substring(1, 5)));
                if (sa[i].length) {
                    retV += sa[i].substring(5);
                }
            }
            else {
                retV += unescape("%" + sa[i]);
                if (sa[i].length) {
                    retV += sa[i].substring(5);
                }
            }
        }
        return retV;
    }
    this.Utf8ToGb2312 = function (str1) {
        var substr = "";
        var a = "";
        var b = "";
        var c = "";
        var i = -1;
        i = str1.indexOf("%");
        if (i == -1) {
            return str1;
        }
        while (i != -1) {
            if (i < 3) {
                substr = substr + str1.substr(0, i - 1);
                str1 = str1.substr(i + 1, str1.length - i);
                a = str1.substr(0, 2);
                str1 = str1.substr(2, str1.length - 2);
                if (parseInt("0x" + a) & 0x80 == 0) {
                    substr = substr + String.fromCharCode(parseInt("0x" + a));
                }
                else if (parseInt("0x" + a) & 0xE0 == 0xC0) { //two byte
                    b = str1.substr(1, 2);
                    str1 = str1.substr(3, str1.length - 3);
                    var widechar = (parseInt("0x" + a) & 0x1F) << 6;
                    widechar = widechar | (parseInt("0x" + b) & 0x3F);
                    substr = substr + String.fromCharCode(widechar);
                }
                else {
                    b = str1.substr(1, 2);
                    str1 = str1.substr(3, str1.length - 3);
                    c = str1.substr(1, 2);
                    str1 = str1.substr(3, str1.length - 3);
                    var widechar = (parseInt("0x" + a) & 0x0F) << 12;
                    widechar = widechar | ((parseInt("0x" + b) & 0x3F) << 6);
                    widechar = widechar | (parseInt("0x" + c) & 0x3F);
                    substr = substr + String.fromCharCode(widechar);
                }
            }
            else {
                substr = substr + str1.substring(0, i);
                str1 = str1.substring(i);
            }
            i = str1.indexOf("%");
        }

        return substr + str1;
    }
}
