let s_h = null,
    s_w = null;
let x,
    y,
    z,
    lastX = 0,
    lastY = 0,
    lastZ = 0;
let orientationData = {
    beta: 0,
    gamma: 0,
};
var app = new Vue({
    el: "#mybody",
    data: {
        qr_url: qr_url,
        miStyle: { "max-height": "1em", "max-width": "1em", width: "1em" },
        miStyled: 0,
        miYx: 0,
        miYy: 0,
        miDx: 0,
        miDy: 0,
        miDw: 0,
        miDh: 0,
        miSee: true,
        mOs: false,
        miMv_x: 0,
        miMv_y: 0,
        lastPos: { x: 0, y: 0 },
        dspPos: 50,
        tScaleYs: 0,
        tScaled: false,
        qr_show: false,
        qr_img_style: {
            opacity: 0.01,
        },
        qr_img_style2: {
            opacity: 0,
        },
        add_style: {},
        qr_tid: null,
        tScaleTime: 0,
        closeTid: null,
        closeIid: null,
        tbody_show: true,
        magicImgBlankStyle: {},
        lastUpdate: 0,
        shakeThreshold: 5000,
        showShake: false,
        moving: null,
        afterScaledClickCount: 0,
    },
    computed: {
        qr_e: function () {
            console.log("this.qr_url", this.qr_url);
            return this.qr_url != "";
        },
    },
    // watich: {
    //   afterScaledClickCount: function (a) {
    //     document.title = a;
    //   },
    // },
    mounted() {
        s_w = $(window).width();
        s_h = $(window).height();
        this.dspPos = s_w / 4;
        if (window.DeviceMotionEvent && window.DeviceOrientationEvent) {
            window.addEventListener("devicemotion", this.deviceMotionHandler, false);
            window.addEventListener("deviceorientation", this.deviceOrientationHandler, false);
        }
    },
    methods: {
        bdClick: function (e) {
            if (this.tScaled) {
                this.miSee = false;
            }
        },
        checkAfterScaleClick: function () {
            if (this.tScaled) {
                //放大以后，触碰三次就消失
                this.afterScaledClickCount += 1;
                // document.title = this.afterScaledClickCount;
                if (this.afterScaledClickCount >= 3) {
                    this.miSee = false;
                    return;
                }
            }
        },
        bdTouchstart: function (e) {
            let dom = "#magicImg";
            if (e.touches.length == 2) {
                this.miDh = $(dom).outerHeight();
                this.miDw = $(dom).outerWidth();
                // $("#src").html(this.miDw)
                let offset = $(dom).offset();
                this.miDx = offset.left;
                this.miDy = offset.top - $("#main2").offset().top;
                this.tScaleYs = Math.max(Math.abs(e.touches[0].pageX - e.touches[1].pageX), Math.abs(e.touches[0].pageY - e.touches[1].pageY));
            } else {
                this.checkAfterScaleClick();
            }
            this.checkStyle();
        },
        bdTouchmove: function (e) {
            // console.log('bdTouchmove');
            if (e.touches.length == 2) {
                let dom = "#magicImg";
                let offset = $(dom).offset();
                let mytScaleYs = Math.max(Math.abs(e.touches[0].pageX - e.touches[1].pageX), Math.abs(e.touches[0].pageY - e.touches[1].pageY));
                let tsDs = (mytScaleYs - this.tScaleYs) / 2;
                // document.title = tsDs
                let n_w = this.miDw + tsDs;
                if (n_w < 15) {
                    n_w = 15;
                }

                let n_h = (n_w * this.miDh) / this.miDw;
                var n_x = this.miDx - (n_w - this.miDw) / 2;
                var n_y = this.miDy - (n_h - this.miDh) / 2;

                this.$set(this.miStyle, "width", n_w + "px");
                this.$set(this.miStyle, "left", n_x + "px");
                this.$set(this.miStyle, "top", n_y + "px");
                this.afterScaledClickCount = 0;
                if (!this.tScaled) {
                    this.tScaled = true;
                }
                this.tScaleTime = new Date().valueOf();
            }
        },
        bdTouchend: function (e) {
            // console.log('bdTouchend');
        },
        checkStyle: function () {
            if (this.miStyled == 0) {
                let dom = "#magicImg";
                this.miStyled = 1;
                // console.log($(e.target).attr("class"));
                var offset = $(dom).offset();
                offset.top -= $("#main2").offset().top; //去掉父元素高

                this.$set(this.magicImgBlankStyle, "width", $(dom).outerWidth() + "px");
                this.$set(this.magicImgBlankStyle, "height", $(dom).outerHeight() + "px");
                this.$set(this.magicImgBlankStyle, "display", "inline-block");

                //转变成absolute
                this.$set(this.miStyle, "position", "absolute");
                this.$set(this.miStyle, "top", offset.top + "px");
                this.$set(this.miStyle, "left", offset.left + "px");
                this.$set(this.miStyle, "max-height", "none");
                this.$set(this.miStyle, "max-width", "none"); //最大宽度是屏幕宽度
                this.$set(this.miStyle, "z-index", "3");
            }
        },
        miTouchstart: function (e) {
            if (e.touches.length >= 2) {
                this.bdTouchstart(e);
            } else {
                this.checkAfterScaleClick();

                this.miYx = e.touches[0].pageX;
                this.miYy = e.touches[0].pageY;
                var offset = $(e.target).offset();
                this.lastPos.x = offset.left;
                this.lastPos.y = offset.top;
                offset.top -= $("#main2").offset().top; //去掉父元素高
                this.miDx = offset.left;
                this.miDy = offset.top;
                this.mOs = false;
                this.checkStyle();
            }
        },
        miTouchmove: function (e) {
            if (e.touches.length >= 2) {
                this.bdTouchmove(e);
            } else {
                let dom = e.target;
                let x = e.touches[0].pageX;
                let y = e.touches[0].pageY;

                if (this.miStyled == 1) {
                    if (!this.mOs) {
                        if (Math.abs(x - this.miYx) > 15 || Math.abs(y - this.miYy) > 15) {
                            this.mOs = true;
                            this.miYx = e.touches[0].pageX;
                            this.miYy = e.touches[0].pageY;
                        }
                    } else {
                        let dom_x = $(dom).offset().left;
                        let dom_y = $(dom).offset().top;
                        this.lastPos.x = dom_x;
                        this.lastPos.y = dom_y;
                        this.$set(this.miStyle, "left", this.miDx + x - this.miYx + "px");
                        this.$set(this.miStyle, "top", this.miDy + y - this.miYy + "px");
                    }
                }
            }
        },
        miTouchend: function (e) {
            if (e.changedTouches.length + e.touches.length >= 2 || new Date().valueOf() - this.tScaleTime < 500) {
                this.bdTouchend(e);
            } else {
                let dom = e.target;

                if (!this.mOs) {
                    if (this.tScaled) {
                        this.miSee = false;
                    } else {
                        this.scaleMagicImg(dom);
                    }
                } else {
                    let x = e.changedTouches[0].pageX;
                    let y = e.changedTouches[0].pageY;
                    if (x <= this.dspPos || x >= s_w - this.dspPos || y <= this.dspPos / 2 || y >= s_h - this.dspPos / 2) {
                        this.miSee = false;
                    } else {
                        let offset = $(dom).offset();
                        let dom_x = offset.left;
                        let dom_y = offset.top;
                        let requiredX = s_w - $(dom).outerWidth();
                        var myX = null;
                        var animateStyle = {};
                        if ($(dom).outerWidth() < s_w) {
                            if (dom_x > requiredX) {
                                animateStyle.left = requiredX + "px";
                            } else if (dom_x < 0) {
                                animateStyle.left = 0 + "px";
                            }
                        }

                        if ($(dom).outerHeight() < s_h) {
                            var myY = null;
                            if (dom_y < 0) {
                                myY = 0 - $("#main2").offset().top; //加上父元素高
                                animateStyle.top = myY + "px";
                            }
                        }

                        if (Object.keys(animateStyle).length == 0) {
                        } else {
                            $(dom).animate(animateStyle);
                        }
                    }
                }
            }
        },
        scaleMagicImg: function (dom) {
            //放大元素
            let h = $(dom).outerHeight();
            let w = $(dom).outerWidth();
            let p_top = $("#main2").offset().top; //父元素高
            var offset = $(dom).offset();
            offset.top -= p_top; //去掉父元素高

            let w_e = (s_w - w) / 1024 + 1; //放大单位是屏幕宽度的10分之一
            let n_w = w_e * w >= s_w ? s_w : w_e * w;
            let n_h = w_e * w >= s_w ? (s_w * h) / w : w_e * h;
            var n_x = offset.left - (n_w - w) / 2;
            var n_y = offset.top - (n_h - h) / 2;
            if (n_x < 0) {
                n_x = 0;
            }
            if (n_y < -p_top) {
                n_y = -p_top;
            }
            if (n_x + n_w > s_w) {
                n_x = s_w - n_w;
            }
            $(dom)
                .stop()
                .animate(
                    {
                        width: n_w + "px",
                        top: n_y + "px",
                        left: n_x + "px",
                    },
                    "fast"
                );
            // this.$set(this.miStyle,)
            // // this.$set(this.miStyle,"height",n_h + "px")
            // this.$set(this.miStyle,)
            // this.$set(this.miStyle,)
        },
        qr_touchstart: function (e) {
            var tx = e.touches[0].pageX;
            let add2 = $("#add2");
            // add2.html(' ');//临时
            this.qr_img_style.opacity = 1;
            this.qr_img_style2.opacity = 1;
            let offset = add2.offset();
            let rect = { width: add2.outerWidth(), height: add2.outerHeight() };
            var xxx = tx - rect.height / 2;
            if (xxx < 0) {
                xxx = 0;
            } else if (xxx > rect.width - rect.height) {
                xxx = rect.width - rect.height;
            }
            this.$set(this.qr_img_style, "left", xxx + "px");
            this.$set(this.qr_img_style, "width", rect.height + "px");
            this.$set(this.qr_img_style2, "left", xxx + "px");
            this.$set(this.qr_img_style2, "width", rect.height + "px");
            this.qr_tid = setTimeout(function () {
                app.qr_tid = null;
                app.setQrPos();
            }, 2000);
            if (this.closeTid != null) {
                clearTimeout(this.closeTid);
            }
            document.title = "返回";
            this.closeTid = setTimeout(function () {
                app.closeIid = setInterval(function () {
                    app.tbody_show = false;
                    if (typeof WeixinJSBridge != "undefined") {
                        WeixinJSBridge.call("closeWindow");
                    }
                }, 100);
            }, 5000);
        },
        qr_touchend: function () {
            this.setQrPos();
            // alert(';123')
        },
        setQrPos: function () {
            if (this.qr_tid != null) {
                clearTimeout(this.qr_tid);
            }
            this.qr_img_style.opacity = 0.01;
            this.qr_img_style2.opacity = 0;
            let offset = $("#add2").offset();
            let rect = {
                width: $("#add2").outerWidth(),
                height: $("#add2").outerHeight(),
            };
            this.$set(this.qr_img_style, "left", offset.left + "px");
            this.$set(this.qr_img_style2, "left", offset.left + "px");
            this.$set(this.qr_img_style, "top", offset.top + "px");
            this.$set(this.qr_img_style, "width", rect.width + "px");
            this.$set(this.qr_img_style2, "width", rect.width + "px");
            this.$set(this.qr_img_style, "height", rect.height + "px");
            this.$set(this.qr_img_style2, "height", rect.height + "px");
        },
        deviceMotionHandler: function (eventData) {
            var acceleration = eventData.accelerationIncludingGravity; // 获取含重力的加速度
            var curTime = new Date().getTime();

            var diffTime = curTime - this.lastUpdate;
            // 100毫秒进行一次位置判断
            if (diffTime > 100) {
                this.lastUpdate = curTime;

                x = acceleration.x;
                y = acceleration.y;
                z = acceleration.z;
                // document.title = `${Math.round(x)} ${Math.round(y)} ${Math.round(z)}`;
                var speed = (Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime) * 10000;
                console.log(speed);
                // 前后x, y, z间的差值的绝对值和时间比率超过了预设的阈值，则判断设备进行了摇晃操作
                if (speed > this.shakeThreshold) {
                    this.startMotion();
                }

                lastX = x;
                lastY = y;
                lastZ = z;
            }
            if (!this.showShake) {
                this.showShake = true;
            }
        },
        deviceOrientationHandler: function (eventData) {
            const { alpha, beta, gamma } = eventData;
            console.log({ beta, gamma });
            if (!this.showShake) {
                this.showShake = true;
            }
            orientationData.beta = beta;
            orientationData.gamma = gamma;
        },
        startMotion: function () {
            if (!this.moving) {
                this.checkStyle();
                this.moving = setInterval(this.motion, 10);
            }
        },
        motion: function () {
            // console.log('motion');
            const dom = "#magicImg";
            const pTop = $("#main2").offset().top;
            let { left: _left, top: _top } = this.miStyle;
            const { beta, gamma } = orientationData;
            const w = $(dom).outerWidth();
            const h = $(dom).outerHeight();

            const myLeft = parseInt(_left);
            const myTop = parseInt(_top);

            // console.log({ myLeft, myTop });
            const dLeft = gamma / 5;
            const dTop = beta / 5;

            let left = myLeft + dLeft;
            let top = myTop + dTop;
            // document.title = pTop;
            if (left < 0) {
                left = 0;
            }
            if (top < -pTop) {
                top = -pTop;
            }
            if (left > s_w - w) {
                left = s_w - w;
            }
            if (top > s_h - h - pTop) {
                top = s_h - h - pTop;
            }

            this.$set(this.miStyle, "top", top + "px");
            this.$set(this.miStyle, "left", left + "px");
        },
    },
    watch: {
        miSee(val) {
            if (!val) {
                this.qr_show = true;
            }
        },
        qr_show(val) {
            if (val) {
                this.setQrPos();
            }
        },
    },
});
