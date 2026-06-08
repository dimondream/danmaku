const WebSocket = require('ws');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
let ws
let retryCount = 0;
connection();

// Connect to the WebSocket server
function connection(){
  ws = new WebSocket('ws://localhost:8080');

  // Connection opened
  ws.on('open', () => {
    
    console.log('Connected to the WebSocket server');
    retryCount = 0;
    promptForMessage();
  });

  // Listen for messages from the server
  ws.on('message', (message) => {
    console.log(`Server: ${message}`);
    
  });
  ws.on('ping', () => {
    console.log('收到伺服器 Ping');
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Handle connection close
  ws.on('close', () => {
    console.log('Disconnected from the server');
    

    // Run every 1 second (1000 ms)
    
      
      // Stop the retry after reaching 5
    if (retryCount >= 5) {
        
      console.log("Give up on reconnecting");
      return;
    }
    retryCount++;
    console.log(`Try to connect: ${retryCount}`);
    setTimeout(connection, 3000);
    

    
  });
}


// Function to prompt user for messages
function promptForMessage() {
  rl.question('Enter a message (or "exit" to quit): ', (message) => {
    if (message.toLowerCase() === 'exit') {
      ws.close();
      rl.close();
      return;
    }
  const messageJson = {
    type: 'danmaku',
    text: message,
    size: 'medium',         // 之後可以給 user 選
    color: 'white'          // 之後可以給 user 選
  }
    ws.send(JSON.stringify(messageJson));
    promptForMessage();
  });
}