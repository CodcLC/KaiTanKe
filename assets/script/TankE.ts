import {BaseComponent} from "./base/BaseComponent";
import {Utils} from "./base/Utils";
import { MusicManager } from "./base/MusicManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class Tank extends BaseComponent {

    @property(cc.Prefab)
    bulletPrefab: cc.Prefab = null;
    
    @property(cc.Prefab)
    boomPrefab: cc.Prefab = null;

    //移动,碰撞检测
    _camp       = "";           //阵营
    _radius     = 10;           //碰撞检测半径
    _dir        = cc.v2(1,0);   //当前行进方向
    _barrelDir  = cc.v2(1,0);   //炮管方向
    _ratio      = 0;            //当前速率
    _map        = null;         //tile map 节点

    _hp         = 0;            //当前血量
    _maxHp      = 0;            //最大血量血量
    _atk        = 0;            //攻击力
    _def        = 0;            //防御
    _config:any = {};

    _tankType   = 1;            //坦克类型
    _currentBg  = null;

    onLoad () {
        this._radius = this.node["$CircleCollider"].radius;
        this._dir = Utils.degressToVectors(this._fire._lyBg.angle);
        this._barrelDir = this._dir;
    }
    
    //设置tiled map
    setMap(map) {
        this._map = map;
    }
    
    //设置坦克类型
    setTankType(tankType) {
        this._tankType = tankType;
        this._config = yyp.config.Tank[this._tankType];

        //炮身
        this._fire._lyBg.children.forEach((child) => {
            if (child.name != "_sprBg" + this._tankType) {
                child.active = false;
            }
            else{
                child.active = true;
            }
        });
        
        //炮筒
        this._fire._lyBarrel.children.forEach((child) => {
            if (child.name != "_sprBarrel" + this._tankType) {
                child.active = false;
            }
            else{
                child.active = true;
                this._currentBg = child;
            }
        });
    }

    //获取碰撞检测半径
    getRadius() {
        return this._radius;
    }

    //获取玩家的新位置
    _getWillPosition(currPosition, dir, ratio) {
        let dis = dir.mul(ratio * this._config.Speed);
        return currPosition.add(dis);
    }
    
    // 获取碰撞后的尝试方向
    _getTestDir(P,radius,dir,colliderItems){
        let testDirs = [];

        //获取尝试方向
        if (this._camp == "enemy") {
            for (let i = 1; i < 6; i++) {
                let testDir = Utils.vectorsRotateDegress(dir, 30 * i);
                testDirs.push(testDir);
            }
            for (let i = 1; i < 7; i++) {
                let testDir = Utils.vectorsRotateDegress(dir, -30 * i);
                testDirs.push(testDir);
            }
        }
        else{
            //按最优获取
            for (let i = 0; i < colliderItems.length; i++) {
                let colliderItem = colliderItems[i];
                this._getTestDirs(P,dir,colliderItem,testDirs);
            }
        }

        //检测尝试方向
        for (let i = 0; i < testDirs.length; i++) { 
            let testDir = testDirs[i];
            if (this._circlePassColliderItems(P,radius,testDir,colliderItems) == false){
                return testDir;
            }
        }

        return null;
    }

    //点p为圆心,radius为半径,方向dir的圆,是否会经过colliderItems中的一条线段
    _circlePassColliderItems(P,radius,dir,colliderItems){
        for (let i = 0; i < colliderItems.length; i++) {
            let colliderItem = colliderItems[i];

            let A = colliderItem.collider.offset.add(colliderItem.collider.points[0]);
            let B = colliderItem.collider.offset.add(colliderItem.collider.points[1]);
            if (Utils.circlePassLine(P,radius,dir,A,B)){
                return true;
            }
        }

        return false;
    }
    
    //射线起始点P,方向dir,与线段AB(colliderItem组成)碰撞后的尝试方向列表
    _getTestDirs(P,dir,colliderItem,retDirs){
        let P1 = colliderItem.point;    //collider上距离P最近的点
        let dirPP1 = P1.sub(P).normalize();
        let radianPP1 = cc.v2(dirPP1).signAngle(dir);    // 求方向向量与对比向量间的弧度

        let baseDir = dir;
        let maxDir = radianPP1 > 0 ? Utils.vectorsRotateDegress(baseDir, 90) : Utils.vectorsRotateDegress(baseDir, -90);
        let parallelDegree = this._getParallelDegree(baseDir,maxDir,colliderItem.collider);
        let symbol = radianPP1 > 0 ? 1 : -1;

        for (let i = 1; i <= 6; i++) {
            let offsetDegree = i * 15 * symbol;
            if (parallelDegree) {
                if (symbol > 0 && parallelDegree < offsetDegree) {
                    let testDir = Utils.vectorsRotateDegress(baseDir, parallelDegree);
                    retDirs.push(testDir);
                    parallelDegree = null;
                }
                else if (symbol < 0 && parallelDegree > offsetDegree) {
                    let testDir = Utils.vectorsRotateDegress(baseDir, parallelDegree);
                    retDirs.push(testDir);
                    parallelDegree = null;
                }
            }
            let testDir = Utils.vectorsRotateDegress(baseDir, offsetDegree);
            retDirs.push(testDir);
        }

    }

    //获取平行于collider,且包含在baseDegree,maxDegree的角度(相对baseDir)
    _getParallelDegree(baseDir,maxDir,collider){
        let A = collider.offset.add(collider.points[0]);
        let B = collider.offset.add(collider.points[1]);
        let AB = B.sub(A).normalize();
        let BA = A.sub(B).normalize();

        let radianMax = maxDir.signAngle(baseDir);
        let radianAB = AB.signAngle(baseDir);
        let radianBA = BA.signAngle(baseDir);

        if (radianMax > 0) {
            if (radianAB > 0 && radianAB < radianMax) {
                return -cc.misc.radiansToDegrees(radianAB);
            }
            if (radianBA > 0 && radianBA < radianMax) {
                return -cc.misc.radiansToDegrees(radianBA);
            }
        }
        else if (radianMax < 0) {
            if (radianAB < 0 && radianAB > radianMax) {
                return -cc.misc.radiansToDegrees(radianAB);
            }
            if (radianBA < 0 && radianBA > radianMax) {
                return -cc.misc.radiansToDegrees(radianBA);
            }
        }

        return null;
    }

    //刷新玩家角度
    _refreshAngle(){
        //动态修改player角度
        let fromAngle = this._fire._lyBg.angle;
        let toAngle = Utils.vectorsToDegress(this._dir);
        let disAngle = toAngle - fromAngle;

        //使当前角度和目标角度处于同一个维度,以便算出来的偏移角度是最小的
        if (disAngle > 180) {
            fromAngle = fromAngle + 360;
            disAngle = toAngle - fromAngle;
        }
        else if (disAngle < -180) {
            fromAngle = fromAngle - 360;
            disAngle = toAngle - fromAngle;
        }

        //每帧最多只向目标角度旋转10度
        if (disAngle > 10) {
            this._fire._lyBg.angle = this._fire._lyBg.angle+10;
        }
        else if (disAngle < -10) {
            this._fire._lyBg.angle = this._fire._lyBg.angle-10;
        }
        else{
            this._fire._lyBg.angle = toAngle;
        }

        //修正角度在-180~180范围内
        this._fire._lyBg.angle = Utils.correctionAngle(this._fire._lyBg.angle);


        //调整炮管角度
        this._fire._lyBarrel.angle = Utils.vectorsToDegress(this._barrelDir);
        
    }
    
    //被攻击到()
    beHit(damage){
        // cc.log("enemy behit");

        if (this._camp == "player") {
            let a= 1;
            // damage = 10000000000000000;
        }
        else{
            let a= 1;
        }
        //计算伤害
        damage = damage - this._def;
        if (damage < 0) { damage = 0;}

        //计算最新血量
        this._hp -= damage;
        if (this._hp < 0) { this._hp = 0;}
        
        //计算血量条显示百分百
        this.refreshHp();
        
        //血量等于0,进入死亡逻辑
        if (this._hp == 0) {
            this.doDeath();
        }
    }
    
    //计算血量条显示百分百
    refreshHp(){
        let percent = this._hp/this._maxHp;
        this._fire._lifebar.$ProgressBar.progress = percent;
    }

    //执行死亡
    doDeath(){
        let boom = cc.instantiate(this.boomPrefab);
        boom.parent = this.node.parent;
        boom.position = this.node.position;
        boom.zIndex = 1000;

        let ani = boom.getComponent(cc.Animation);
        ani.play("boom2");
        MusicManager.playEffect("boom");
        Utils.vibrate();
    }
}
