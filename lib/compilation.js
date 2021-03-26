const fs = require('fs')
let acorn = require("acorn");
const path = require('path')
const {
    removeDir,
    createTemplate,
    cssAST,
    jsAST,
    createConsoleTempleta
} = require('./util.js')
class Compilation {
    constructor(options) {
        this.outputOptions = options && options.output;
        this.entry = options.entry
        // this.mainTemplate = new MainTemplate(this.outputOptions)
        this.chunk = [] //放import 后面的依赖
        this.chunkInfo = [] //将依赖和loader整理一起
        this.loader = options && options.modules
        this.version = options.version
        this.startTime = options.startTime
        this.root = options.root
        this.analysisChunk()
    }
    analysisChunk() {
        let mainEntry = fs.readFileSync(this.entry, 'utf-8')
        //将import替换，以便用ast处理后去的入口文件。
        let newResource = mainEntry.replace(/(import)\s["'](.+?)["']/g, ($1, $2, $3) => {
            this.chunk.push($3)
            return ''
        })
        //可以多一步，去掉注释
        //待写
        
        this.useLoaderCompilation(newResource)
    }
    /**
     * 
     * 处理loader
     * @param {*} resource 刨除了import的资源
     */
    useLoaderCompilation(resource) {
        this.loader.forEach(rules => {
            this.chunk.forEach(item => {
                if (new RegExp(rules.test).test(item)) {
                    this.chunkInfo.push({
                        module: item,
                        rules: rules.loader
                    })
                }
            })
        })
        let loaderCatch = {} //做一层缓存
        let resourceFile = ''
        let result = ''
        let srcDir = path.resolve(process.cwd(), 'src')
        //循环处理利用loader, 处理文件，如：两个文件，用同一个loader，将loader做一个缓存。
        this.chunkInfo.forEach(item => {
            let rules = item.rules
            resourceFile = fs.readFileSync(path.resolve(srcDir, item.module), 'utf-8')
            if (!loaderCatch[rules]) {
                loaderCatch[rules] = require(path.resolve(process.cwd(), rules))
            }
            result += loaderCatch[rules](resourceFile)
            result += "\n"
        })
        this.codegen(result, resource)
    }
    /**
     * 最终的代码生成 
     * @param {*} result  css经过处理后
     * @param {*} resource 刨除了import 的入口文件
     */
    codegen(result, resource) {
        let style = this.createStyle(result)
        // resource = style + resource
        //将抛出了import的js文件进行编译成ast，进行分析。
        // codeM是将require替换成__webpack_require__后的资源， contAry是依赖：require()后面的路径
        let {codeM, requirePath} = jsAST(resource)
        let output = path.resolve(process.cwd(), this.outputOptions)
        let code = style + codeM

        //处理模板，并将module.exports替换成 __webpack_exports__
        let newCode = createTemplate(this.root, this.entry, code, requirePath)

        //生成
        removeDir(output).then(_ => {
            if (_) {
                fs.writeFile('./dist/main.js', newCode, err => {
                    if (err) {
                        console.log('打包失败', err);
                    } else {
                        // createConsoleTempleta(version, startTime, entry, chunk)
                        console.log(createConsoleTempleta(this.version, this.startTime, this.entry, this.chunk));
                    }
                })    
            }else{
                process.exit(0)
            }

        })
    }
    /**
     * 处理css， 然后创建style
     * @param {*} css  css文件的资源
     */
    createStyle(css) {
       const newCss = cssAST(css)
        return `eval(\`const style = document.createElement('style');style.innerText = '${newCss}';document.getElementsByTagName('head')[0].appendChild(style)\`)`
    }
}

module.exports = Compilation