const {
	Tapable,
	SyncHook, //同步串行钩子,不关心函数的返回值
	SyncBailHook, //同步串行钩子,上一个返回值不为undefined,跳过剩下的逻辑
	AsyncParallelHook,//异步并发钩子,不关心每一个返回值
	AsyncSeriesHook // 异步串行, 
} = require("tapable");

const Compilation = require('./compilation.js')
const path = require('path')
const fs = require('fs')
class Compiler extends Tapable {
    constructor(option) {
        super()
        this.startTime = new Date().getTime()
        this.options = option
        this.output = option.output
        this.root = process.cwd()
        this.plugins = option.plugins
        this.modules = []
        this.entry = option.entry
        this.version = ''
        this.hooks = {
            run: new AsyncSeriesHook(["compiler"]),
            emit: new AsyncSeriesHook(["compilation"]),
            compile: new SyncHook(["params"]),
            environment: new SyncHook([]),
            entryOption: new SyncBailHook(["context", "entry"])
        }
        this.initEnvir()
    }
    initEnvir(){
        this.hooks.environment.tap("initEnvir", () => {
            if (this.plugins && this.plugins.length) {
                //内部自动调用插件的apply,然后tap订阅后，触发函数
                this.hooks.run.callAsync(this, (err, result) => {
                    console.log("run", result)
                })
            }
            //解析loader
            if(this.options.module && this.options.module.rules) {
                this.modules = this.options.module.rules
            }

            //解析entry
            if (this.entry) {
                if (typeof this.entry !== "string"){
                    console.log(this.entry)
                }
            }else{
                this.entry = path.resolve(this.root, 'src/index.js')
            }
            //设置默认输出路径
            if(!this.output) {
                this.output = "dist"
            }
        })
        this.getVersion()
    }
    getVersion() {
        if (path.resolve(this.root,'package.json')){
            this.version = require(path.resolve(this.root,'package.json')).version
            return
        }
        this.version = '1.0.0'
        
    }
    run() {
        let compilation = new Compilation(this)
    }
}

module.exports = Compiler