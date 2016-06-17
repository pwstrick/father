/**
 * DOM相关操作
 */
var is = require('./is');
;(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory(global);
    } else {
        factory(global);
    }
})(typeof window !== "undefined" ? window : this, function (global) {
    var dom = {}, pres=[];

    /**
     * 预加载私有函数
     */
    function _loadImage() {
        var img = new Image(), callback = arguments[1];
        img.src = arguments[0];
        if (img.complete) { // 如果图片已经存在于浏览器缓存，直接调用回调函数
            callback && callback.call(img);
            return; // 直接返回，不用再处理onload事件
        }
        img.onload = function () { //图片下载完毕时异步调用callback函数。
            callback && callback.call(img);//将回调函数的this替换为Image对象
        };
        return img;
    }
    /**
     * 预加载图片
     * @param {Array|String} urls 图片地址
     * @param {Function} callback 回调函数
     * @returns {Array} 图片对象数组
     */
    dom.preImage = function(urls, callback) {
        if(is.isArray(urls)) {
            urls.forEach(function(url) {
                pres.push(_loadImage(url, callback));
            });
        }else {
            pres.push(_loadImage(urls, callback));
        }
        return pres;
    };

    /**
     * 元素偏移尺寸对象
     * 左、右、宽、高
     * @param {Element} el 单个元素 通过document.getElementById等方式获取
     * @returns {Object} {left,top,width,height}
     */
    dom.offset = function(el) {
        var obj = el.getBoundingClientRect();
        return {
            left: obj.left + window.pageXOffset,
            top: obj.top + window.pageYOffset,
            width: Math.round(obj.width),//整数位 四舍五入
            height: Math.round(obj.height)
        };
    };

    /**
     * 获取对象的高度或宽度
     * 例如屏幕的高度
     * @param {Element} el 单个元素 通过document.getElementById等方式获取
     * @returns {Number} 数值
     */
    ['width', 'height'].forEach(function(property) {
        var dimension = property.replace(/./, function(m){ return m[0].toUpperCase()});
        dom[property] = function(el) {
            var offset;
            if(is.isWindow(el)) return el['inner' + dimension];
            if(is.isDocument(el)) return el.documentElement['scroll' + dimension];
            return (offset = this.offset(el)) && offset[property];
        };
    });

    /**
     * 节流
     * 函数调用的频度控制器，到了时间就执行
     * 例如mousemove 事件、window对象的resize和scroll事件
     * 预先设定一个执行周期，当调用动作的时刻大于等于执行周期则执行该动作，然后进入下一个新周期
     *
     * @param fn {Function} 要调用的函数
     * @param delay {Number} 空闲时间
     * @param immediate {Boolean} 给immediate参数传递false，绑定的函数先执行，而不是delay后执行
     * @param debounce {Boolean} 是否执行debounce方式
     * @returns {Function}
     */
    dom.throttle = function(fn, delay, immediate, debounce) {
        var curr = +new Date(),//当前时间
            last_call = 0,//最后一次回调的时间，用于debounce的重新计算时间
            last_exec = 0,//最后一次执行传入函数的时间
            timer = null,//定时器
            diff, //时间差
            context,//上下文
            args,//回调函数的参数
            exec = function () {
                last_exec = curr;
                fn.apply(context, args);
            };
        return function () {
            curr = +new Date();
            context = this;
            args = arguments;
            diff = curr - (debounce ? last_call : last_exec);
            clearTimeout(timer);
            if (debounce) {
                if(immediate) {
                    timer = setTimeout(exec, delay);
                }else if(diff >= delay) {
                    exec();
                }
            } else {
                if(diff >= delay) {
                    exec();
                }else if(immediate) {
                    timer = setTimeout(exec, -diff);
                }
            }
            last_call = curr;
        }
    };

    /**
     * 去抖动
     * 空闲时间的间隔控制
     * 例如文本输入keydown 事件，keyup 事件，做autocomplete等
     * 当调用动作n毫秒后，才会执行该动作，若在这n毫秒内又调用此动作则将重新计算执行时间
     */
    dom.debounce = function(fn, delay, immediate) {
        return this.throttle(fn, delay, immediate, true);
    };

    /**
     * 判断当前浏览器支持哪种TransitionEnd事件
     */
    dom.transitionEnd = function(el){
        var transitions = {
            'WebkitTransition' : 'webkitTransitionEnd',
            'MozTransition'    : 'transitionend',
            'OTransition'      : 'oTransitionEnd otransitionend',
            'transition'       : 'transitionend'
        };
        for(var t in transitions){
            if(el.style[t] !== undefined){
                return transitions[t];
            }
        }
        return null;
    };

    return global.dom = dom;
});