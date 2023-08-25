export class TTRecorderEx {

    _recorder = null;       //实例
    _recording = false;     //录屏中
    _time = 0;              //录屏时间
    _path = '';             //录屏地址
    _recorderType = 0;      //0 空闲 1 正在录制 2 暂停中

    constructor() {
        this._recorder = tt.getGameRecorderManager();
        
        let self = this;
        this._recorder.onStart((res) => {
            console.log('onStart');
            console.log(JSON.stringify(res));
            
            self._recorderType = 1;
            self._time = 0;
            self._path = '';
        });

        this._recorder.onStop((res) => {
            console.log('onStop');
            console.log(JSON.stringify(res));
            self._recorderType = 0;
            self._path = res.videoPath;
        });

        this._recorder.onPause((res) => {
            console.log('onPause');
            console.log(JSON.stringify(res));
            self._recorderType = 2;
        });
        this._recorder.onResume((res) => {
            console.log('onResume');
            console.log(JSON.stringify(res));
            self._recorderType = 1;
        });
        
        this._recorder.onInterruptionBegin((res) => {
            console.log('onInterruptionBegin');
            console.log(JSON.stringify(res));
            // self._recorderType = 1;
        });
        this._recorder.onInterruptionEnd((res) => {
            console.log('onInterruptionEnd');
            console.log(JSON.stringify(res));
            // self._recorderType = 1;
        });
        
        this._recorder.onError((res) => {
            console.log('onError');
            console.log(JSON.stringify(res));
            
            self._recording = false;
            self._recorderType = 0;
            self._time = 0;
            self._path = '';
        });
    }

    //开始录屏
    start(){
        if (this._recording == false) {
            this._recording = true;
            this._recorder.start({duration: 300});
        }
    }

    //结束录屏
    stop(){
        if (this._recording) {
            this._recording = false;
            this._recorder.stop();

            cc.log(this._time,this._path)
        }
    }

    //暂停
    pause(){
        if (this._recording) {
            this._recorder.pause();
        }
    }

    //恢复
    resume(){
        if (this._recording) {
            this._recorder.resume();
        }
    }
    
    //裁剪
    clip(){
        // if (this._recorder) {
            let self = this;
            this._recorder.clipVideo({
                path: self._path,
                success(res) {
                  // 由开始5秒 +最后10秒 拼接合成的视频
                  console.log('clip ' + res.videoPath);
                },
                fail(e) {
                  console.error('clip ' + e);
                },
              });
        // }
    }
    
    //分享视频
    shareVideo(callback){
        if (this._path != '') {
            let data = {
                channel: "video",
                title: "快来和我一起玩耍",
                desc: "快来和我一起玩耍",
                imageUrl: "",
                templateId: "", // 替换成通过审核的分享ID
                query: "",
                extra: {
                  videoPath: this._path, // 可替换成录屏得到的视频地址
                //   videoTopics: ["话题1", "话题2"], //该字段已经被hashtag_list代替，为保证兼容性，建议两个都填写。
                //   hashtag_list: ["话题1", "话题2"],
                //   video_title: "我和XXX 一起合唱了，好听吗？", //生成的默认内容
                },
                success(res) {
                    console.log("分享视频成功 ",JSON.stringify(res));
                    if (callback) {
                        callback(true);
                    }
                },
                fail(e) {
                    console.log("分享视频失败 ",JSON.stringify(e));
                    callback(false);
                    
                    tt.showToast({
                        title: "分享失败"
                    });
                },
              };
            //   console.log(JSON.stringify(data))
            tt.shareAppMessage(data);
        }
    }
}
