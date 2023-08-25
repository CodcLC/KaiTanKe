"use strict";

import uma from './utils/uma.min.js';

// uma.init({
//   appKey: '5f5c7bd7b4739632429e135b',
//   useOpenid: false, // default true
//   autoGetOpenid: false,
//   debug: true
// });

// 渲染首屏（开发者工具执行有渲染问题，所以开发者工具上不渲染）
// wx.__first__canvas = wx.createCanvas();

const data = wx.getSystemInfoSync();

// if (data.platform != "devtools") {
//     const first_scene = require("./splash.js");
//     // first_scene.drawImg("splash.jpg");
// }

// 加载引擎代码写在这后面"use strict";

//require('adapter.js');	//调试模式
require('adapter-min.js');

__globalAdapter.init();

//require('cocos/cocos2d-js.js');	//调试模式
requirePlugin('cocos');

__globalAdapter.adaptEngine();

require('./ccRequire');

require('./src/settings'); // Introduce Cocos Service here

require('./main'); // TODO: move to common
// Adjust devicePixelRatio


cc.view._maxPixelRatio = 4;

if (cc.sys.platform !== cc.sys.WECHAT_GAME_SUB) {
  // Release Image objects after uploaded gl texture
  cc.macro.CLEANUP_IMAGE_CACHE = true;
} // sub context need to boot after SubContextView component enabled in main context


if (!__globalAdapter.isSubContext) {
  window.boot();
}