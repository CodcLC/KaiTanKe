const {ccclass, property} = cc._decorator;

@ccclass
export class MusicManager extends cc.Component {
    static _startLoad = false;
    static _loadIndex = 0;
    static _loadList = [];

    //初始化
    static initConfig() {
        if (MusicManager._startLoad == false) {
            MusicManager._startLoad = true;

            //获取key
            MusicManager._loadList = [];
            for (const key in yyp.config.Music) {
                if (yyp.config.Music.hasOwnProperty(key)) {
                    const element = yyp.config.Music[key];
                    MusicManager._loadList.push(key);
                }
            }

            //预加载音效
            MusicManager._preload();
        }
    }

    //预加载音效
    static _preload() {
        let effectKey = MusicManager._loadList[MusicManager._loadIndex];
        // cc.log("_preload ",effectKey);
        let onResourceLoaded = function(err, content)
        {
            MusicManager._loadIndex += 1;
            // cc.log("_preload ",effectKey,"finish");
            
            if(content instanceof cc.AudioClip) { 
                const element = yyp.config.Music[effectKey];
                element["content"] = content;
                if(element.PlayOnload == 1){
                    MusicManager.playMusic(effectKey);
                }
            }
            if (MusicManager._loadIndex >= MusicManager._loadList.length) {
                // cc.log("_preload complete ",(new Date()).valueOf());
            }
            else{
                MusicManager._preload();
            }
        };

        cc.resources.load("sfx/" + effectKey, cc.AudioClip, onResourceLoaded);
    }
    

    //播放背景音乐
    static playMusic(key) {
        const element = yyp.config.Music[key];
        if (element && element["content"]) {
            cc.audioEngine.playMusic(element["content"], true);
        }
    }
    
    //播放音效
    static playEffect(key) {
        const element = yyp.config.Music[key];
        if (element && element["content"]) {
            cc.audioEngine.playEffect(element["content"], false);
        }
    }
}
