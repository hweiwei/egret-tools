var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
//原生包更新路径
var packurl = "https://pic.3669yx.com/paopaoload/";
//原生包版本
var versionCode = 44;
var manifest = {
    packageUrl: packurl,
    versionCode: versionCode,
	versionDetail:"发现新版本",
    version: 1,
    assets: {},
};

var dest = '/';
var src = 'game/';

specials = {
	"CURRECT_TYPE":"APP",
	"SERVER_TYPE":"NORMAL",
	"ALIPAY":true,
	"ISSHOW":true,
    "HD":true
}
// Parse arguments
console.log("please check packageUrl && versionCode");
var i = 2;
while (i < process.argv.length) {
    var arg = process.argv[i];

    switch (arg) {
        //case '--url' :
        //case '-u' :
        //    var url = process.argv[i+1];
        //    manifest.packageUrl = url;
        //    manifest.remoteManifestUrl = url + 'project.manifest';
        //    manifest.remoteVersionUrl = url + 'version.manifest';
        //    i += 2;
        //    break;
        case '--version':
        case '-v':
            manifest.version = parseInt(process.argv[i + 1]);
            i += 2;
            break;
        case '--src':
        case '-s':
            src = process.argv[i + 1];
            i += 2;
            break;
        case '--dest':
        case '-d':
            dest = process.argv[i + 1];
            i += 2;
            break;
        default:
            i++;
            break;
    }
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
            // Size in Bytes
            size = stat['size'];
            md5 = crypto.createHash('md5').update(fs.readFileSync(subpath)).digest('hex');
            compressed = path.extname(subpath).toLowerCase() === '.zip';

            relative = path.relative(src, subpath);
            relative = relative.replace(/\\/g, '/');
            relative = encodeURI(relative);
            obj[relative] = {
                'size': size,
                'md5': md5
            };
            if (compressed) {
                obj[relative].compressed = true;
            }
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

// Iterate res and src folder
// readDir(path.join(src, 'js'), manifest.assets);
// readDir(path.join(src, 'resource'), manifest.assets);
readDir("game", manifest.assets);

var destManifest = 'project.manifest';
var destVersion = 'version.manifest';
var gameVersion = src + 'version.manifest';
//mkdirSync(dest);

fs.writeFile(destManifest, JSON.stringify(manifest), (err) => {
    if (err) throw err;
    console.log('Manifest successfully generated');
});

delete manifest.assets;
fs.writeFile(destVersion, JSON.stringify(manifest), (err) => {
    if (err) throw err;
    console.log('Version successfully generated');
});
fs.writeFile(gameVersion, JSON.stringify(manifest), (err) => {
    if (err) throw err;
    console.log('gameVersion successfully generated');
});
fs.writeFile(src + "resource/special.json", JSON.stringify(specials), (err) => {
    if (err) throw err;
    console.log('gameVersion successfully generated');
});

