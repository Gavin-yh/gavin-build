# gavin-build


## 项目介绍

> gavin-build 是一个自己实现的简易打包工具，内部的实现很简单。仅供学习和参看

主要通过`acorn`实现对js文件的分析，通过`css-tree`对css文件进行分析，都是将资源转成对应的ast，然后更编译的需要去walk抽象语法树对应的节点，如`替换`、`压缩`等。

最终利用自定义的模板`lib/util.sj - createTemplate`实现最终的输出。

功能点：
* 分析import
* 支持自定义loader
* 支持自定义plugin  
* 支持扩展配置config
## 目录树
```
|-- gavin-build
    |-- gavin.config.js    //额外的配置文件
    |-- index.html         //测试文件
    |-- README.md
    |-- bin
    |   |-- build.js      //主要入口文件
    |-- dist              //打包后输出的文件目录
    |   |-- main.js
    |-- lib               // 主要存放编译的程序
    |   |-- compilation.js
    |   |-- compiler.js
    |   |-- util.js
    |-- loader            // 测试的自定义loader
    |   |-- index.js
    |-- plugin            //用于测试的自定义插件
    |   |-- index.js
    |   |-- index1.js
    |-- scripts
    |   |-- install.sh
    |-- src               // 主要存放打包文件主入口，和测试文件
        |-- demo.css
        |-- demo1.js
        |-- demo2.js
        |-- index.css
        |-- index.js
```

## 使用
* 先clone项目仓库
```bash
git clone git@github.com:Gavin-yh/gavin-build.git
```
* 装依赖
```bash
npm install
```
* link到本地的npm,, 会将这个包link到全局的node_module，就可以使用命令`gBuild`。
```bash
npm link
```
* 使用
```bash
$ gBuild
```



