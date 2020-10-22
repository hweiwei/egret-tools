[TOC]
#资源压缩模块使用说明
	
###功能说明 
- preVersionPackage: 存放早前版本资源的md5码值

- tinypng.js: 对比新旧版本的资源后将有变动的资源进行压缩，注意其中的资源压缩报错

- md5.js:生成最新的版本资源的md5码值，注意这个脚本的使用时机是自己有手动压缩资源的时候，用于更新资源的md5码值

###命令行

node tinypng.js 

node md5.js