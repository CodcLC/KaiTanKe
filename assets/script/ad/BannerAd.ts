
import {WechatBannerAd} from "./wechat/WechatBannerAd";
import {TTBannerAd} from "./bytedance/TTBannerAd";
import {AdmobBannerAd} from "./admob/AdmobBannerAd";

// @ccclass
export class BannerAd{

    static _sInstance   = null; //静态实例
    _banner             = null; //横幅广告实例
    _useBanner          = true; //banner是否开启,未开启的不会显示广告(由配置表配置)

    constructor() {

        this._useBanner = yyp.config.AD.banner['Use'] == 1;
        if (this._useBanner) {
            let height = yyp.config.AD.banner['Height'];
            let bannerHeight = height + (yyp.gameFrameSize.height - 1136)/2;
            cc.log('BannerAd ',height,bannerHeight);

            if (cc.sys.platform === cc.sys.WECHAT_GAME){
                let adid = yyp.config.AD.banner['WxAdid']
                this._banner = new WechatBannerAd(adid,bannerHeight);
            }
            else if (cc.sys.platform === cc.sys.BYTEDANCE_GAME){
                let adid = yyp.config.AD.banner['TTAdid']
                this._banner = new TTBannerAd(adid,bannerHeight);
            }
            else if (cc.sys.platform === cc.sys.ANDROID){
                this._banner = new AdmobBannerAd();
            }

        }

        this.show()
    }

    static getInstance():BannerAd{
        if (BannerAd._sInstance == null) {
            BannerAd._sInstance = new BannerAd();
        }
        return BannerAd._sInstance;
    }

    /**
     * 展示广告
     */
    show() {
        if (this._useBanner) {
            if (this._banner){
                this._banner._show()
            }
        }
    }

    /**
     * 隐藏广告
     */
    hide() {
        if (this._banner){
            this._banner._hide()
        }
    }

    onDestroy(){
        if (this._banner){
            this._banner._destroy()
        }
    }

}
