//屏幕录制
import {TTRecorderEx} from "./bytedance/TTRecorderEx";

export class Recorder  {

    static _sInstance   = null; //静态实例
    _recorder           = null; //录屏实例
    _enabled            = true; //是否允许录屏

    constructor() {
        
        if (cc.sys.platform === cc.sys.BYTEDANCE_GAME){
            this._recorder = new TTRecorderEx();
        }
        else{
            this._enabled = false;
        }

    }

    static getInstance():Recorder{
        if (Recorder._sInstance == null) {
            Recorder._sInstance = new Recorder();
        }
        return Recorder._sInstance;
    }

    /**
     * 开始录屏
     */
    start(){
        if (this._recorder){
            this._recorder.start();
        }
    }

    /**
     * 结束录屏
     */
    stop(){
        if (this._recorder){
            this._recorder.stop();
        }
    }

    /**
     * 暂停
     */
    pause(){
        if (this._recorder) {
            this._recorder.pause();
        }
    }

    /**
     * 恢复
     */
    resume(){
        if (this._recorder) {
            this._recorder.resume();
        }
    }

    /**
     * 裁剪
     */
    clip(){
        if (this._recorder) {
            this._recorder.clip();
        }
    }

    /**
     * 分享视频
     * @param callback : 分享的回调函数
     */
    shareVideo(callback=null){
        if (this._recorder) {
            this._recorder.shareVideo(callback);
        }
    }

    /**
     * 是否允许录屏
     */
    enabled(){
        return this._enabled;
    }
}
