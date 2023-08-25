export class AdmobRewardAd {
    _loaded:boolean                 = false;
    _callback                       = null;     //奖励回调

    constructor() {
        let self = this;
        let AdmobReward = {
            loaded : function(){
                console.log("AdManager js loaded");
                self._loaded = true;
            },
            reward : function(ret){
                console.log("AdManager js reward ",ret);
                if (self._callback) {
                    console.log("AdManager js reward callback ",ret);
                    self._callback(ret)
                }
            }
        }
        window["AdmobRewardJs"]=AdmobReward;
    }

    //销毁广告
    _destroy(): void {
        
    }


    _isLoad(){
        return this._loaded;
    }

    //展示广告(加载成功后直接显示)
    _show(callback) {
        this._callback = callback
        this._loaded = false;
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManager", "RewardedVideoAdPlay", "()V");
    }

}
