import {BaseComponent} from "./base/BaseComponent";
import {LocalizedData} from "./base/LocalizedData";
import {Utils} from "./base/Utils";
import { MusicManager } from "./base/MusicManager";

import {Analytics} from "./ad/Analytics";
import {InsertAd} from "./ad/InsertAd";
import {RewardAd} from "./ad/RewardAd";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameMain extends BaseComponent {

    @property(cc.Prefab) 
    finishPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    settingPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    wishPrefab : cc.Prefab = null;    //转盘

    @property(cc.Prefab)
    revivePrefab : cc.Prefab = null;    //转盘

    // _csb : any = {};
    _levelId    =   1;      //当前关卡

    _startCount = 0;

    onLoad() {
        //初始化变量
        this._initVariable();
        
        //初始化UI
        this._initUI();

        //初始化接收事件
        this._initEvent();
    }

    //初始化变量
    _initVariable() {
    }

    //初始化UI
    _initUI() {
        //隐藏开始按钮
        this._fire._joystick.active = false;
        this._fire._ui.active = false;

        this._fire._btnSetting.y = yyp.safeTopBottom-30;
        this._fire._btnSetting.zIndex = 1001;
                
        this._fire._recommendBtns.runAction(cc.moveTo(0.1,-270,120));
        Utils.doQAction(this._fire._btnWish);
    }
    
    start(){
        this._fire._preDefense.script.setInStart(3);
        this._fire._preBullet.script.setInStart(2);
    }

    //初始化接收事件
    _initEvent() {
        // yyp.eventCenter.on('config-loaded',this._prepare,this);                 //配置加载完毕
        yyp.eventCenter.on('current-levelid',this._updateLevelid,this);         //当前关卡
        yyp.eventCenter.on('current-enemycount',this._updateEnemyCount,this);   //敌人数量
        yyp.eventCenter.on('player-death',this._playerDeath,this);              //player死亡
        // yyp.eventCenter.on('add-coin',this._addCoin,this);                      //金币增加
        yyp.eventCenter.on('restart',this._prepare,this);                       //重新开始
        yyp.eventCenter.on('update',this._updateMsg,this);                       //进入/退出升级界面
        yyp.eventCenter.on("player-revive",this._playerRevive,this);             //复活
        yyp.eventCenter.on("game-pause",this._gamePause,this);                  //暂停
        yyp.eventCenter.on("game-resume",this._gameResume,this);                  //恢复
        this._fire._lyStart.on(cc.Node.EventType.TOUCH_END, this._onStartClick, this);
    }

    //销毁事件
    _destroyEvent() {
        // yyp.eventCenter.off('config-loaded',this._prepare,this);                 //配置加载完毕
        yyp.eventCenter.off('current-levelid',this._updateLevelid,this);         //当前关卡
        yyp.eventCenter.off('current-enemycount',this._updateEnemyCount,this);   //敌人数量
        yyp.eventCenter.off('player-death',this._playerDeath,this);              //player死亡
        // yyp.eventCenter.off('add-coin',this._addCoin,this);                      //金币增加
        yyp.eventCenter.off('restart',this._prepare,this);                       //重新开始
        yyp.eventCenter.off('update',this._updateMsg,this);                       //进入/退出升级界面
        yyp.eventCenter.off("player-revive",this._playerRevive,this);             //复活
        yyp.eventCenter.off("game-pause",this._gamePause,this);                  //暂停
        yyp.eventCenter.off("game-resume",this._gameResume,this);                  //恢复
        this._fire._lyStart.off(cc.Node.EventType.TOUCH_END, this._onStartClick, this);
    }

    onDestroy() {
        //销毁事件
        this._destroyEvent();
    }


    // 当前关卡
    _updateLevelid(event){
        this._levelId = event.levelid;
        this._fire._lbLevel.$Label.string = "关卡:" + event.levelid;
    }

    // 敌人数量
    _updateEnemyCount(event){
        this._fire._lbEnemy.$Label.string = event.enemycount;
        if (event.enemycount == 0) {
            LocalizedData.setIntItem("_level1_", this._levelId + 1);
            // cc.log("win!!!!!!!!!!!");

            this._fire._lyStart.active = false;
            this._fire._joystick.active = false;
            this._fire._ui.active = false;
            this._fire._nUpdate.script.refreshLevelInfo();

            this._fire._tiled.script.setFinish();

            //显示胜利界面
            let finish = cc.instantiate(this.finishPrefab);
            finish.zIndex = 1000;
            Utils.addtoCurrentScene(finish);
            finish.script.setResult(this._levelId,true);
        }
    }

    // 玩家死亡
    _playerDeath(event){
        // cc.log("failed!!!!!!!!!!!");
            

        
        if (RewardAd.getInstance().isLoad()) {
            //显示复活界面
            let revive = cc.instantiate(this.revivePrefab);
            revive.zIndex = 1000;
            Utils.addtoCurrentScene(revive);
            revive.script.init(this._levelId);
        }
        else{
            this._playerRevive({type:false});
        }
        
    }

    _playerRevive(event){
        if (event.type == true) {
            //复活
            this._fire._tiled.script.revive();
        }
        else{
            this._fire._lyStart.active = false;
            this._fire._joystick.active = false;
            this._fire._ui.active = false;
            this._fire._nUpdate.script.refreshLevelInfo();
            this._fire._tiled.script.setFinish();

            //显示失败界面
            let finish = cc.instantiate(this.finishPrefab);
            finish.zIndex = 1000;
            Utils.addtoCurrentScene(finish);
            finish.script.setResult(this._levelId,false);
        }
    }
    
    _gamePause(){
        this._fire._tiled.script.pause();
    }
    
    _gameResume(){
        this._fire._tiled.script.resume();
    }

    // 金币增加
    // _addCoin(event){
    //     this._fire._lyCoin.script.refresh(event.count,event.position);
    // }
    
    //准备开始
    _prepare(event){
        this._fire._recommendBtns.runAction(cc.moveTo(0.1,-270,120));

        this._fire._lyStart.active = true;
        this._fire._nUpdate.active = true;
        
        // 清空场景
        this._fire._tiled.script.cleanMap();  

        this._fire._toggle.$Toggle.isChecked = true;

        this._startCount++;
        if (this._startCount >=3) {
            let self = this;
            if (InsertAd.getInstance().isLoad()) {
                self._startCount = 0;
                InsertAd.getInstance().show();
            }
        }
    }
    _updateMsg(event){
        if (event.type == 'in') {
            this._fire._recommendBtns.runAction(cc.moveTo(0.1,-390,120));
        }
        else if (event.type == 'out') {
            this._fire._recommendBtns.runAction(cc.moveTo(0.1,-270,120));
        }
    }

    //开始按钮
    _onStartClick(){
        MusicManager.playEffect("btn");
        this._fire._recommendBtns.runAction(cc.moveTo(0.1,-390,120));

        //隐藏开始按钮
        this._fire._lyStart.active = false;
        this._fire._joystick.active = true;
        this._fire._ui.active = true;
        this._fire._nUpdate.active = false;

        this._fire._adDefense.script.setAD(3);
        this._fire._adBullet.script.setAD(2);
        this._fire._adLife.script.setAD(1);
        
        
        // 开始游戏
        let self = this;
        this._fire._tiled.script.startGame(function(){
            if (self._fire._toggle.$Toggle.isChecked) {
                self._fire._preDefense.script.emitSkill();
                self._fire._preBullet.script.emitSkill();
            }
        });   
        
    }

    //开始按钮
    onSettingClick(){
        MusicManager.playEffect("btn");
        Utils.showDialogs(this.settingPrefab);
    }
    
    //点击显示转盘按钮
    onWishBtnClick(){
        Analytics.getInstance().event('enter_wish');
        MusicManager.playEffect("btn");    //按钮音效
        Utils.showDialogs(this.wishPrefab);
    }
}
