import {BaseComponent} from "./base/BaseComponent";
import {Utils} from "./base/Utils";
import {LocalizedData} from "./base/LocalizedData";

const {ccclass, property} = cc._decorator;

//私有函数,请使用'_'开头
//请修改'NewClass' => 自己的类名
@ccclass
export class Bullet extends BaseComponent {

    _bulletType     = 1;            //子弹类型
    _bulletLevel    = 1;            //子弹等级
    _map            = null;         //tile map 节点
    _dir            = cc.v2(1,0);   //当前行进方向
    _speed          = 5;
    _gunshot        = 10;           //射程
    _damage         = 0;            //攻击力
    _destroyTime    = -1;           //销毁时间
    _camp           = "";           //阵营(player/enemy)
    _inGame         = false;

    _currenBullet   = null;
    _isStop         = false;

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
        this._fire._sprBoom.active = false;
        this._fire._sprBoom.opacity = 0;
        this._fire._sprBoom.scale = 0;
    }

    //初始化事件
    _initEvent() {
    }

    //销毁事件
    _destroyEvent() {
    }

    //初始化子弹(方向/射程/伤害值/速度/阵营/当前关卡)
    initBullet(dir,gunshot,atk,speed,camp,levelId){
        this._dir = dir;
        this._gunshot = gunshot;
        this._speed = speed;
        this._damage = atk;
        this._camp = camp;
        this._destroyTime = this._gunshot/this._speed/60;
        
        //子弹类型
        if (camp == "enemy") {
            this._bulletType = 0;
            this._bulletLevel = levelId;
        }
        else{
            this._bulletType = LocalizedData.getIntItem("_current_bullet_type_",1);
            this._bulletLevel = LocalizedData.getIntItem(`_bullet_${this._bulletType}_`,1);
        }

        //子弹杀害加成
        let config = yyp.config.Bullet[this._bulletType];
        this._damage += config.ATK*(this._bulletLevel+1);

        this._inGame = true;
        this.setBulletType(this._bulletType);
    }

    setBulletType(type){
        this._bulletType = type;

        //子弹
        this.node.children.forEach((child) => {
            if (child.name != "_sprBullet" + this._bulletType) {
                child.active = false;
            }
            else{
                child.active = true;
                this._currenBullet = child;
            }
        });
        
        //调整子弹角度
        if (this._inGame){
            this.node.angle = Utils.vectorsToDegress(this._dir)-90;
        }
    }

    //设置tiled map
    setMap(map) {
        this._map = map;
    }

    start(){

    }

    //每帧调用
    update (dt) {
        if (this._inGame == true && this._isStop == false) {
            if (this._destroyTime != -1) {
                this._destroyTime -= dt;
                
                if (this._destroyTime <= 0) {
                    //销毁
                    this.doDestroy();
                }
                else{
                    //更新位置
                    let currPosition = this.node.position;
                    let willPosition = currPosition.add(cc.v3(this._dir.mul(this._speed)));
                    this.node.setPosition(willPosition);
                    
                    if (this._map.isMap()) {
                        //子弹和坦克检测
                        let hitTank = this._map.bulletEnemyCollisionTest(willPosition,this._camp);
                        if (hitTank) {
                            //击中坦克
                            hitTank.script.beHit(this._damage);
                            //销毁
                            this.doDestroy();
                        }
                        else{
                            //子弹和障碍物检测
                            if (this._map.bulletObstacleCollisionTest(currPosition,willPosition)){
                                //销毁
                                this.doDestroy();
                            }
                        }
                    }
                }
            }
        }
    }

    //销毁
    doDestroy(){
        this._isStop = true;
        this._currenBullet.active = false;
        this._fire._sprBoom.active = true;
        //爆炸动画
        let self = this;
        this._fire._sprBoom.runAction(cc.sequence(
            cc.spawn(
                cc.fadeIn(0.2),
                cc.scaleTo(0.2,0.5,0.5)
            ),
            cc.callFunc(function(){
                //销毁
                self.node.destroy();
            })
        ));
    }
   
    
    
    //创建子弹
    static createBullet(pos,dir,gunshot,atk,speed,camp,parentNode,map){
        speed = (camp == "enemy") ? speed*0.8 : speed;

        let bullet = cc.instantiate(map.bulletPrefab);
        bullet.parent = parentNode;
        bullet.position = pos;
        bullet.zIndex = 5000;
        bullet.script.initBullet(dir,gunshot,atk,speed,camp,map._levelId);
        bullet.script.setMap(map);

        return bullet;
    }


    //创建子弹(类型/位置/方向/炮管长度/射程/攻击力/目标阵营)
    static createBulletEx(bulletType,pos,dir,wipeLen,gunshot,atk,camp,parentNode,map){
        gunshot = gunshot - wipeLen;
        let bdir = dir;
        let bpos = pos;
        let bullet = null;

        switch(bulletType){
            case 1:{
                bdir = bdir;
                bpos = cc.v2(pos).add(bdir.mul(wipeLen));
                bullet = Bullet.createBullet(bpos,bdir,gunshot,atk,8,camp,parentNode,map);

                break;
            }
            case 2:{
                for (let i = 0; i <= 1; i++) {
                    bdir = Utils.vectorsRotateDegress(dir,i*5 - 2.5);
                    bpos = cc.v2(pos).add(bdir.mul(wipeLen));
                    bullet = Bullet.createBullet(bpos,bdir,gunshot,atk,8,camp,parentNode,map);
                }
                break;
            }
            case 3:{
                for (let i = 0; i <= 2; i++) {
                    bdir = Utils.vectorsRotateDegress(dir,i*5 - 5);
                    bpos = cc.v2(pos).add(bdir.mul(wipeLen));
                    bullet = Bullet.createBullet(bpos,bdir,gunshot,atk,8,camp,parentNode,map);
                }
                break;
            }
            case 4:{
                for (let i = 0; i <= 3; i++) {
                    bdir = Utils.vectorsRotateDegress(dir,i*5 - 7.5);
                    bpos = cc.v2(pos).add(bdir.mul(wipeLen));
                    bullet = Bullet.createBullet(bpos,bdir,gunshot,atk,8,camp,parentNode,map);
                }
                break;
            }
            case 5:{
                for (let i = 0; i <= 5; i++) {
                    bdir = Utils.vectorsRotateDegress(dir,i*5 - 12.5);
                    bpos = cc.v2(pos).add(bdir.mul(wipeLen));
                    bullet = Bullet.createBullet(bpos,bdir,gunshot,atk,8,camp,parentNode,map);
                }
                break;
            }
            case 11:{
                for (let i = 0; i <= 3; i++) {
                    bdir = Utils.vectorsRotateDegress(dir,i*90);
                    bpos = cc.v2(pos).add(bdir.mul(wipeLen));
                    bullet = Bullet.createBullet(bpos,bdir,gunshot,atk,3,camp,parentNode,map);
                }
                break;
            }
            case 12:{
                for (let i = 0; i < 10; i++) {
                    bdir = Utils.vectorsRotateDegress(dir,36*i);
                    bpos = cc.v2(pos).add(bdir.mul(wipeLen));
                    bullet = Bullet.createBullet(bpos,bdir,gunshot,atk,1.5,camp,parentNode,map);
                }
                break;
            }
        }
    }

}
