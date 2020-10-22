var fs = require('fs');
var path = require('path');

var localpath = 'preVersionPackage/project.manifest';
var temppath = 'project.manifest';
var localManifast = fs.readFileSync(localpath, 'utf-8');
var tempManifast = fs.readFileSync(temppath, 'utf-8');
localManifast = JSON.parse(localManifast);
tempManifast = JSON.parse(tempManifast);

var dir = "preVersionPackage/game";
var readPath = "game/";

var i = 2;
while (i < process.argv.length) {
    var arg = process.argv[i];

    switch (arg) {
        case '--version':
        case '-v':
            let version = process.argv[i + 1];
            dir += version + "/";
            console.log("dir" ,dir)
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

function getDiff(localAssert, tempAssert) {
    var diffList = {};
    for (let path in tempAssert) {
        if (localAssert[path]) {
            if (tempAssert[path].md5 != localAssert[path].md5) {
                diffList[path] = tempAssert[path];
                //  console.log("")
            }
        } else {
            diffList[path] = tempAssert[path];
        }
    }
    console.log('diffList', diffList);
    return diffList;
}
var diff = getDiff(localManifast.assets, tempManifast.assets);

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

for (let path in diff) {
    var reads = fs.createReadStream(readPath + path);
    var writepath = dir + path;

    var dirpath = writepath.substring(0, writepath.lastIndexOf('/'));
    mkdirsSync(dirpath);
    if (!fs.existsSync(writepath)) {
        fs.writeFile(writepath, "", (err) => {
            if (err) throw err;
        });
    }
    var writes = fs.createWriteStream(writepath);
    reads.pipe(writes);

    // var osspath = "/paopaoloadalpha/" + path;
    // ossclient.put(osspath,readPath + path).then((r)=>{
    // });
}
fs.writeFile("preVersionPackage/project.manifest", JSON.stringify(tempManifast), (err) => {
    if (err) throw err;
    console.log('gameVersion successfully generated');
});
var tempVersion = fs.readFileSync("version.manifest", 'utf-8');
tempVersion = JSON.parse(tempVersion);
fs.writeFile(dir+"version.manifest", JSON.stringify(tempVersion), (err) => {
    if (err) throw err;
    console.log('gameVersion successfully generated');
});

// zipper.sync.zip(dir).compress().save(dir+".zip");

