import {BaseComponent} from "./base/BaseComponent";
import {Utils} from "./base/Utils";
import {RewardAd} from "./ad/RewardAd";
import {Analytics} from "./ad/Analytics";

const {ccclass, property} = cc._decorator;

@ccclass
export class SkillIcon extends BaseComponent {

    //编辑器属性
    @property(cc.SpriteFrame)
    skillSpriteFrames: cc.SpriteFrame[] = [];

    //私有属性,请使用'_'开头,驼峰命名
    _skillId    = 0;       //0 金币 1 生命 2 超级子弹 3 无敌防御 

    _type       = -1;       //-1 准备状态 0 待使用 1 切换技能中
    _inUI       = true;     //在UI层(点击后切换到使用状态)
    _inStart    = true;     //在开始界面
    _useTime    = 0;        //使用剩余时间
    _AD         = false;    //点击播放广告

    _readyNeedTime  = 30;   //准备状态需要耗时
    _readyTime      = 0;    //准备状态已经用时

    _changeNeedTime  = 10;  //切换技能需要耗时
    _changeTime      = 0;   //切换技能已经用时

    _boundingBox    = null;

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
        this._skillId = Math.floor(Math.random()*4);
    }

    //初始化UI
    _initUI(){
        this._resetSpriteFrame();
        this._refreshType();
    }

    //初始化事件
    _initEvent() {
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    }

    //销毁事件
    _destroyEvent() {
    }

    //替换icon
    _resetSpriteFrame() {
        this._fire._spDark.getComponent(cc.Sprite).spriteFrame = this.skillSpriteFrames[this._skillId];
        this._fire._spLight.getComponent(cc.Sprite).spriteFrame = this.skillSpriteFrames[this._skillId];
    }

    //每帧调用
    update (dt) {
        if (this._type == -1) {
            if (this._readyTime >= this._readyNeedTime) {
                this._type = 0;
                this._refreshType();
            }
            else{
                //设置进度
                this._readyTime += dt;
                if (this._readyTime >= this._readyNeedTime) {
                    this._readyTime = this._readyNeedTime;
                }
                this._fire._spDark.$ProgressBar.progress = (this._readyNeedTime-this._readyTime)/this._readyNeedTime;
            }

        }
        else if (this._type == 1) {
            this._changeTime += dt;
            if (this._changeTime >= this._changeNeedTime) {
                this._type = -1;
                this._refreshType();
            }
            
        }
    }

    //切换显示状态
    _refreshType(){
        if (this._type == -1) {
            this._fire._lb.$Label.string = "准备中"+this._skillId;

            //显示icon
            this._fire._spDark.active = true;
            this._fire._spLight.active = true;
            
            this._fire._spLight["$flash-light"].setPause(); //暂停扫光

            this._readyTime = 0;    //准备状态用时重置为0
        }
        else if (this._type == 0) {
            this._fire._lb.$Label.string = "点击使用"+this._skillId;

            this._fire._spLight["$flash-light"].setStart(); //开始扫光
            
            this._fire._spDark.$ProgressBar.progress = 0;
        }
        else if (this._type == 1) {
            this._fire._lb.$Label.string = "切换技能中";

            //隐藏icon
            this._fire._spDark.active = false;
            this._fire._spLight.active = false;

            //随机新的技能
            this._skillId = Math.floor(Math.random()*4);
            this._resetSpriteFrame();

            this._fire._spDark.$ProgressBar.progress = 1;   
            this._fire._spLight["$flash-light"].setPause(); //暂停扫光
            
            this._changeTime = 0;    //切换技能用时重置为0
        }
    }
    
    _onTouchEnd(event) {
        if (this._type == 0) {

            if (this._inUI) {
                this.emitSkill();
                this._type = 1;
                this._refreshType();
                Analytics.getInstance().eventEx('use_skill_random',{"skillId":this._skillId});
            }
            else if (this._AD) {
                if (RewardAd.getInstance().isLoad()) {
                    Analytics.getInstance().eventEx('use_skill_video',{"skillId":this._skillId});
                    let self = this;
                    yyp.eventCenter.emit('game-pause',{});
                    RewardAd.getInstance().show(function(complete){
                        yyp.eventCenter.emit('game-resume',{});
                        if (complete) {
                            self.emitSkill();
                        }
                    });
                }
            }
        }

        
    }

    //发送技能事件
    emitSkill(){
        yyp.eventCenter.emit('trigger-skill',{skillId:this._skillId});
    }

    //获取碰撞框
    getSkillBoundingBox(){
        return Utils.getWorldBoundingBox(this._fire._spLight,0.8);
    }
    
    //设置为可使用状态
    setInGame(){
        this._inUI = false;
        this._type = 0;
        this._refreshType();
        this.node.runAction(cc.sequence(
            cc.delayTime(5),
            cc.fadeOut(1),
            cc.removeSelf()
        ));
    }
    
    //设置为可使用状态
    setInStart(skillId){
        this._inUI = false;
        this._skillId = skillId;
        this._inStart = true;
        this._type = 0;
        this._refreshType();
        this._resetSpriteFrame();
    }
    
    //设置为可使用状态
    setAD(skillId){
        this._inUI = false;
        this._skillId = skillId;
        this._AD = true;
        this._type = 0;
        this._refreshType();
        this._resetSpriteFrame();
        this._fire._ad.active = true;
    }
}
