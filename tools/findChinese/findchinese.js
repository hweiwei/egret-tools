/**
 * 查找中文字符
 * @author 黄伟伟
 */
var fs = require('fs'),
  readline = require('readline'),
  path = require('path');

var isTransform = false;  // 打开此开关会将项目中的中文字符替换成i18n处理后的结果
var writeFileName = "chinese.txt";
var transFile = "zh.txt";
fs.writeFile(writeFileName, '', function (err) {
  if (err) throw err;
});
fs.writeFile(transFile, '', function (err) {
  if (err) throw err;
});

var extPaths = ['ts', 'js', 'exml'];
var readPaths = [
  "../../fishingMerge/resource/",
  "../../fishingMerge/src/"
];
var whitePaths = ['i18n']; // 白名单文件夹
var result = []; //可读文件结果
readPaths.forEach((path, index) => {
  readDir(path, result);
});
result.forEach((value, index) => {
  readFile(value);
})
function readDir(dir, results) {
  var stat = fs.statSync(dir);
  if (!stat.isDirectory()) {
    return;
  }
  var subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
  for (var i = 0; i < subpaths.length; ++i) {
    if (subpaths[i][0] === '.') {
      continue;
    }
    subpath = path.join(dir, subpaths[i]);
    //白名单过滤
    var isWhite = false;
    for (var j = 0; j < whitePaths.length; j++) {
      if (subpath.indexOf(whitePaths[j]) != -1) {
        isWhite = true;
        break;
      }
    }
    if (isWhite) {
      continue;
    }
    stat = fs.statSync(subpath);
    if (stat.isDirectory()) {
      readDir(subpath, results);
    }
    else if (stat.isFile()) {
      //类型过滤
      var ext_name = path.extname(subpath);
      ext_name = ext_name.substr(1);
      var is_process_file = false;
      for (var k = 0; k < extPaths.length; k++) {
        if (extPaths[k] === ext_name) {
          is_process_file = true;
          break;
        }
      }
      if (!is_process_file) {
        continue;
      }
      results.push(subpath);
    }
  }
  return results;
}

var lang = {};

function readFile(filePath) {
  var reads = fs.createReadStream(filePath);

  var writeFile = filePath.substr(6);
  if (isTransform) {
    var dirpath = writeFile.substring(0, writeFile.lastIndexOf('\\'));
    mkdirsSync(dirpath)
    fs.writeFile(writeFile, '', function (err) {
      if (err) throw err;
    });
  }

  var rd = readline.createInterface({
    input: reads,
    output: process.stdout,
    // output: writes,
    terminal: false
  });

  var count = 1;
  rd.on('line', function (line) {
    var result = line;
    line = line.trim();
    if (isChineseChar(line)) {
      let pos = findChineseCharPos(line);
      let pos1 = line.indexOf("*");
      let pos2 = line.indexOf("//");
      let pos3 = line.indexOf(".log");
      let pos4 = line.indexOf("微软雅黑");
      let pos5 = line.indexOf("console"); 
      if (pos1 != -1 && pos1 <= pos) {
      } else if (pos2 != -1 && pos2 <= pos) {
      } else if (pos3 != -1 && pos3 <= pos) {
      } else if (pos4 != -1 && pos4 <= pos) {
      } else if (pos5 != -1 && pos5 <= pos) {
      } else {
        result = setLang(filePath, result);

        var tranline = filePath + '   ' + 'Line:' + count + '   ' + line + '\n';

        fs.appendFileSync(writeFileName, tranline);
      }
    }
    result += "\n";
    count++;

    if (isTransform) {
      fs.appendFileSync(writeFile, result);
    }

  });
}

function setLang(filePath, line) {
  var ext_name = path.extname(filePath);
  ext_name = ext_name.substr(1);
  var isExml = ext_name === "exml";

  var name = path.basename(filePath, ".ts");
  name = path.basename(name, ".exml");
  if (!lang[name]) {
    lang[name] = [];
  }
  var zh = line.match(/"(.*?)"+/g);
  var result = line;
  if (zh) {
    for (var i of zh) {
      if (isChineseChar(i) && !ignore(i)) {
        lang[name].push(i);
        var key = name + "_" + lang[name].length;
        var tranline = key + ':' + i + "," + '\n';
        fs.appendFileSync(transFile, tranline);
        if (isExml) {
          result = result.replace(i, `"{i18n.lang.${key}}"`);
        } else {
          result = result.replace(i, `i18n.t("${key}")`);
        }

      }
    }
  }
  return result;
}
function ignore(str) {
  if (str.indexOf("微软雅黑") != -1) {
    return true;
  } else if (str.indexOf("方正简体粗圆") != -1) {
    return true;
  } else if (str.indexOf("方正粗圆简体") != -1) {
    return true;
  } else if (str.indexOf("黑体") != -1) {
    return true;
  }
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
