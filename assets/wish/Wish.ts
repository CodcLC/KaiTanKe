import {Utils} from "../script/base/Utils";
import {Dialogs} from "../script/base/Dialogs";
import {MusicManager} from "../script/base/MusicManager";

import {RewardAd} from "../script/ad/RewardAd";
import {Analytics} from "../script/ad/Analytics";

const {ccclass, property} = cc._decorator;

//私有函数,请使用'_'开头
//请修改'NewClass' => 自己的类名
@ccclass
export class Wish extends Dialogs {

    _inRotation = false;    //正在旋转
    _rotationTime = 0;
    _baseAngle = 360/8;
    _accelerate = 0.25;
    _deceleration = 0;  //减速度
    _speed = 0;
    _speedType = 0; //0 空闲 1 加速 2 高速匀速 3 减速

    _resultIndex = 3;

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
        Utils.doQAction(this._fire._btnStart);

        for (let i = 1; i <= 8; i++) {
            const element = this._fire["_award" + i];
            let angle = this._baseAngle * (i-1);
            element.angle = angle - 90;

            let dir = Utils.degressToVectors(angle);
            element.position = dir.mul(150);
        }
    }

    //初始化事件
    _initEvent() {
    }

    //销毁事件
    _destroyEvent() {
    }


    onStartClick(event){
        MusicManager.playEffect("btn");    //按钮音效
        
        this._resultIndex = Utils.randomInt(1,9);

        
        if (RewardAd.getInstance().isLoad()) {
            let self = this;
            RewardAd.getInstance().show(function(complete){
                if (complete) {
                    Analytics.getInstance().event('wish_video');
                    self._start();
                }
            });
        }
        else{
            // this._start();
        }

    }

    _start(){
        this._speedType = 1;
        this._inRotation = true;
        this._fire._btnStart.stopAllActions();
        this._fire._btnStart.$Button.interactable = false;
    }

    //获取目标角度
    getAngle(index){
        let ret = (this._baseAngle * (index-1) * -1) + 90
        return Utils.correctionAngle360(ret);
    }

    //获取减速度
    getDeceleration(resultAngle){
        if (resultAngle > this._fire._wishPanel.angle) {
            resultAngle -= 360;
        }
        let diffAngle = Math.abs(resultAngle - this._fire._wishPanel.angle);
        if (diffAngle < 180) {
            diffAngle += 360;
        }
        cc.log(diffAngle);
        let a = (this._speed*this._speed)/(diffAngle*2+this._speed);
        return a;
    }
    
    //重置
    _reset(){
        this._fire._btnStart.$Button.interactable = true;
        Utils.doQAction(this._fire._btnStart);

        this._speedType = 0;
        this._speed == 0;
        this._inRotation = false;
        this._rotationTime = 0;
    }

    //经过缝隙
    afterGap(preAngle, nextAngle){
        for (let i = 1; i <= 8; i++) {
            let angle = this._baseAngle * (i-0.5);
            if (preAngle >= angle && nextAngle <= angle) {
                return true;
            }
        }
        return false;
    }

    update(dt){
        if (this._inRotation) {
            this._rotationTime += dt;
            if (this._speedType == 1) {
                this._speed += this._accelerate;
        
                if (this._rotationTime >= 1) {
                    this._speedType = 2;
                }
            }
            else if (this._speedType == 2) {
                if (this._rotationTime >= 2) {
                    this._speedType = 3;
                    let resultAngle = this.getAngle(this._resultIndex);
                    this._deceleration = this.getDeceleration(resultAngle);
                    return;
                }
            }
            else if (this._speedType == 3) {
                this._speed -= this._deceleration;
                this._speed = this._speed < 0 ? 0 : this._speed;
                
                if (this._speed == 0) {
                    yyp.eventCenter.emit('add-coin',{count:this._resultIndex*100,position:Utils.getWorldPosition(this._fire["_award" + this._resultIndex]),p:"转盘获取"});
                    this._reset();
                }
            }
            
            let preAngle = this._fire._wishPanel.angle;
            let nextAngle = Utils.correctionAngle360(this._fire._wishPanel.angle - this._speed);
            this._fire._wishPanel.angle = nextAngle;
            
            //拨片
            if (this.afterGap(preAngle, nextAngle)) {
                this._fire._wishArrow.stopAllActions();
                this._fire._wishArrow.runAction(cc.sequence(
                    cc.rotateTo(0.03,-30),
                    cc.rotateTo(0.03,0)
                ));
            }
        }
    }
}
