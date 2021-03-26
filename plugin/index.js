
class myPlugin {
    apply(compiler) {
        compiler.hooks.run.tap("myPlugin", compilation => {
            console.log('myPlugin is run')
            return "hello "
        })
    }
}

module.exports = myPlugin