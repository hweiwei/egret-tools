/*
 * 资源瘦身检查
 * @Author: huangww
 */

var fs = require("fs");
var path = require("path");
var tinify = require("tinify");
var crypto = require('crypto');
var process_file_ext = ["png", "jpg"];
tinify.key = "xpgvPZ2xDc4BHLjyKYkyt187ZLD6Vk2w";

var whiteList = [];

var localPath = 'preVersionPackage/md5.json';
var localJson = JSON.parse(fs.readFileSync(localPath, 'utf-8'));

var readPath = "../../fishingMerge/resource/";
var readJson = {};

var pressCount = 0; //总压缩量
var pressIndex = 0; //已压缩量
// readDir(readPath, readJson);

// var diffList = getDiff(localJson, readJson);
// console.log("diffList", diffList)

// transform(diffList);

end();

function getDiff(localAssert, tempAssert) {
    var diffList = [];
    for (let path in tempAssert) {
        //白名单过滤
        if (whiteList.indexOf(path) != -1) {
            continue;
        }
        if (localAssert[path]) {
            if (tempAssert[path].md5 != localAssert[path].md5) {
                //  console.log("")
                diffList.push(path);
                pressCount++;

            }
        } else {
            diffList.push(path);
            pressCount++;
        }
    }
    return diffList;
}

function transform(files, fileIndex = 0) {
    if (fileIndex >= files.length) {
        end();
        return;
    }
    const file = files[fileIndex]
    const timeStamp = new Date().getTime()
    tinify.fromFile(file).toFile(file).then(() => {
        transform(files, fileIndex + 1, keyIndex);
    }).catch((error) => {
        console.log((`${file}: ${error}`))
        console.log(`跳过${file}压缩，记得手动压缩`);
        transform(files, fileIndex + 1, keyIndex);
    })
}

function readDir(dir, obj) {
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
        stat = fs.statSync(subpath);
        if (stat.isDirectory()) {
            readDir(subpath, obj);
        }
        else if (stat.isFile()) {
            //类型过滤
            var ext_name = path.extname(subpath);
            ext_name = ext_name.substr(1);
            var is_process_file = false;
            for (var k = 0; k < process_file_ext.length; k++) {
                if (process_file_ext[k] === ext_name) {
                    is_process_file = true;
                    break;
                }
            }
            if (!is_process_file) {
                continue;
            }

            // Size in Bytes
            size = stat['size'];
            md5 = crypto.createHash('md5').update(fs.readFileSync(subpath)).digest('hex');
            compressed = path.extname(subpath).toLowerCase() === '.zip';

            relative = path.relative(readPath, subpath);
            relative = relative.replace(/\\/g, '/');
            relative = encodeURI(relative);

            obj[relative] = {
                'size': size,
                'md5': md5
            };
        }
    }
}

var mkdirSync = function (path) {
    try {
        fs.mkdirSync(path);
    } catch (e) {
        if (e.code != 'EEXIST') throw e;
    }
}

function end() {
    readJson = {};
    readDir(readPath, readJson);
    fs.writeFile(localPath, JSON.stringify(readJson), (err) => {
        if (err) throw err;
        console.log('complete');
    });
}
