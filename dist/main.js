(function(modules) { 
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
        eval(`const style = document.createElement('style');style.innerText = 'body{background:#333}.font{color:yellowgreen}html{margin:0}.font{color:red}';document.getElementsByTagName('head')[0].appendChild(style)`)

const b = __webpack_require__(1)
const u = __webpack_require__(2)
console.log(b)
console.log(u)
var a = 2




    }),
    
        
        (function(module, __webpack_exports__, __webpack_require__){
            let data = 'hello'
__webpack_exports__['default'] = data
        }),
    
        
        (function(module, __webpack_exports__, __webpack_require__){
            console.log('this is demo1')
        }),
    
])