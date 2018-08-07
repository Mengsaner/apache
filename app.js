//获取请求用户ip地址
function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};
// 引包
const fs=require("fs");
const http=require("http");
const path=require("path");
const mime=require("mime");
let rootPath=path.join(__dirname,"www")
//创建并开启服务器
http.createServer((req,rep)=>{
    //获取用户访问路径
    let targetPath=path.join(rootPath,req.url)
    // 获取请求用户ip地址函数调用
    console.log(getClientIp(req));
    //判断路径是否存在
    
    if(fs.existsSync(targetPath)){
        //文件系统命令，与文件有关
        fs.stat(targetPath,(err,stats)=>{
            // console.log(stats.isFile());
            //调用文件系统中的方法，判断存在的路径指向的是文件还是文件夹
            if(stats.isFile()){
                //是文件就把文件读取出来
                fs.readFile(targetPath,(err,data)=>{
                    //给所有请求文件(用户访问路径所对应的文件)添加对应的响应头，告诉浏览器用什么解析文件
                    rep.setHeader("content-type",mime.getType(targetPath))
                    //把读取到的文件作为响应体返回
                    rep.end(data)
                })  
            }else{
                //不是文件即为文件夹，把文件夹中的文件列出来
                //读取文件夹(读取出来的files为一个数组))
                fs.readdir(targetPath,(err,files)=>{
                    //声明一个变量，便于字符串拼接
                    let str="";
                    //遍历files
                    for(let i=0;i<files.length;i++){
                        //循环添加模板字符串（并挖坑填数据）//解决a标签点击问题(req.url为用户请求的路径，files[i]为该路径下的文件) //下一步解决h1标签的内容
                        str+=`<li><a href="${req.url}${req.url=="/"?"":"/"}${files[i]}">${files[i]}</a></li>`
                    }
                     //返回响应体(继续以模板字符串的形式填写，挖坑填数据)
                        rep.end(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <meta http-equiv="X-UA-Compatible" content="ie=edge">
                            <title>apache</title>
                        </head>
                        <body>
                            <h1>index of ${req.url}</h1>
                            <ul>
                                ${str}
                            </ul>
                        </body>
                        </html>
                    `)
                })   
            }
        }) 
    }else{
        //设置响应状态码(否则就算请求失败也会出现200成功代码)
        rep.statusCode=404;
        //设置响应头
        rep.setHeader("content-type","text/html;charset=utf-8")
        //设置响应体
        rep.end(`
            <!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
            <html><head>
            <title>404 Not Found</title>
            </head><body>
            <h1>404 Not Found</h1>
            <p>你请求的页面不在服务器，请检查后重试！或者跟我唱：这是一片很寂寞的天，下着有些伤心的雨。可能过一会就好了！</p>
            </body></html>   
        `)
    }  
}).listen("1000","10.254.3.189",()=>console.log("10.254.3.189:1000开启成功"));

