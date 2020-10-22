[TOC]
#白鹭热更模块使用说明
##更新原理
```flow
sta=>start: 开始
e=>end: 结束
op=>operation: 获取远端版本信息，比对版本号，版本号分大小版本大版本为apk强更，小版本为热更
cond1=>condition: 是否更新大版本
cond2=>condition: 是否更新小版本
op1=>operation: 下载apk，重启
op2=>operation: 下载更新文件zip
op3=>operation: 解压缩更新文件
op4=>operation: 进入游戏

sta->op->cond1
cond1(yes)->op1
cond1(no)->cond2
cond2(no)->op4->e
cond2(yes)->op2->op3->op4->e


``` 
##更新操作步骤
```flow
sta=>start: 开始
e=>end: 结束
op=>operation: 删除game目录下的所有资源，拷贝新资源进来
op1=>operation: 执行version_generator.js 生成新的 version.manifest,project.manifest
op2=>operation: 执行update_compare.js 生成新的更新资源包在preVersionPackage中
op3=>operation: 压缩新生成的资源包，上传服务器
op4=>operation: 更新服务器上的version.manifest

sta->op->op1->op2->op3->op4->e

``` 
	
###功能说明 
- game:存放当前版本的最新所有资源，当版本更新时，需删除旧的game下的所有资源，拷贝最新的进来，以免造成更新包污染。

- preVersionPackage: 存放各个版本的更新zip包

- version.manifest: 用于记录当前版本的一些信息

- project.manifest: 比version.manifest 多了个assets map，里面记录了当前版本中使用的所有资源的md5

- version_generator.js 用于生成version.manifest ,project.manifest

- update_compare.js 通过比较当前版本和上个版本的project.manifest,在preVersionPackage中生成当前更新的资源包

###命令行

node version_generator.js -v 填写当前的版本号为线上版本号+1

node update_compare.js -v 填写当前的版本号为线上版本号+1