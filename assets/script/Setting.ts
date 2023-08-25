import {BaseComponent} from "./base/BaseComponent";
import {Dialogs} from "./base/Dialogs";
import {LocalizedData} from "./base/LocalizedData";

const {ccclass, property} = cc._decorator;

//私有函数,请使用'_'开头
//请修改'NewClass' => 自己的类名
@ccclass
export class Setting extends Dialogs {

    //编辑器属性
    // @property(cc.Prefab)
    // private prefab: cc.Prefab = null;

    //私有属性,请使用'_'开头,驼峰命名
    // _maxSpeed = 3;  //最大速度

    _musicFlg = 1;   //音乐
    _effectFlg = 1;  //音效
    _shakeFlg = 1;   //震动

    //加载完成
    onLoad () {
        //初始化变量
        this._initVariable();
        
        //初始化UI
        this._initUI();

        //初始化事件
        this._initEvent();
    }

    onDestroy() {
        //销毁事件
        this._destroyEvent();
    }

    //初始化变量
    _initVariable() {
        this._musicFlg = LocalizedData.getIntItem("_music_flg_",1);
        this._effectFlg = LocalizedData.getIntItem("_effect_flg_",1);
        this._shakeFlg = LocalizedData.getIntItem("_shake_flg_",1);
    }

    //初始化UI
    _initUI(){
        this._refreshUI();
    }

    //初始化事件
    _initEvent() {
    }

    //销毁事件
    _destroyEvent() {
    }

    //每帧调用
    // update (dt) {
    // }

    _refreshUI(){
        // cc.log("_refreshUI")
        this._fire._musicToggle.$Toggle.isChecked = (this._musicFlg == 1);
        this._fire._effectToggle.$Toggle.isChecked = (this._effectFlg == 1);
        this._fire._shakeToggle.$Toggle.isChecked = (this._shakeFlg == 1);

        LocalizedData.setIntItem("_music_flg_",this._musicFlg);
        LocalizedData.setIntItem("_effect_flg_",this._effectFlg);
        LocalizedData.setIntItem("_shake_flg_",this._shakeFlg);
        
        cc.audioEngine.setMusicVolume(this._musicFlg);
        cc.audioEngine.setEffectsVolume(this._effectFlg);
    }

    onMusicToggleClick (event) {
        // cc.log("onToggleClick")
        this._musicFlg = this._fire._musicToggle.$Toggle.isChecked ? 1 : 0;

        this._refreshUI();
    }
    
    onEffectToggleClick (event) {
        // cc.log("onEffectToggleClick")
        this._effectFlg = this._fire._effectToggle.$Toggle.isChecked ? 1 : 0;

        this._refreshUI();
    }
    
    onShakeToggleClick (event) {
        // cc.log("onShakeToggleClick")
        this._shakeFlg = this._fire._shakeToggle.$Toggle.isChecked ? 1 : 0;

        this._refreshUI();
    }
    
    onCloseClick (event) {
        // cc.log("onCloseClick")

        this.close();
    }
}
