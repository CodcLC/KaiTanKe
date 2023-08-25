var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' + // attribute variable
  'attribute vec2 a_TextCoord;\n' + // attribute variable
  'varying vec2 v_TexCoord;\n' + // attribute variable
  'void main() {\n' +
  '  gl_Position = a_Position;\n' + // Set the vertex coordinates of the point
  '  v_TexCoord = a_TextCoord;\n' + // Set the vertex coordinates of the point
  '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform sampler2D u_Sampler;\n' +  // uniform変数
  'varying vec2 v_TexCoord;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler,v_TexCoord);\n' +
  '}\n';

//初始化着色器
function initShaders(gl, vshader, fshader) {
  var program = createProgram(gl, vshader, fshader);
  if (!program) {
    console.log('Failed to create program');
    return false;
  }

  gl.useProgram(program);
  gl.program = program;

  return true;
}
//创建gl,shader链接
function createProgram(gl, vshader, fshader) {
  // Create shader object
  var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  // Create a program object
  var program = gl.createProgram();
  if (!program) {
    return null;
  }

  // Attach the shader objects
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // Link the program object
  gl.linkProgram(program);

  // Check the result of linking
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    var error = gl.getProgramInfoLog(program);
    console.log('Failed to link program: ' + error);
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  return program;
}

//加载shader
function loadShader(gl, type, source) {
  // Create shader object
  var shader = gl.createShader(type);
  if (shader == null) {
    console.log('unable to create shader');
    return null;
  }

  // Set the shader program
  gl.shaderSource(shader, source);

  // Compile the shader
  gl.compileShader(shader);

  // Check the result of compilation
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    var error = gl.getShaderInfoLog(shader);
    console.log('Failed to compile shader: ' + error);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}


function initBuffers(gl, canvas, image) {
    console.log(canvas.width);
    console.log(canvas.height);
    console.log(image.width);
    console.log(image.height);
    var wRate = image.width/canvas.width;
    var hRate = (image.height/canvas.height)/wRate;
    console.log(wRate);
    console.log(hRate);
    
    //顶点坐标和图片坐标
    var vertices = new Float32Array([
        -1.0,  hRate,  0.0, 1.0,//左上角
        -1.0, -hRate,  0.0, 0.0,//左下角
         1.0,  hRate,  1.0, 1.0,//右上角
         1.0, -hRate,  1.0, 0.0 //右下角
    ])
    var n = 4;//点的个数
    //创建缓冲区对象
    var vertexBuffer = gl.createBuffer();

    //将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    //向缓冲区写入数据
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);

    var FSIZE = vertices.BYTES_PER_ELEMENT;

    //获取坐标点
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*4, 0);
    //连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    //获取Color坐标点
    var a_TextCoord = gl.getAttribLocation(gl.program, "a_TextCoord");
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_TextCoord, 2, gl.FLOAT, false, FSIZE*4, FSIZE*2);
    //连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_TextCoord);
    return n;
}

function loadTexture(gl, canvas, image){
    initBuffers(gl,canvas,image);

    //创建纹理对象
    var texture = gl.createTexture();

    //1.对纹理图像进行Y轴反转
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    //2.开启0号纹理单元
    gl.activeTexture(gl.TEXTURE0);
    //3.向target绑定纹理对象
    gl.bindTexture(gl.TEXTURE_2D, texture);

    //4.配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	
    //5.配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    //6.将0号纹理图像传递给着色器
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    gl.uniform1i(u_Sampler, 0);
    // 清空 <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    //绘制矩形
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

}

//加载图片
function loadImage(gl, canvas, imgPath){
    //创建image对象
    var image = wx.createImage();
    //加载纹理
    image.onload = function(){
        loadTexture(gl, canvas, image); 
    };
    // 浏览器开始加载图片 注意：一定是2^mx2^n尺寸的图片
    image.src = imgPath;

    return true;
}

// function drawImg(imgPath) {
    
// 	var canvas = wx.__first__canvas;
  
// 	// 获取WebGL渲染上下文
// 	var gl = canvas.getContext('webgl');

//     //初始化着色器
//     initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

//     //用指定颜色填充webgl容器，就是设置背景
//     gl.clearColor(0.4, 0.5, 0.0, 1.0);
  
//     loadImage(gl,canvas,imgPath);
// }

// exports.drawImg = drawImg;