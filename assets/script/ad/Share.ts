import {WechatShare} from "./wechat/WechatShare";
import {TTShareEx} from "./bytedance/TTShareEx";
import {AdmobShare} from "./admob/AdmobShare";

export class Share  {

    static _sInstance   = null; //静态实例
    _share              = null; //分享实例
    _list               = [];   //分享内容列表
    _enabled            = true; //是否允许分享

    constructor() {
        
        if (cc.sys.platform === cc.sys.WECHAT_GAME){
            this._getShareList('wx');
            this._share = new WechatShare(this._list);
        }
        else if (cc.sys.platform === cc.sys.BYTEDANCE_GAME){
            this._getShareList('tt');
            this._share = new TTShareEx(this._list);
        }
        else if (cc.sys.platform === cc.sys.ANDROID){
            this._getShareList('admob');
            this._share = new AdmobShare(this._list);
        }
        else{
            this._enabled = false;
        }

    }

    static getInstance() : Share{
        if (Share._sInstance == null) {
            Share._sInstance = new Share();
        }
        return Share._sInstance;
    }
    
    //获取分享参数
    _getShareList(channle){
        for (const key in yyp.config.SHARE) {
            if (yyp.config.SHARE.hasOwnProperty(key)) {
                const element = yyp.config.SHARE[key];
                if (element['Channel'] == channle) {
                    this._list.push(element);
                }
                
            }
        }
    }

    /**
     * 分享一条指定的内容
     * @param callback : 分享的回调函数
     * @param index : 分享内容的索引
     * @param arg : 目前只有安卓平台可能需要传递(替换分享内容中的{0})
     */
    share(callback,index,arg=1) {
        console.log("AndroidShare Share show1 ",index);
        if (this._share){
            console.log("AndroidShare Share show2 ",index);
            this._share.share(callback,index,arg);
        }
    }

    /**
     * 是否允许分享
     */
    enabled():boolean{
        return this._enabled;
    }
}
