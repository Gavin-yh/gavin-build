const myPlugin = require('./plugin/index.js')
const myPlugin1 = require('./plugin/index1.js')
module.exports = {
    // entry: "./index.js",
    output: "main",
    module: {
        rules: [{
            test: /.css$/g,
            loader: './loader/index.js'
        }]
    },
    plugins: [
    //    new myPlugin()
    //    new myPlugin1()
    ]
}