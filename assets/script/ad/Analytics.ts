import {WechatAnalytics} from "./wechat/WechatAnalytics";

export class Analytics  {

    static _sInstance   = null; //静态实例
    _analytics          = null; //统计实例

    constructor() {
        
        if (cc.sys.platform === cc.sys.WECHAT_GAME){
            this._analytics = new WechatAnalytics();
        }
        else if (cc.sys.platform === cc.sys.BYTEDANCE_GAME){
        }
        else if (cc.sys.platform === cc.sys.ANDROID){
        }
        else{
            // this._analytics = new WechatAnalytics();
        }

    }

    static getInstance():Analytics{
        if (Analytics._sInstance == null) {
            Analytics._sInstance = new Analytics();
        }
        return Analytics._sInstance;
    }
    

    /**
     * 埋点事件
     * @param key :事件key
     */
    event(key) {
        if (this._analytics){
            console.log("Analytics event " + key);
            this._analytics.event(key);
        }
    }

    /**
     * 埋点事件
     * @param key :事件key
     * @param data :事件数据 { 'key1':'value1','key2':'value2' }
     */
    eventEx(key,data) {
        if (this._analytics){
            console.log("Analytics event " + key);
            this._analytics.event(key,data);
        }
    }
}
