import {WechatInsertAd} from "./wechat/WechatInsertAd";
import {TTInsertAd} from "./bytedance/TTInsertAd";
import {AdmobInsertAd} from "./admob/AdmobInsertAd";

export class InsertAd  {

    static _sInstance   = null; //静态实例
    _insert             = null; //插屏广告实例

    constructor() {
        
        if (cc.sys.platform === cc.sys.WECHAT_GAME){
            if (yyp.config.AD.insert['Use'] == 1) {
                let adid = yyp.config.AD.insert['WxAdid']
                //this._insert = new WechatInsertAd(adid);
            }
        }
        else if (cc.sys.platform === cc.sys.BYTEDANCE_GAME){
            if (yyp.config.AD.insert['Use'] == 1) {
                let adid = yyp.config.AD.insert['TTAdid']
                this._insert = new TTInsertAd(adid);
            }
        }
        else if (cc.sys.platform === cc.sys.ANDROID){
            this._insert = new AdmobInsertAd();
        }

    }

    static getInstance():InsertAd{
        if (InsertAd._sInstance == null) {
            InsertAd._sInstance = new InsertAd();
        }
        return InsertAd._sInstance;
    }
    
    /**
     * 广告是否已经加载成功
     */
    isLoad(){
        if (this._insert){
            return this._insert._isLoad();
        }
        return false;
    }
    
    /**
     * 展示广告
     */
    show() {
        if (this._insert){
            this._insert._show()
        }
    }

}
