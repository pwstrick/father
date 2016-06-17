var $ = require('./zepto');
var dom = require('./common/dom');
var url = require('./common/url');

var $music = $('#music'),
    $audio = $('#audio'),
    $dialog = $('#dialog'),
    $upload = $('#upload'),
    $frame = $('#frame'),
    $frameImg = $('#frameImg'),
    $word = $('#word'),
    $compose = $('#compose'),
    $first = $('#first'),
    $second = $('#second'),
    $third = $('#third'),
    $loading = $('#loading'),
    isAudioLoaded = false,
    isDoning = false,//防止二次提交
    rotates = [],//旋转四个方向的缓存
    direction = 0;
//var demoImg = new Image();

Zepto(function() {

    /**
     * 预加载图片
     */
    $("img[data-src]").each(function() {
        var $this = $(this);
        var src = $this.data('src');
        dom.preImage(src, function() {
            $this.attr('src', src);
            $this.data('width', this.width);
            $this.data('height', this.height);
        });
    });

    /**
     * 普通终端上传图片
     */
    $upload.on('change', function() {
        var file = $(this)[0].files[0];
        if(!file) {//undefined
            return;
        }
        if(!startLoading()) {
            return;
        }
        var file = $(this)[0].files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);// 将文件以Data URL形式进行读入页面
        reader.onload = function() {
            var base64 = this.result;
            //模拟form上传
            //form(base64);

            var img  = new Image();
            img.onload = function() {
                var src = poster.filterImage(img, this.width, this.height);//IOS中如果图片过大，将不能画在canvas中
                $frameImg.data('width', this.width);//实际宽度
                $frameImg.data('height', this.height);//实际高度
                var realImg = new Image();
                realImg.onload = function() {
                    $frameImg.attr('src', realImg.src);//三次载入Base64数据
                    next($first);//显示第二屏
                    endLoading();
                };
                realImg.src = src;
                rotates[0] = {src:src, width:this.width, height:this.height, image:realImg};//用于旋转的缓存
            };
            //img.src = 'img/word.png'
            img.src = base64;
        }
    });

    /**
     * 生成海报
     */
    $('#btnConfirm').on('touchstart', function() {
        if(!startLoading()) {
            return;
        }
        generatePoster();
    });

    /**
     * 图片旋转
     */
    $('#btnRotate').on('touchstart', function() {
        if(!startLoading()) {
            return;
        }
        direction++;
        if(direction > 3) {
            direction = 0;
        }
        if(rotates[direction]) {
            $frameImg.data('width', rotates[direction].width);
            $frameImg.data('height', rotates[direction].height);
            $frameImg.attr('src', rotates[direction].src);
            endLoading();
            return;
        }

        //生成一张新图片 不能直接用$frameImg会出现变形
        var img = new Image();
        img.onload = function() {
            //此处图片需跨域
            var src = poster.filterImage(this, $frameImg.data('height'), $frameImg.data('width'), 90);
            var realImg = new Image();
            realImg.onload = function() {
                rotates[direction] = {src:src, width:this.width, height:this.height, image:realImg};//缓存
                $frameImg.data('width', this.width);
                $frameImg.data('height', this.height);
                $frameImg.attr('src', realImg.src);
                endLoading();
            };
            realImg.src = src;
        };

        img.src = $frameImg.attr('src');
    });

    /**
     * 微信端与APP端不同分享逻辑
     */
    $('#btnShare').on('touchstart', function() {
        //微信端弹出提示信息
        $dialog.show().addClass('zoomIn');
    });

    /**
     * 弹出层中的按钮
     */
    $dialog.on('touchstart', 'button', function(e) {
        e.preventDefault();
        $dialog.hide().removeClass('zoomIn');
    });

    function initParam() {
        $first.show();
        direction = 0;
        rotates = [];
        $frameImg[0].style.webkitTransform = "translate3d(0,0,0) scale(1)";
    }
    /**
     * 重新上传图片
     */
    $('#btnBack').on('touchstart', function(e) {
        $third.hide();
        initParam();
    });

    /**
     * 取消
     */
    $('#btnCancel').on('touchstart', function(e) {
        $second.hide();
        initParam();
    });
});

/**
 * 事件开始
 */
function startLoading() {
    if(isDoning) {
        return false;
    }
    $loading.show();
    isDoning = true;
    return true;
}
/**
 * 事件结束
 */
function endLoading() {
    $loading.hide();
    isDoning = false;
}

window.onload = function() {
    audioControl();
    //图片拖拽
    poster.initTouch($frame[0], $frameImg[0]);
    next($loading);
};

/**
 * 显示下一个元素
 */
function next($object) {
    $object.hide().next().show();
}

/**
 * 生成海报
 */
function generatePoster() {
    var canvas = document.createElement('canvas');
    canvas.width = $frame.width();//CSS中定义了画布是580
    canvas.height = $frame.height();

    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFF';//绘制背景色
    ctx.fillRect(0,0,canvas.width,canvas.height);

    poster.drawImage(ctx, rotates[direction].image, poster.intersect($frame, $frameImg));
    poster.drawImage(ctx, $word, poster.intersect($frame, $word));

    var base64 = canvas.toDataURL('image/jpeg');
    $compose[0].onload = function() {
        next($second);
        endLoading();
    };
    //合成的图片
    $compose.attr('src', base64);
}

/**
 * 音频控制
 */
function audioControl() {
    // 音乐播放图标
    if ($audio.length > 0) {
        //audio事件绑定
        $audio.on("play", function() {
            isAudioLoaded = true;
            $music.addClass('music-rotate').removeClass('music-pulse');
        }).on("pause", function() {
            $music.removeClass('music-rotate').addClass('music-pulse');
        });

        // audio 暂停/播入控制
        function playAndPause() {
            var audio = $audio[0];
            //alert(audio.paused)
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        }
        $music.on("touchstart", function() {
            playAndPause();
        });
    }
}

var poster = {
    /**
     * devicePixelRatio设备像素比 webkitBackingStorePixelRatio Canvas缓冲区的像素比
     */
    pixelRatio: function(ctx) {
        var backingstore = ctx.webkitBackingStorePixelRatio|| 1;
        return (window.devicePixelRatio || 1) / backingstore;
    },
    /**
     * 将选中的图片放入Canvas中，防止在IOS中由于图片太大而不显示
     * 旋转操作也放在此处
     */
    filterImage: function(image, width, height, deg) {
        var canvas = document.createElement('canvas');
        var pr = this.pixelRatio(canvas.getContext('2d'));

        canvas.width = width / pr;//回复为原先的大小
        canvas.height = height / pr;

        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFF';//绘制背景色
        ctx.fillRect(0,0,canvas.width,canvas.height);
        if(deg) {
            ctx.rotate(deg * Math.PI / 180);
            ctx.drawImage(image, 0, -canvas.width);
        }else {
            ctx.drawImage(image, 0, 0, width, height);
        }

        return canvas.toDataURL('image/jpeg', 0.7);
    },
    /**
     * 画图
     */
    drawImage: function(ctx, image, offset) {
        var pr = this.pixelRatio(ctx), key;
        ctx.save();

        for(key in offset.image) {
            offset.image[key] = Math.floor(offset.image[key]);
        }
        for(key in offset.frame) {
            offset.frame[key] = Math.floor(offset.frame[key]);
        }

        ctx.drawImage(image[0] || image,
            offset.image.x, offset.image.y, offset.image.w, offset.image.h,
            offset.frame.x * pr, offset.frame.y * pr, offset.frame.w * pr, offset.frame.h * pr);

        ctx.restore();
    },
    /**
     * 初始化拖拽,放缩事件
     * 开源库touch.js
     */
    initTouch: function(touchPad, img) {
        var offx = 0, offy = 0;
        var scale = 1;
        var currScale;

        function formatTransform(offx, offy, scale) {
            var translate = 'translate3d(' + (offx + 'px,') + (offy + 'px,') + '0)';
            scale = 'scale(' + scale + ')';
            //var rotate = 'rotate('+deg+'deg)';
            return translate + ' ' + scale;
        }

        touch.on(touchPad, 'touchstart', function (ev) {
            ev.preventDefault();
        });

        touch.on(touchPad, 'drag', function(ev) {
            var currOffx = offx + ev.x;
            var currOffy = offy + ev.y;
            img.style.webkitTransform = formatTransform(currOffx, currOffy, scale);
        });

        touch.on(touchPad, 'dragend', function(ev) {
            offx += ev.x;
            offy += ev.y;
        });

        touch.on(touchPad, 'pinch', function(ev) {
            if(typeof ev.scale != 'undefined') {
                currScale = ev.scale - 1 + scale;
                img.style.webkitTransform = formatTransform(offx, offy, currScale);
            }
        });

        touch.on(touchPad, 'pinchend', function() {
            scale = currScale;
        });
    },
    /**
     * 计算出img在frame中的可见部分相对于img和frame的坐标及尺寸
     */
    intersect: function($frame, $img) {
        var imgX = 0, imgY = 0, imgW = 0, imgH = 0;
        var frmX = 0, frmY = 0;
        var imgOffset, frmOffset;
        var left, right, top, bottom;

        imgOffset = $img.offset();//图片的偏移对象
        frmOffset = $frame.offset();//画框的偏移对象
        left = imgOffset.left - frmOffset.left - 3;//图片到边框左边的距离 去除1px的边框
        right = left + imgOffset.width;//画框模型是border-box，所以图片宽度需要减去边框的宽度 就是574
        top = imgOffset.top - frmOffset.top - 3;//图片到边框上边的距离
        bottom = top + imgOffset.height;

        //图片在画框内
        if(!(right <= 0 || left >= frmOffset.width || bottom <= 0 || top >= frmOffset.height)) {
            if(left < 0) {
                imgX = -left;
                frmX = 0;
                imgW = (right < frmOffset.width) ? right : frmOffset.width;
            } else {
                imgX = 0;
                frmX = left;
                imgW = (right < frmOffset.width ? right : frmOffset.width) - left;
            }

            if(top < 0) {
                imgY = -top;
                frmY = 0;
                imgH = (bottom < frmOffset.height) ? bottom : frmOffset.height;
            } else {
                imgY = 0;
                frmY = top;
                imgH = ((bottom < frmOffset.height) ? bottom : frmOffset.height) - top;

            }
        }

        var ratio = $img.data('width') / $img.width();//图片真实宽度 与 图片CSS宽度
        //图片的实际高度不能低于计算后的高度 否则iphone 5S中就不显示
        var imageHeight = imgH * ratio;
        if(+$img.data('height') < imageHeight) {
            imageHeight = $img.data('height');
        }
        return {
            frame: {x: frmX, y: frmY, w: (imgW + 6), h: (imgH + 6)},//此处画框是574，而画布是580
            image: {x: imgX * ratio, y: imgY * ratio, w: imgW * ratio, h: imageHeight}
        };
    }
};

/**
 * 错误信息
 * @param msg
 * @param url
 * @param line
 * @param col
 * @param error
 */
//window.onerror = function(msg, url, line, col, error) {
//    var newMsg = msg;
//    //alert(error)
//    if (error && error.stack) {
//        var stack = error.stack.replace(/\n/gi, "").split(/\bat\b/).slice(0, 9).join("@").replace(/\?[^:]+/gi, "");
//        var msg = error.toString();
//        if (stack.indexOf(msg) < 0) {
//            stack = msg + "@" + stack;
//        }
//        newMsg = stack;
//    }
//    var obj = {msg:newMsg, target:url, rowNum:line, colNum:col};
//    $('body')[0].innerHTML += line + ':'+''+'：<p>'+obj.msg+'</p>';
//    alert(obj.msg)
//};