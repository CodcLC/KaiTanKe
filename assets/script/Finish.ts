import {Utils} from "./base/Utils";
import { BaseComponent } from "./base/BaseComponent";
import { MusicManager } from "./base/MusicManager";

import {Analytics} from "./ad/Analytics";
import {RewardAd} from "../script/ad/RewardAd";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Finish extends BaseComponent {

    _levelId =  1;      //关卡id
    _result = true;     //true 胜利 false 失败
    _coinCount = 0;
    

    onLoad () {
    }

    start () {

    }

    _aniFinished () {
        this._fire._btnGet.runAction(cc.sequence(
            cc.delayTime(1),
            cc.scaleTo(0.1,1.2,1.2),
            cc.scaleTo(0.1,1,1),
            cc.scaleTo(0.05,1.05,1.05),
            cc.scaleTo(0.02,1,1)
        ).repeatForever());
        
        let self = this;
        this._fire._nToggle.runAction(cc.sequence(
            cc.delayTime(3),
            cc.fadeIn(0.1),
            cc.callFunc(function(){
                self._fire._toggle.active = true;
            })
        ));
    }

    setResult(levelId,result){
        this._levelId = levelId
        this._result = result;

        //关卡
        this._fire._lbLevel.$Label.string = levelId;
        
        //金币
        let levelConfig = yyp.config.Level[0];
        let coinCount = levelConfig.CoinCount*levelId*1.5;
        this._coinCount = this._result ? coinCount : Math.floor(coinCount/3);
        this._fire._lbCoin.$Label.string = this._coinCount*3;
        
        //title
        this._fire._sprWinBg.active = this._result;
        this._fire._sprWin.active = this._result;
        this._fire._sprFail.active = !this._result;

        //按钮
        this._fire._nToggle.opacity = 0;
        this._fire._toggle.active = false;

        if (this._result == true) {
            Analytics.getInstance().eventEx('win_game',{"level":this._levelId});
            MusicManager.playEffect("win");
        }
        else{
            Analytics.getInstance().eventEx('failed_game',{"level":this._levelId});
            MusicManager.playEffect("failed");
        }
        let ani = this.node.getComponent(cc.Animation);
        ani.play("Finish");
        ani.on("finished", this._aniFinished, this);
    }
    
    
    onBtnClick (event) {
        MusicManager.playEffect("btn");
        let coin = this._coinCount;
        if (this._fire._toggle.$Toggle.isChecked) {
            
            if (RewardAd.getInstance().isLoad()) {
                Analytics.getInstance().eventEx('finish_video',{"level":this._levelId});
                let self = this;
                RewardAd.getInstance().show(function(complete){
                    yyp.eventCenter.emit('add-coin',{count:(complete ? coin*3 : coin),position:Utils.getWorldPosition(self._fire._sprCoin)});
                    yyp.eventCenter.emit('restart',{});
                    self.node.destroy();
                });
            }
            else{
                yyp.eventCenter.emit('add-coin',{count:coin,position:Utils.getWorldPosition(this._fire._sprCoin)});
                yyp.eventCenter.emit('restart',{});
                this.node.destroy();
            }
        }
        else{
            yyp.eventCenter.emit('add-coin',{count:coin,position:Utils.getWorldPosition(this._fire._sprCoin)});
            yyp.eventCenter.emit('restart',{});
            this.node.destroy();
        }

    }
    
    onToggleClick (event) {
        MusicManager.playEffect("btn");
        if (this._fire._toggle.$Toggle.isChecked) {
            this._fire._lbRewardsTIps.active = true;
            this._fire._lbCoin.$Label.string = this._coinCount*3;
        }
        else{
            this._fire._lbRewardsTIps.active = false;
            this._fire._lbCoin.$Label.string = this._coinCount;
        }
    }
}
