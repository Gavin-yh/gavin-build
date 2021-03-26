const {SyncHook,SyncBailHook,SyncWaterfallHook,AsyncSeriesBailHook} = require('tapable')
const hook = new SyncHook(["arg1", "arg2", "arg3"])
const hook1 = new AsyncSeriesBailHook(['arg1'])
hook.tap('1',function(){
    console.log(arguments)
    return "first"
})
hook.tap('2', function() {
    console.log(arguments)
})
// hook.call('x','s','y',)
// console.log(hook)

hook1.tap('1',function(){
    console.log(arguments)
    return "hello"
})
hook1.tap('2', function() {
    console.log(arguments)
})
hook1.callAsync('first', (err,result) => {
    console.log(err, result)
})
console.log(hook1)
