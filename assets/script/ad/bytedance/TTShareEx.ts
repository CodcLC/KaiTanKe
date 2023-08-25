export class TTShareEx {

    protected _list = [];

    constructor(list) {
        this._list = list

        tt.showShareMenu({
            withShareTicket: true,
        });
        tt.updateShareMenu({
            withShareTicket: true
        })

        let self = this;
        tt.onShareAppMessage(function (res) {
            console.log(res.channel);

            return {
                desc: self._list[0].Title,
                imageUrl: self._list[0].ImageUrl,
                title: '分享有礼',
                imageUrlId: '',
                success: () => {
                    console.log('onShareAppMessage 分享成功');
                },
                fail: (e) => {
                    console.log('分享失败', e);
                }
            }
        })

    }

    share(func,index) {
        console.log('TTShareEx showa ', index);
        // index = index ? index : Math.floor(Math.random()*this._list.length);
        console.log('TTShareEx showb ', index);

        tt.shareAppMessage({
            desc: this._list[index].Title,
            imageUrl: this._list[index].ImageUrl,
            title: '分享有礼',
            imageUrlId: '',
            success: (ret) => {
                console.log('TTShareEx 分享成功 ',JSON.stringify(ret));
                if (func) {
                    func(true);     //字节开发者工具返回结果不准确,要是用真机调试
                }
            },
            fail: (e) => {
                console.log('TTShareEx 分享失败 ',JSON.stringify(e));
                if (func) {
                    func(false);
                }
            }

        })
        
    }

}
