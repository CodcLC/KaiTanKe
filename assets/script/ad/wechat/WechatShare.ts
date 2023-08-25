/**
 * https://developers.weixin.qq.com/minigame/dev/api/share/wx.shareAppMessage.html
 */
export class WechatShare {

    //由于微信无法得到分享结果，所以以时间来判断是否成功。
    protected time: number = 0;
    protected callback;
    protected _list = [];

    constructor(list) {
        this._list = list

        wx.showShareMenu({
            withShareTicket: true,
        });

        wx.updateShareMenu({
            withShareTicket: true
        })
        wx.onShow(() => {
            this.backGame()
        })
        wx.onShareAppMessage(() => {
            // 用户点击了“转发”按钮
            return this._getData(0)
        })
    }

    //回调函数,分享的id
    share(func,index) {
        this.callback = func;
        // index = index ? index : Math.floor(Math.random()*this._list.length);
        
        wx.shareAppMessage(this._getData(index))
        this.time = Date.now();
    }

    //获取分享参数
    protected _getData(index): any {
        let data = {
            title: this._list[index].Title,
            imageUrl: this._list[index].ImageUrl,
            imageUrlId: this._list[index].ImageId
        }
        
        data = wx.uma['trackShare'](data);  //友盟统计
        return data;
    }



    protected backGame() {

        if (this.callback) {
            let disTime = Date.now() - this.time
            if (disTime >= 4000) {
                this.callback(true);
            } else {
                this.callback(false);
            }
            this.callback = null;
        }
    }

}
