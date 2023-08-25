import {BaseComponent} from "./base/BaseComponent";
import { Utils } from "./base/Utils";
import {LocalizedData} from "./base/LocalizedData";
import {MusicManager} from "./base/MusicManager";
import {Share} from "./ad/Share";

const {ccclass, property} = cc._decorator;

//私有函数,请使用'_'开头
//请修改'NewClass' => 自己的类名
@ccclass
export class CoinItem extends BaseComponent {

    _viewCount = -1;    //显示数量
    _realCount = -1;    //实际数量

    //加载完成
    onLoad () {
        //初始化变量
        this._initVariable();
        
        //初始化事件
        this._initEvent();
    }

    onDestroy() {
        //销毁事件
        this._destroyEvent();
    }

    //初始化变量
    _initVariable() {
        this._viewCount = this._realCount = LocalizedData.getIntItem("_coin_",0);
        this._refreshLabel();
    }

    //初始化事件
    _initEvent() {
        yyp.eventCenter.on('add-coin',this._refresh,this);                      //金币增加
        yyp.eventCenter.on('reduce-coin',this._reduce,this);                    //金币减少
    }

    //销毁事件
    _destroyEvent() {
        yyp.eventCenter.off('add-coin',this._refresh,this);                      //金币增加
        yyp.eventCenter.off('reduce-coin',this._reduce,this);                    //金币减少
    }

    /**
    获取金币数量
    */
    count(){
        return this._realCount;
    }

    _reduce(event){
        event.count *= -1;
        this._refresh(event);
    }

    /**
    刷新金币数量(数量,世界坐标)
    */
    _refresh(event){
        let count = event.count;
        let position = event.position;
        let reason = event.p;

        if (this._viewCount < 0 && this._realCount < 0) {   //第一次刷新
            this._realCount = count;
            this._viewCount = this._realCount;
            this._refreshLabel();
            LocalizedData.setIntItem("_coin_",this._realCount);
        }
        else if (count <= 0 || position == null) {          //没有传位置或者是减少
            this._realCount += count;
            this._viewCount = this._realCount;
            this._refreshLabel();
            LocalizedData.setIntItem("_coin_",this._realCount);
        }
        else{
            position = this._fire._sprCoin.parent.convertToNodeSpaceAR(position);
            for (let i = 0; i < 4; i++) {
                this._createCoin(Math.floor(count/4), position, 1 + i*0.1);
            }
        }
    }

    //刷新显示
    _refreshLabel(){
        this._fire._lbCoin.$Label.string = Utils.transformNumber(this._viewCount);
    }

    update(dt){
        if (this._viewCount < this._realCount) {
            this._viewCount += this._viewCount < 1000 ? 9 : 100;
            if (this._viewCount > this._realCount) {
                this._viewCount = this._realCount;
            }
            this._refreshLabel();
        }
    }

    //创建飞行金币,并以贝塞尔曲线方式方向目标
    _createCoin(count,position,time){
        let coin = new cc.Node();
        coin.position = position;
        coin.parent = this._fire._sprCoin.parent;
        coin.scale = 0.5;
        coin.zIndex = 100;
        let sprite = coin.addComponent(cc.Sprite);
        sprite.spriteFrame = this._fire._sprCoin.$Sprite.spriteFrame;

		let now = coin.position;
        let to = this._fire._sprCoin.position;
        
        let len = Math.random()*300 + 200;
        let dir = Utils.degressToVectors(Math.random()*360);
        let control = cc.v2(now).add(dir.mul(len));
        
        let self = this;
        coin.runAction(cc.sequence(
            cc.spawn(
                cc.bezierTo(time, [now, control, to]),
                cc.scaleTo(time, 0.8,0.8)
            ),
			cc.callFunc(function(){
                MusicManager.playEffect("coin");    //收金币音效
                self._realCount += count;
                LocalizedData.setIntItem("_coin_",self._realCount);
            }),
            cc.removeSelf()
		))
    }

    onAddClick(event) {
        // Analytics.getInstance().event('coin_share');
        MusicManager.playEffect("btn");    //按钮音效
        
        Share.getInstance().share(function(res){
            if (res) {
                yyp.eventCenter.emit('add-coin',{count:50,p:"金币加号"});
            }
        },0)

    }
}
