const WebSocket = require('ws');



const wss= new WebSocket.Server({port:8080});
console.log('WebSocket server is running on ws://localhost:8080');
const clients = new Set(); 

wss.on('connection',(ws)=>{
    clients.add(ws);
    console.log('New client conneceted');
    ws.send(JSON.stringify({ type: 'system', text: 'welcome to the server' }))
   


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