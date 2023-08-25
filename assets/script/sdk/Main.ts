import SDKManager from "./sdk/SDKManager";
import { ChannelID, ResultState } from "./sdk/SDKConfig";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {


    @property(cc.Prefab)
    BannerView: cc.Prefab = null;

    @property(cc.Prefab)
    nativeView: cc.Prefab = null;

    @property(cc.Prefab)
    insertView: cc.Prefab = null;

    start() {
        cc.log(cc.sys.MOBILE_BROWSER)
        cc.log(cc.sys.DESKTOP_BROWSER)
        cc.log(cc.sys.EDITOR_PAGE)
        cc.log(cc.sys.EDITOR_CORE)
        cc.log(cc.sys.WECHAT_GAME)
        cc.log(cc.sys.QQ_PLAY)
        cc.log(cc.sys.FB_PLAYABLE_ADS)
        cc.log(cc.sys.BAIDU_GAME)
        cc.log(cc.sys.VIVO_GAME)
        cc.log(cc.sys.OPPO_GAME)
        cc.log(cc.sys.HUAWEI_GAME)
        cc.log(cc.sys.XIAOMI_GAME)
        cc.log(cc.sys.JKW_GAME)
        cc.log(cc.sys.ALIPAY_GAME)
        cc.log(cc.sys.WECHAT_GAME_SUB)
        cc.log(cc.sys.BAIDU_GAME_SUB)
        cc.log(cc.sys.QTT_GAME)
        cc.log(cc.sys.BYTEDANCE_GAME)
        cc.log(cc.sys.BYTEDANCE_GAME_SUB)
        cc.log(cc.sys.LINKSURE)
        cc.log(cc.sys.BROWSER_TYPE_WECHAT)
        cc.log(cc.sys.BROWSER_TYPE_ANDROID)
        cc.log(cc.sys.BROWSER_TYPE_IE)
        cc.log(cc.sys.BROWSER_TYPE_EDGE)
        cc.log(cc.sys.BROWSER_TYPE_QQ)
        cc.log(cc.sys.BROWSER_TYPE_MOBILE_QQ)
        cc.log(cc.sys.BROWSER_TYPE_UC)
        cc.log(cc.sys.BROWSER_TYPE_UCBS)
        cc.log(cc.sys.BROWSER_TYPE_360)
        cc.log(cc.sys.BROWSER_TYPE_BAIDU_APP)
        cc.log(cc.sys.BROWSER_TYPE_BAIDU)
        cc.log(cc.sys.BROWSER_TYPE_MAXTHON)
        cc.log(cc.sys.BROWSER_TYPE_OPERA)
        cc.log(cc.sys.BROWSER_TYPE_OUPENG)
        cc.log(cc.sys.BROWSER_TYPE_MIUI)
        cc.log(cc.sys.BROWSER_TYPE_FIREFOX)
        cc.log(cc.sys.BROWSER_TYPE_SAFARI)
        cc.log(cc.sys.BROWSER_TYPE_CHROME)
        cc.log(cc.sys.BROWSER_TYPE_LIEBAO)
        cc.log(cc.sys.BROWSER_TYPE_QZONE)
        cc.log(cc.sys.BROWSER_TYPE_SOUGOU)
        cc.log(cc.sys.BROWSER_TYPE_UNKNOWN)

    }


    onShareResult(state: ResultState) {
        SDKManager.getChannel().showToast("分享：" + state)
    }


    onButtonOpenBannerClick() {
        this.node.addChild(cc.instantiate(this.BannerView))
    }


    onButtonInsertClick() {
        this.node.addChild(cc.instantiate(this.insertView))
    }

    onButtonNativeClick() {
        this.node.addChild(cc.instantiate(this.nativeView))
    }

    onRewardAdResult(state: ResultState) {
        SDKManager.getChannel().showToast("激励视频展示：" + state)
    }

    onInstallIconResult(state: ResultState) {
        SDKManager.getChannel().showToast("安装图标：" + state)
    }

    onBtnClick(event){
    }
}
