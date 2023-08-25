import {Tank} from "./TankE";
import {Utils} from "./base/Utils";
import {Bullet} from "./BulletE";
import { MusicManager } from "./base/MusicManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class Player extends Tank {

    //内部变量
    _level          = 1;        //玩家等级

    _bulletCodeTime = 0;        //射击冷却时间

    _isHighBullet   = false;    //三发高频子弹

    _skill2Time     = 0;        //技能2(超级子弹)剩余时间
    _skill3Time     = 0;        //技能3(无敌防御)剩余时间

    _inGame         = false;    //在游戏中中使用
    _viewMode       = false;    //展示模式

    onLoad () {
        super.onLoad();
        
        //初始化变量
        this._initVariable();

        //初始化UI
        this._initUI();

        //初始化接收事件
        this._initEvent();
    }

    //初始化变量
    _initVariable() {
        this._camp = "player";  //阵营
        this._radius = this._radius * 2;    //玩家的碰撞检测范围*2
    }

    //设置坦克类型
    setPlayerType(tankType,playerLevel) {
        super.setTankType(tankType);
        
        //计算玩家血量 攻击
        this._level = playerLevel;
        this._hp = this._maxHp = this._config.HP * (this._level+1);
        this._atk = this._config.ATK * (this._level+1);
    }

    //初始化UI
    _initUI(){
        this._fire._lifebar.active = false;
        this._fire._spArmour.active = false;
        this._fire._spSkill2.active = false;
        this._fire._spSkill3.active = false;
    }

    //初始化接收事件
    _initEvent() {
        yyp.eventCenter.on('joy-stick',this._doJoyStick,this);      //摇杆事件
        yyp.eventCenter.on('trigger-skill',this._doSkill,this);     //触发技能
    }
       
    //销毁事件
    _destroyEvent() {
        yyp.eventCenter.off('joy-stick',this._doJoyStick,this);     //摇杆事件
        yyp.eventCenter.off('trigger-skill',this._doSkill,this);    //触发技能
    }
    
    //摇杆事件
    _doJoyStick(event) {
        if (this._inGame) {
            this._dir = event.dir;      //方向
            this._ratio = event.ratio;  //速率
    
            this._refreshPosition();
        }
    }
    
    //触发技能
    _doSkill(event) {
        if (this._inGame) {
            let skillId = event.skillId;    //方向
            // cc.log("触发了技能 ",skillId);
            if (skillId == 0) {
                yyp.eventCenter.emit('add-coin',{count:this._config.Coin/10,position:Utils.getWorldPosition(this.node)});
            }
            else if (skillId == 1) {
                this._hp += this._maxHp/2;
                if (this._hp > this._maxHp) {
                    this._hp == this._maxHp;
                }
                this.refreshHp();
            }
            else if (skillId == 2) {
                this._skill2Time += 15;
            }
            else if (skillId == 3) {
                this._skill3Time += 15;
            }
        }
    }

    onDestroy() {
        //销毁事件
        this._destroyEvent();
    }

    //刷新玩家位置
    _refreshPosition() {
        let currPosition = this.node.position;

        //碰撞测试
        let willPosition = this._getWillPosition(currPosition, this._dir, this._ratio);
        let colliderItems = this._map.testColliders(willPosition, this._radius);
        if (colliderItems.length > 0){
            let testDir = this._getTestDir(currPosition, this._radius, this._dir, colliderItems);
            if (testDir) {
                willPosition = this._getWillPosition(currPosition, testDir, this._ratio);
            }
            else{
                return;
            }
        }

        this.node.setPosition(willPosition);
    }

    update(dt){

        if (this._inGame) {
            if (this._map._pause) return;
            
            //玩家和技能icon,碰撞检测
            this._map.playerSkillIconCollisionTest();
    
            //计算炮管方向
            let enemy = this._map.getNearEnemy();
            if (enemy) {
                let enemyPos = cc.v2(enemy.position);
                let playerPos = cc.v2(this.node.position);
                this._barrelDir = enemyPos.sub(playerPos).normalize();
            }
            else{
                this._barrelDir = this._dir;
            }
            this._refreshAngle();
    
            // 技能2(超级子弹)
            this._skill2Time -= dt;
            this._skill2Time = this._skill2Time < 0 ? 0 : this._skill2Time;
            this._fire._spSkill2.active = this._skill2Time > 0;
            
            // 技能3(无敌防御)
            this._skill3Time -= dt;
            this._skill3Time = this._skill3Time < 0 ? 0 : this._skill3Time;
            this._fire._spSkill3.active = this._skill3Time > 0;
    
            //射击
            this.shooting(dt);
    
            //显示铠甲
            this._fire._spArmour.active = this._skill3Time > 0;
            this._def = this._skill3Time > 0 ? 10000000 : 0;

            this.node.zIndex = this._map.judgezIndex(this.node.y);
        }
        else if(this._viewMode){
            this._dir = Utils.vectorsRotateDegress(this._dir,-0.5);
            this.node.angle = Utils.vectorsToDegress(this._dir);
            this._barrelDir = this._dir;
            this.shooting(dt);
        }
        
    }


    //射击
    shooting(dt){
        let judgeCD = this._skill2Time > 0 ? this._config.BulletCodeTime/4 : this._config.BulletCodeTime;

        this._bulletCodeTime += dt;
        if (this._bulletCodeTime >= judgeCD) {
            this._bulletCodeTime = 0;

            //创建子弹
            let type = (this._viewMode || this._skill2Time > 0) ? this._config.BType2 : this._config.BType1;
            let attackRadius = this._viewMode ? this._config.AttackRadius * 0.8 :this._config.AttackRadius;
            Bullet.createBulletEx(type,this.node.position,this._barrelDir,this._fire._lyBarrel.height+20,attackRadius,this._atk,this._camp,this.node.parent,this._map);
            
            if (this._viewMode == false && this._map.enemyCount() > 0) {
                MusicManager.playEffect("shoot");
            }
        }
    }
    
    //执行死亡
    doDeath(){
        super.doDeath();
        
        yyp.eventCenter.emit("player-death",{});
        this.node.destroy(); 
        // 爆炸效果
        // 显示结束界面
    }

    setInGame(){
        this._inGame = true;
        this._fire._lifebar.active = true;
    }
    
    //获取碰撞框
    getPlayerBoundingBox(){
        return Utils.getWorldBoundingBox(this._currentBg);
    }

    setViewMode(){
        this._viewMode = true;
    }
}
