const WebSocket = require('ws');

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
function getIp(){
    const nets = os.networkInterfaces();
    for (const net in nets){
        for(const name of nets[net]){
            if ( name.family=="IPv4"&&name.internal==false ) {
                  return name.address;
              }
        }
    }
    return "127.0.0.1";

}
console.log( getIp());
const LAN_IP= getIp();
function generateRoomId(){
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    let count = 0;
    // TODO: 跑 6 次迴圈,每次從 chars 隨機抓一個字接到 id
    //       隨機 index 怎麼算? Math.floor(Math.random() * chars.length)
    while(count < 6){
        id+=chars[Math.floor(Math.random() * chars.length)];
        count++;
    }

    return id;
}
const roomId = generateRoomId();

const server = http.createServer((req, res) => {
    const baseUrl = new URL(req.url,'http://'+req.headers.host);
    if(baseUrl.pathname=="/"||baseUrl.pathname=="/sender"){
        res.writeHead(200,{'Content-Type':'text/html'});
        res.write(fs.readFileSync(path.join(__dirname, 'index.html')));
        res.end();      
    }else if(baseUrl.pathname=="/admin"){
        res.writeHead(200,{'Content-Type':'text/html'});
        let html = fs.readFileSync(path.join(__dirname, 'admin.html')).toString();
        html = html.replace(/__LAN_IP__/g,LAN_IP);
        html = html.replace(/__roomId__/g, roomId);
        res.write(html);
        res.end();
    }else if(baseUrl.pathname=="/room"){
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify({ room: roomId }));
      res.end()
      // TODO: 把 { room: ROOM_ID } 這個物件轉成 JSON 字串,用 res.end() 吐回去
      //       物件轉 JSON 字串的函式是哪個?(前面 sender 那邊 socket.send 也用過)
    }
    else{
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Invalid Request!');
    }
    
    // req.url 是什麼？('/'、'/sender.html'…)
    // 讀對應的檔，res.end(檔案內容) 吐回去
    // 設好 Content-Type，找不到就回 404
});
server.listen(process.env.PORT||8080, () => {
    console.log(`...running on http://${LAN_IP}:${process.env.PORT||8080}/sender?room=${roomId}`);
  });
const wss= new WebSocket.Server({server});

const clients = new Map(); 

const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            // 如果上次發送 ping 後，直到現在都沒收到 pong，代表連線已死
            if (ws.isAlive === false) {
                console.log('偵測到死連線，主動斷開');
                return ws.terminate(); 
            }

            // 先假設連線已死，並發送 ping 待客戶端回應 pong 來翻轉狀態
            ws.isAlive = false;
            ws.ping();
            
        });
    }, 30000);
wss.on('connection',(ws,req)=>{

    const url = new URL(req.url, 'http://'+req.headers.host);
    const searchParam = url.searchParams;
    const room = searchParam.get("room")||"landing";
    if(!clients.has(room)){
        clients.set(room,new Set());
    }
    clients.get(room).add(ws);
    ws.room=room
    ws.isAlive = true;
    console.log('New client conneceted');
    ws.send(JSON.stringify({ type: 'system', text: 'welcome to the server' }))
    ws.on('pong', () => {
        ws.isAlive = true;
    });


    ws.on('message',(message)=>{
        console.log(`Received: ${message}`);
        const text = message.toString();
        const roomSet = clients.get(ws.room);
        
        for (const socket of roomSet){
            try{
                socket.send(text);
            }catch(error){
                console.log(`error message${error}`)
            }
            
            
        }

        
       
    });
    


    ws.on('close',()=>{
        if(clients.has(room)){
            clients.get(room).delete(ws);
            if(clients.get(room).size==0){
                clients.delete(room);
            }
        }
        console.log('client disconnected')
        
    })

});
wss.on('close',()=>{
    clearInterval(interval);
})
