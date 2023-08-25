import {WechatRewardAd} from "./wechat/WechatRewardAd";
import {TTRewardAd} from "./bytedance/TTRewardAd";
import {AdmobRewardAd} from "./admob/AdmobRewardAd";

export class RewardAd  {

    static _sInstance   = null; //静态实例
    _reward             = null; //视频广告实例

    constructor() {
        
        if (cc.sys.platform === cc.sys.WECHAT_GAME){
            if (yyp.config.AD.reward['Use'] == 1) {
                let adid = yyp.config.AD.reward['WxAdid']
                //this._reward = new WechatRewardAd(adid);
            }
        }
        else if (cc.sys.platform === cc.sys.BYTEDANCE_GAME){
            if (yyp.config.AD.reward['Use'] == 1) {
                let adid = yyp.config.AD.reward['TTAdid']
                this._reward = new TTRewardAd(adid);
            }
        }
        else if (cc.sys.platform === cc.sys.ANDROID){
            this._reward = new AdmobRewardAd();
        }

    }

    static getInstance():RewardAd{
        if (RewardAd._sInstance == null) {
            RewardAd._sInstance = new RewardAd();
        }
        return RewardAd._sInstance;
    }
    
    /**
     * 广告是否已经加载成功
     */
    isLoad(){
        if (this._reward){
            return this._reward._isLoad();
        }
        return false;
    }
    
    /**
     * /展示广告
     * @param callback :广告播放后的状态回调
     */
    show(callback) {
        console.log("AdManager RewardAd show1 ",callback);
        if (this._reward){
            console.log("AdManager RewardAd show2 ",callback);
            this._reward._show(callback)
        }
    }

}
