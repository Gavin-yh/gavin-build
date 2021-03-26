const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const cssTree = require('css-tree')
const acorn = require('acorn')
const acornWalk = require('acorn-walk')
const magicString = require('magic-string')

/**
 * 移除已存在的输出目录，然后将新资源打包，重新创建新的目录
 * @param {*} output  输出路径
 */
function removeDir(output) {
    return new Promise((resolve, reject) => {
        // if (fs.existsSync(output)) {
        //     fs.readdirSync('dist').map((file) => {
        //         fs.unlink(`dist/${file}`, (err) => {
        //             if (!err) {
        //                 fs.rmdir('dist', (err) => {
        //                     if (!err) {
        //                         resolve("remove")
        //                     }
        //                 });
        //             }
        //         });
        //     });
        // }else{
        //     resolve("exist")
        // }
        fs.mkdir('./dist', { recursive: true }, (err) => {
            if (err) {
                resolve(0)
            }else{
                resolve(1)
            }
        });
    })
}
/**
 * 创建最终输出的模板，用自己的一套commonjs规范
 * @param {*} root   根目录
 * @param {*} entry  入口文件
 * @param {*} code  经过ast处理好的入口文件资源
 * @param {*} contAry  入口文件引用其他资源的路径
 */
function createTemplate(root, entry, code, requirePath) {
    let requireSource = []
    requirePath.forEach(element => {
        //编译主文件依赖的模块，将模块内的module.exports 编译掉, 因为在浏览器上不支持commonjs规范
        let jsChunkSource = fs.readFileSync(path.resolve(root + '/src', element), "utf-8")
        let ast = acorn.parse(jsChunkSource)
        let codeM = new magicString(jsChunkSource)
        //对整棵ast树进行完整的遍历, 遍历出module.export 替换成__webpack_exports__
        acornWalk.full(ast, node => {
            if (node.type === "AssignmentExpression") {
                if (node.left && node.right && node.left.object.name === 'module' && node.left.property.name === 'exports'){
                    let {start, end} = node.left
                    codeM.overwrite(start, end, "__webpack_exports__['default']")
                }
            }
        })
        

        requireSource.push(codeM.toString())
    });
    let template = `(function(modules) { 
    var installedModules = {}; //模块的缓存

  	function __webpack_require__(moduleId) {
 
  		// Check if module is in cache
  		if(installedModules[moduleId]) {
  			return installedModules[moduleId].exports;
  		}
  		// Create a new module (and put it into the cache)
  		var module = installedModules[moduleId] = {
  			i: moduleId,
  			l: false,
  			exports: {}
  		};
 
  		// Execute the module function
  		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
 
  		// Flag the module as loaded
  		module.l = true;
 
  		// Return the exports of the module
  		return module.exports.default;
  	}

    return __webpack_require__(0);
})([
    (function(module, __webpack_exports__, __webpack_require__){
        <%- code %>
    }),
    <% for(var i = 0; i < requireSource.length; i++){%>
        
        (function(module, __webpack_exports__, __webpack_require__){
            <%- requireSource[i] %>
        }),
    <%}%>
])`
    let resutl = ejs.render(template, {
        code,
        requireSource
    })
    return resutl

}
/**
 * 将css 转成ast
 * @param {*} css css资源 
 */
function cssAST(css) {
    const ast = cssTree.parse(css)
    // csstree.walk(ast, function (node) {
    //     if (node.type === 'ClassSelector' && node.name === 'example') {
    //         node.name = 'hello';
    //     }
    // });

    // generate CSS from AST
    return cssTree.generate(ast);
}
/**
 * 将Js转成AST 
 * 将require找出来替换成__webpack_require()
 * @param {*} js  js资源
 */
function jsAST(js) {
    const ast = acorn.parse(js)
    const codeM = new magicString(js)
    let num = 1 //在生成模板时，__webpack_require(num)  用来引用模块
    let requirePath = [] //在这里用ast，找出require(),后面的路径，供生成tempalte时使用
    acornWalk.simple(ast, {
        Literal(node) {
            // console.log(node)
        },
        CallExpression(node) {
            //防止， 代码里有console.log()时， 这个钩子也会执行,然后会获取不到value, 
            //requirePath就会多一个undefined， 这样在后面分析依赖路径时就会报错
            if (node.callee.name === "require"){
                requirePath.push(node.arguments[0].value)
            }
            let {
                start,
                end
            } = node
            if (node.callee.name === "require") {
                //使用magic-strgin替换掉require
                codeM.overwrite(start, end, `__webpack_require__(${num})`)
                num += 1
            }
        },
    })
    return {
        codeM: codeM.toString(),
        requirePath
    }
}

/**
 * 
 * @param {*} version  版本
 * @param {*} startTime 开始打包的时间
 * @param {*} entry 打包的如果文件路径
 * @param {*} chunk 所有的依赖路劲
 */
function createConsoleTempleta(version, startTime, entry, chunk) {
    let date = new Date()
    let time = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay()+2} ${date.getHours()}:${date.getMinutes()}`
    let endTime = date.getTime()
    let templete = `
Version: gavin-webpack ${version}
Time: ${endTime - startTime}ms
Built at: ${time}
Asset       Chunks             Chunk Names
${entry}     main  [emitted]    main
Entrypoint main = ${entry}
<% for(var i = 0; i < chunk.length; i++){%>
<%- [chunk[i]] %> [built]
<%}%>
`
    let result = ejs.render(templete, {
        chunk
    })
    return result
}
module.exports = {
    removeDir,
    cssAST,
    jsAST,
    createTemplate,
    createConsoleTempleta
}