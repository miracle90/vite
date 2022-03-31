#! /usr/bin/env node
// 1、package.json中配置bin
// 2、用node环境去执行该文件
// 3、npm link 临时的把该文件放到全局，从而实现命令行vite的调用

require("../src/server")