/**
 * https://developers.weixin.qq.com/minigame/dev/api/ad/wx.createBannerAd.html
 * 创建 banner 广告组件。请通过 wx.getSystemInfoSync() 返回对象的 SDKVersion 
 * 判断基础库版本号 >= 2.0.4 后再使用该 API。
 */

export class AdmobBannerAd {


    constructor() {
    }

    //展示广告(加载成功后直接显示)
    _show() {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManager", "showBannerAd", "()V");
    }

    //隐藏(直接销毁)
    _hide() {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManager", "hideBannerAd", "()V");
    }

}
