class myPlugin1 {
    apply(compiler) {
        compiler.hooks.run.tap("myPlugin1", compilation => {
            console.log('myPlugin1 is run')
        })
    }
}

module.exports = myPlugin1