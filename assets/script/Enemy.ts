import {Tank} from "./TankE";
import {Utils} from "./base/Utils";
import {Bullet} from "./BulletE";

const {ccclass, property} = cc._decorator;

@ccclass
export class Enemy extends Tank {

    //敌人类型
    // @property()
    // enemyType: number = 1;

    //内部变量
    _bulletCodeTime = 1;        //射击冷却时间
    _target         = null;     //攻击目标

    // A*
    _walkPaths      = [];       //行走列表
    _willPos        = null;     //
    _codeTime       = 0.5;      //冷却时间

    onLoad () {
        super.onLoad();
        
        //初始化UI
        this._initUI()

        //初始化变量
        this._initVariable();
    }

    //初始化变量
    _initVariable() {
        this._camp = "enemy";  //阵营
    }
      
    //初始化UI
    _initUI(){
    }

    //设置敌人类型
    setEnemyType(tankType,levleId) {
        super.setTankType(tankType);

        //计算敌人血量 攻击
        this._hp = this._maxHp = this._config.HP*(levleId+1);
        this._atk = this._config.ATK*(levleId+1);
        
    }

    //设置目标
    setTarget (target) {
        this._target = target;
    }  

    //设置冷却时间
    _resetCodeTime () {
        this._codeTime = Math.random()*0.5 + 0.3;
    }
    
    ///////////////////// A* /////////////////////
    findPath (_startTime) {
        this._walkPaths = [];
        // this._map.resetMap();


        let starTile = this._map.gamePosToTile(this.node.position);
        let endTile = this._map.gamePosToTile(this._target.position);
        endTile = this._map.getPassableTileEx(endTile);

        if (starTile && endTile && (starTile.x != endTile.x || starTile.y != endTile.y)) {

            let checkList = this._map.getCheckList();   //检查列表
            let openList = [];                          //待判断列表
            let closeList = [];                         //关闭列表

            let endItem = this.getEndItem(starTile,endTile,checkList,openList,closeList);
            
            if (endItem) {
                let walkPaths = [];
                while(endItem){
                    walkPaths.unshift(endItem);
                    endItem = endItem.father;
                }
                
                this._walkPaths = walkPaths;
            }
            checkList = {};
            openList = closeList = [];
        }
    }

    getEndItem(starTile,endTile,checkList,openList,closeList){
        let starItem = this.getCheckItem(starTile.x, starTile.y, checkList);
        this.addToList(starItem,openList);

        while(openList.length > 0){
            let checkItem = openList.shift();     //返回第一个值(第一个值肯定最小)
            this.addToList(checkItem,closeList);  //加入关闭列表
            // cc.log(checkItem.x, checkItem.y);
            
            // checkItem所在位置/目标位置小于攻击半径 且 他们之前没有障碍物,说明已经找到了最终的位置
            if (endTile.x == checkItem.x && endTile.y == checkItem.y) {
                return checkItem;
            }
            else{
                //把周围的加进来
                let newItems = [];
                for (let x = -1; x <= 1; x++){
                    for (let y = -1; y <= 1; y++){
                        let newx = checkItem.x+x;
                        let newy = checkItem.y+y;
                        if (x != 0 || y != 0) {
                            newItems.push({x:newx,y:newy});
                        }
                    }
                }

                for (let i = 0; i < 10; i++) {
                    let index = Math.floor(Math.random()*newItems.length);
                    let item = newItems.splice(index,1);
                    newItems.push(item[0]);
                }

                for (let i = 0; i < newItems.length; i++) {
                    let newx = newItems[i].x;
                    let newy = newItems[i].y;
                    let newItem = this.getCheckItem(newx, newy, checkList);
                    if (newItem) {
                        let passableItem = checkItem.passable[newx + "_" + newy];
                        if (passableItem) {
                            // newItem.G = ((x==0||y==0) ? 10 : 14) + checkItem.G;
                            // newItem.H = Math.sqrt((endTile.x-newItem.x)*(endTile.x-newItem.x)*100 + (endTile.y-newItem.y)*(endTile.y-newItem.y)*100);
                            newItem.father = checkItem;
                            this.addToList(newItem,openList);
                            this.sortOpenList(openList);
                        }
                        else{
                            checkList[newItem.x,newItem.y] = newItem;
                        }
                    }
                    
                }
            }

            if (openList.length == 0) {
                // cc.log("no find path ,return ",checkItem.x,checkItem.y);
                return checkItem;
            }
        }

        return null;
    }

    //在列表中拿出指定item
    getCheckItem (x,y,list) {
        let item = list[x + "_" + y];
        delete list[x + "_" + y];

        return item;
    }

    //在列表中拿出指定item
    getItem (x,y,list) {
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            if (item.x == x && item.y == y) {
                list.splice(i,1);
                return item;
            }
        }
        return null;
    }

    //对Open列表排序,G+H最小的拍在前面
    sortOpenList(list){
        function sortNumber(a, b)
        {
            return (a.G+a.H) - (b.G+b.H);
        }
        list.sort(sortNumber);
    }

    // 添加item到列表
    addToList(item,list){
        list.push(item);
    }

    ///////////////////// A* /////////////////////

    update(dt) {
        
        if (this._map._pause) return;

        this._codeTime -= dt;
        if (this._target && cc.isValid(this._target)) {
            let fromPos = cc.v2(this.node.position);
            let targetPos = cc.v2(this._target.position);
            let len = targetPos.sub(fromPos).mag()
            if (this._walkPaths.length > 0) {
                if (this._willPos == null) {
                    
                    //检测是否遇到目标
                    if (len <= this._config.AttackRadius && this._map.isHaveOtherEnemy(this.node) == false && this._map.lineLinePassColliders(fromPos,targetPos) == false) {
                        //遇到目标,停下,清空还没有走的路径
                        this._resetCodeTime();
                        this.node.stopAllActions();
                        this._walkPaths = [];
                    }
                    else{
                        //没有遇到目标,继续前进
                        let walkItem = this._walkPaths[0];
                        this._willPos = this._map.tileToGamePos(cc.v2(walkItem.x, walkItem.y));
                        
                        if (this._willPos.equals(fromPos)) {
                            this._walkPaths.shift();
                            this._willPos = null;
                        }
                        else{
                            this._dir = this._willPos.sub(fromPos).normalize();
    
                            let time = this._willPos.sub(fromPos).mag()/this._config.Speed;
                            let self = this;
                            this.node.runAction(cc.sequence(
                                cc.moveTo(time/60,this._willPos),
                                cc.callFunc(function(){
                                    // cc.log("走完了一节 ",walkItem.x,walkItem.y);
                                    self._walkPaths.shift();
                                    self._willPos = null;
                                })
                            ));
                        }
                        
                    }

                }
            }
            else{
                if (this._codeTime <= 0) {
                    this._resetCodeTime();
                    //检测是否遇到目标
                    if (len <= this._config.AttackRadius && this._map.lineLinePassColliders(fromPos,targetPos) == false) {
                        //遇到目标,什么都不做,停在原地
                        // this._dir = targetPos.sub(fromPos).normalize();
                    }
                    else{
                        //没有遇到目标,重新寻路
                        let _startTime = (new Date()).valueOf();
                        this.findPath(_startTime);
                        // if (this._walkPaths.length == 0) {
                        //     this._dir = targetPos.sub(fromPos).normalize();
                        // }
                        let _endTime = (new Date()).valueOf();
                        let cost = _endTime - _startTime;
                        // cc.log("+coste time ",cost);
                    }
                }
            }
            
            //计算炮管方向
            if (this._tankType == 12) {
                this._barrelDir = Utils.vectorsRotateDegress(this._barrelDir,0.2);
            }
            else{
                this._barrelDir = targetPos.sub(fromPos).normalize();
            }

            if (this._dir.x == 0 && this._dir.y == 0) {
                let a= 1;
            }
            this._refreshAngle();

            //射击
            if (len <= this._config.AttackRadius) {
                this.shooting(dt);
            }
        } 
        
        this.node.zIndex = this._map.judgezIndex(this.node.y);
    }  

    //射击
    shooting(dt){
        this._bulletCodeTime += dt;
        if (this._bulletCodeTime >= this._config.BulletCodeTime) {
            this._bulletCodeTime = 0;
            
            //创建子弹
            Bullet.createBulletEx(this._config.BType1,this.node.position,this._barrelDir,this._fire._lyBarrel.height,this._config.AttackRadius,this._atk,this._camp,this.node.parent,this._map);
        }
    }

    //执行死亡
    doDeath(){
        super.doDeath();
        
        yyp.eventCenter.emit('add-coin',{count:this._config.Coin,position:Utils.getWorldPosition(this.node)});
        this._map.deleteEnemy(this.node);
        this.node.destroy(); 
    }
}
