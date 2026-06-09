const WebSocket = require('ws');

const http = require('http');
const fs = require('fs');
const os = require('os');
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

const server = http.createServer((req, res) => {
     
    if(req.url=="/"){
        res.writeHead(200,{'Content-Type':'text/html'});
        res.write(fs.readFileSync('index.html'));
        res.end();
    }else if(req.url=="/admin"){
        res.writeHead(200,{'Content-Type':'text/html'});
        let html = fs.readFileSync('admin.html').toString();
        html = html.replace("__LAN_IP__",LAN_IP);
        res.write(html);
        res.end();
    }
    else{
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Invalid Request!');
    }
    
    // req.url 是什麼？('/'、'/sender.html'…)
    // 讀對應的檔，res.end(檔案內容) 吐回去
    // 設好 Content-Type，找不到就回 404
});
server.listen(8080, () => {
    console.log(`...running on http://${LAN_IP}:8080`);
  });
const wss= new WebSocket.Server({server});

const clients = new Set(); 

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
wss.on('connection',(ws)=>{
    clients.add(ws);
    ws.isAlive = true;
    console.log('New client conneceted');
    ws.send(JSON.stringify({ type: 'system', text: 'welcome to the server' }))
    ws.on('pong', () => {
        ws.isAlive = true;
    });


    ws.on('message',(message)=>{
        console.log(`Received: ${message}`);
        const text = message.toString()
        
        for (const client of clients){
            try{
                client.send(text);
            }catch(error){
                console.log(`error message${error}`)
            }

        }

        
       
    });
    


    ws.on('close',()=>{
        console.log('client disconnected')
        clients.delete(ws);
    })

});
wss.on('close',()=>{
    clearInterval(interval);
})
