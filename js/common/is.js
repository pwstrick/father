/**
 * 判断函数
 */
;(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory(global);
    } else {
        factory(global);
    }
})(typeof window !== "undefined" ? window : this, function (global) {
    var is = {}, toString = Object.prototype.toString;
    /**
     * 判断是否是数组
     */
    is.isArray = Array.isArray || function(obj) {
            return toString.call(obj) === '[object Array]';
    };

    /**
     * 判断是否是HTML标签
     */
    is.isElement = function(obj) {
        return !!(obj && obj.nodeType === 1);
    };

    /**
     * 判断是函数、日期、字符串、数字、日期、正则、错误
     */
    ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'].forEach(function(key) {
        is['is'+key] = function(obj) {
            return toString.call(obj) === '[object '+key+']';
        }
    });

    /**
     * 判断是NaN
     * 原生的isNaN 函数不一样，如果变量是undefined，原生的isNaN 函数也会返回 true
     */
    is.isNaN = function(obj) {
        return is.isNumber(obj) && obj !== +obj;
    };

    /**
     * 判断是window对象
     */
    is.isWindow = function(obj) {
        return obj != null && obj == obj.window;
    };

    /**
     * 判断是document对象
     */
    is.isDocument = function(obj) {
        return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
    };

    return global.is = is;
});