/**
 * https://microapp.bytedance.com/dev/cn/mini-game/develop/open-capacity/ads/tt.createbannerad
 * 创建 banner 广告组件。请通过 tt.getSystemInfoSync() 返回对象的 SDKVersion 
 */


export class TTBannerAd {

    _wxSystemInfo: any      = {};       //微信返回的信息
    _adID: string           = '';       //广告id
    _maxHeight: number      = 100;      //最大高度
    _instance: wx.BannerAd  = null;     //广告实例

    _heightError            = false;

    constructor(adid,maxHeight) {
        
        this._wxSystemInfo = wx.getSystemInfoSync();
        this._adID = adid;

        this._maxHeight = Math.floor(maxHeight*(this._wxSystemInfo.windowWidth/640));

        cc.log('WechatBannerAd constructor ',this._wxSystemInfo.windowWidth,this._wxSystemInfo.windowHeight,maxHeight,this._maxHeight);
    }

    //创建广告
    _createAD() {
        if (this._instance == null) {
            let bannerWidth = 200;
            this._instance = tt.createBannerAd({
                adUnitId: this._adID,
                adIntervals: 30,
                style: {
                    left: (this._wxSystemInfo.windowWidth - bannerWidth) / 2,
                    top: this._wxSystemInfo.windowHeight - (bannerWidth / 16 * 9), // 根据系统约定尺寸计算出广告高度
                    width: bannerWidth
                }
            })
            this._instance.onLoad(this._onLoad.bind(this))
            this._instance.onError(this._onError.bind(this))
            this._instance.onResize(this._onResize.bind(this))
        }
        else(
            this._instance.show()
        )
    }

    //广告已经加载
    _onLoad() {
        if (this._heightError) {
            cc.log('banner onLoad error')
            this._heightError = false;
            this._reLoad();
        }
        else{
            cc.log('banner onLoad show')
            this._instance.show();
        }
    }

    //广告加载出错
    _onError(err) {
        cc.log('banner onError', err)
        this._instance = null;
        this._reLoad()
    }
    
    //banner 广告尺寸变化
    _onResize(resize) {
        cc.log('banner onResize', resize.width,resize.height)

        if (resize.width != 0 && resize.height != 0) {
            // if (resize.height > this._maxHeight) {
            //     this._heightError = true;
            // }
            // else{
                this._instance['style'].top = this._wxSystemInfo.windowHeight - resize.height;
                this._instance['style'].left = (this._wxSystemInfo.windowWidth - resize.width) / 2;
            // }
        }


    }

    //销毁广告
    _destroy(): void {
        if (this._instance) {
            this._instance.offLoad(this._onLoad.bind(this))
            this._instance.offError(this._onError.bind(this))
            this._instance.offResize(this._onResize.bind(this))
            this._instance.destroy()
            this._instance = null;
        }
    }

    //是否允许广告
    _allowAd(){
        return this._compareVersion(this._wxSystemInfo['SDKVersion'],'1.3.0') >= 0;
    }

    //重新加载广告
    _reLoad() {
        //延迟5s再次加载广告
        let id = setTimeout(() => {
            this._instance = null;
            this._createAD()
            clearTimeout(id)
        }, 10000)
    }

    //展示广告(加载成功后直接显示)
    _show() {
        if (this._allowAd()){
            this._createAD()
        }
    }

    //隐藏(直接销毁)
    _hide() {
        // this._destroy()
        if (this._instance) {
            this._instance.hide()
        }
    }

    _compareVersion(v1, v2) {
        v1 = v1.split('.')
        v2 = v2.split('.')
        const len = Math.max(v1.length, v2.length)
    
        while (v1.length < len) {
            v1.push('0')
        }
        while (v2.length < len) {
            v2.push('0')
        }
    
        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i])
            const num2 = parseInt(v2[i])
    
            if (num1 > num2) {
                return 1
            } else if (num1 < num2) {
                return -1
            }
        }
    
        return 0
    }
}
