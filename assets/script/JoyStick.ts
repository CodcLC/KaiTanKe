import {BaseComponent} from "./base/BaseComponent";
import {Utils} from "./base/Utils";

const {ccclass, property} = cc._decorator;

@ccclass
export class JoyStick extends BaseComponent {

    _dir = cc.v2(0, 1);         //初始方向(向上)
    _touchPos = cc.v2(0, 0);    //初始位置
    _free = true;               //自由移动摇杆位置

    onLoad () {
        this._touchPos = this._fire._sprBg.position;
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    _onTouchStart(event) {
        let pos = this.node.convertToNodeSpaceAR(event.getLocation());
        this._fire._sprJoystick.setPosition(pos);
        
        if (this._free) {
            this._fire._sprBg.setPosition(pos);
            this._touchPos = pos;
        }

        // 获取当前坐标的向量
        this._dir = (pos.sub(this._touchPos)).normalize();
    }

    _onTouchMove(event) {
        let pos = this.node.convertToNodeSpaceAR(event.getLocation());
        this._fire._sprJoystick.setPosition(pos);

        // 获取当前坐标的向量
        this._dir = (pos.sub(this._touchPos)).normalize();
    }

    _onTouchEnd(event) {
        // reset
        this._fire._sprJoystick.setPosition(this._touchPos);
    }

    update (dt) {
        // 限定摇杆在范围内移动
        let len = this._fire._sprJoystick.position.sub(this._touchPos).mag();   // 返回向量的长度
        let maxLen = this._fire._sprBg.width / 2;                   // 获取最大可移动距离
        let ratio = len / maxLen;                           // 当前位置和最大可移动距离比率

        // 比率大于1,说明已经超出最大可移动距离了
        if (len > maxLen) {
            //相当于x/ratio,y/ratio
            this._fire._sprJoystick.setPosition(this._touchPos.add( this._dir.mul(maxLen) ));
            ratio = 1;
        }

        if (ratio > 0) {
            yyp.eventCenter.emit("joy-stick",{dir:this._dir, ratio:ratio});
        }
    }

    onDisable(){
        // reset
        this._fire._sprJoystick.setPosition(this._touchPos);
    }
}
