export class AdmobInsertAd {
    _loaded:boolean                 = false;

    constructor() {
        let self = this;
        let AdmobInsert = {
            loaded : function(){
                console.log("AdManager js loaded");
                self._loaded = true;
            }
        }
        window["AdmobInsertJs"]=AdmobInsert;
    }

    //销毁广告
    _destroy(): void {
        
    }


    _isLoad(){
        return this._loaded;
    }

    //展示广告(加载成功后直接显示)
    _show() {
        this._loaded = false;
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AdManager", "InterstitialAdPlay", "()V");
    }

}
