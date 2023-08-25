
export class AdmobShare {

    //由于微信无法得到分享结果，所以以时间来判断是否成功。
    protected time: number = 0;
    protected callback;
    protected _list = [];

    constructor(list) {
        this._list = list;
        let self = this;

        console.log('AndroidShare ' + JSON.stringify(this._list));

        //注册回调函数
        let AndroidShare = {
            shared : function(ret){
                console.log("AndroidShare js1 ",ret);
                if (self.callback) {
                    console.log("AndroidShare js2 ",ret);
                    self.callback(ret);
                }
            }
        }
        window["AndroidShareJs"]=AndroidShare;
    }

    //回调函数,分享的id
    share(func,index,arg) {
        this.callback = func;
        
        let config = this._list[index];
        let msg = config.Title;
        let url = config.ImageUrl;
        if (config.UseArg == 1) {
            msg = msg.replace("{0}",arg);
        }

        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "doShare", "(Ljava/lang/String;Ljava/lang/String;)V",msg,url);
    }


}
