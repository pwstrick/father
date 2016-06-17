/**
 * URL地址
 */
;(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory(global);
    } else {
        factory(global);
    }
})(typeof window !== "undefined" ? window : this, function (global) {
    var jurl = {};

    /**
     * 创建地址
     */
    jurl.buildUrl = function (url, params) {
        if(!url) return '';
        var last = url[url.length - 1];
        var args = [], params = params || {}, has=false;
        for (var key in params) {
            if(params.hasOwnProperty(key)) {
                args.push(key + '=' + encodeURIComponent(params[key]));
                has = true;//判断是否传参进来
            }
        }
        //有参数就加符号 排除params是{}情况
        if(!has) return url;
        if (url.indexOf('?') == -1) {
            url += '?';
        } else if (last != '&' && last != '?') {
            url += '&';
        }
        return url + args.join('&');
    };

    /**
     * 格式化地址参数
     */
    jurl.parseUrl = function(url) {
        var parsed = {};
        url = url || global.location.search;
        if (typeof url !== "string" || url.length < 0) return parsed;
        var urls = url.split('?');
        if(urls.length == 1 || !urls[1]) return parsed;
        var params = urls[1].split('&');
        //参数赋值
        for(var i= 0, length=params.length; i<length; i++) {
            var element = params[i],
                eqPos = element.indexOf('='),
                keyValue, elValue;
            if (eqPos >= 0) {
                keyValue = element.substr(0, eqPos);//参数名
                elValue = element.substr(eqPos + 1);//参数值
            } else {
                keyValue = element;
                elValue = '';
            }
            parsed[keyValue] = decodeURIComponent(elValue); //简单点操作，将后面的值覆盖前面赋的值
        }
        return parsed;
    };

    /**
     * 测试环境返回测试地址
     * 正式环境返回正式地址
     */
    jurl.current = function(h5, dev) {
        var url = global.location.href;
        if(url.indexOf('dev.') > 0 || url.indexOf('10.10.') > 0)
            return dev;
        return h5;
    };

    return global.jurl = jurl;
});