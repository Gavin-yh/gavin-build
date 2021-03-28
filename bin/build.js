#! /usr/bin/env node

let path = require('path')
let fs = require("fs")
let Compiler = require('../lib/compiler.js')
const child_process = require('child_process');

/**
 * 
 * @param {*} param  文件名参数
 */
let resolvePath = (param) => {
    return path.resolve(process.cwd(), `${param}`)
}

const isConfigJs = fs.existsSync(resolvePath("gavin.config.js"));


let userConfig
if (isConfigJs) {
    userConfig = require(resolvePath("gavin.config.js"))
}

/**
 * 根据package装依赖
 */
if (!fs.existsSync(resolvePath("node_modules"))) {
    child_process.exec("npm install", (err, stdout, stderr) => {
        if (!err) {
            console.log(" √ All packages installed\n√ the environment ready")
        }
    })
}

let compiler = new Compiler(userConfig)

/**
 * 如果plugin里面一上来就是函数，就先执行掉。如果是new 出来的对象。交给compiler的去调用
 * 插件的apply方法
 */
if (typeof userConfig === "object") {
    if (userConfig.plugins && Array.isArray(userConfig.plugins)) {
        for (const plugin of userConfig.plugins) {
            if (typeof plugin === "function") {
                plugin.call(compiler, compiler);
            } else {
                plugin.apply(compiler);
            }
        }
    }
    //去初始化配置
    compiler.hooks.environment.call();
}else{
    throw new Error("Invalid argument: options, options must be object")
}

compiler.run()





