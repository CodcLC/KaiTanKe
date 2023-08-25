import {BaseComponent} from "./base/BaseComponent";
// import {Dialogs} from "./base/Dialogs";
import {Utils} from "./base/Utils";

import {Analytics} from "./ad/Analytics";
import {RewardAd} from "./ad/RewardAd";

const {ccclass, property} = cc._decorator;

//私有函数,请使用'_'开头
//请修改'NewClass' => 自己的类名
//弹窗需要继承Dialogs
@ccclass
export class Revive extends BaseComponent {

    //私有属性,请使用'_'开头,驼峰命名
    // _maxSpeed = 3;  //最大速度

    _allTime = 3;
    _startTime = 0;

    _levelId = 0;
    _start = false;

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
    }

    //初始化UI
    _initUI(){

    }

    //初始化事件
    _initEvent() {
    }

    //销毁事件
    _destroyEvent() {
    }

    //每帧调用
    update (dt) {
        if (this._start) {
            let cost = ((new Date()).valueOf() - this._startTime)/1000;
            this._fire._bg.$ProgressBar.progress = (this._allTime-cost)/this._allTime;
            this._fire._lb.$Label.string = Math.ceil(this._allTime - cost);

            if (Math.ceil(this._allTime - cost) == 0) {
                this._start = false;
                yyp.eventCenter.emit("player-revive",{type:false});
                this.node.destroy();

            }
        }
    }

    init(levelId){
        this._startTime = (new Date()).valueOf();
        this._levelId = levelId;
        this._start = true;
        Utils.doQAction(this._fire._btnRevive);
    }

    onReviveClick(){
        if (RewardAd.getInstance().isLoad()) {
            Analytics.getInstance().eventEx('revive_game',{"level":this._levelId});
            RewardAd.getInstance().show(function(complete){
                yyp.eventCenter.emit("player-revive",{type:complete});
            });
        }
        this.node.destroy();
    }
}
