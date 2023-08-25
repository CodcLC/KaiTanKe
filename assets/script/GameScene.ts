import {BaseComponent} from "./base/BaseComponent";
import {Utils} from "./base/Utils";
import { MusicManager } from "./base/MusicManager";

// import {BannerAd} from "./ad/BannerAd";
import {InsertAd} from "./ad/InsertAd";
import {RewardAd} from "./ad/RewardAd";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameScene extends BaseComponent {

    @property(cc.Prefab) 
    prefab: cc.Prefab = null;
    
    onLoad() {
        Utils.initMusicEffect();
        MusicManager.initConfig();
        
        this._fire._lyCoin.y = yyp.safeTopBottom-30;
        this._fire._lyCoin.zIndex = 1001;
        
        let prefabNode = cc.instantiate(this.prefab);
        prefabNode.x = 0;
        prefabNode.y = 0;
        prefabNode.zIndex = 1000;
        prefabNode.parent = this.node;
        this._initEvent();
    }

    start(){
        // BannerAd.getInstance().showBottom();   
        InsertAd.getInstance();
        RewardAd.getInstance();
    }

    //初始化接收事件
    _initEvent() {
        // this._fire._lyStart.on(cc.Node.EventType.TOUCH_END, this.onStartClick, this);
    }

    //销毁事件
    _destroyEvent() {
        // this._fire._lyStart.off(cc.Node.EventType.TOUCH_END, this.onStartClick, this);
    }

    onDestroy() {
        //销毁事件
        this._destroyEvent();
    }

    //开始按钮
    onStartClick(){
        let a =1;
    }

}
