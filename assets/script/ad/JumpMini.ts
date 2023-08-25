const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Button)
export default class JumpMini extends cc.Component {

    @property
    appid: string = '';

    start() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME){
            // do nothig
        }
        else if (cc.sys.platform === cc.sys.BYTEDANCE_GAME){
            this.node.active = false;
            return;
        }
        else if (cc.sys.platform === cc.sys.ANDROID){
            this.node.active = false;
            return;
        }
        else{
        }

        this.node.on(cc.Node.EventType.TOUCH_END, this.onButtonClick, this);
    }

    onDestroy(){
        this.node.off(cc.Node.EventType.TOUCH_END, this.onButtonClick, this);
    }

    onButtonClick() {
        this.navigateToMiniProgram(this.appid);
    }

    //跳转小游戏
    navigateToMiniProgram(appid) {
        if (cc.sys.platform === cc.sys.WECHAT_GAME){
            this.wxJumpToMiniProgram(appid);
        }
    }
    
    //微信跳转小游戏
    wxJumpToMiniProgram(appid) {
        wx.navigateToMiniProgram({
            appId: appid,
            success: () => {
                cc.log('wx navigateToMiniProgram succ');
            }
        })

    }
}
