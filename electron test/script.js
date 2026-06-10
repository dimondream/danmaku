const status = document.getElementById('status');
const root=document.documentElement;
const laneHeight=parseInt(getComputedStyle(root).getPropertyValue('--lane-height'),10);
const NUM_LANES = Math.floor(window.innerHeight / laneHeight);
const occupied = Array(NUM_LANES).fill(0);
const cooldown = 3000

fetch('http://localhost:8080/room')
  .then(response => {
    // 將回應轉為 JSON 格式
     return response.json(); 
  }).then(data=>{
    connect(data.room);
  }).catch(error => {
    // 捕捉前面任何一個步驟發生的錯誤
    console.error("發生錯誤：", error);
    connect("landing");
  });

function connect(room){
    const socket = new WebSocket(`ws://localhost:8080/?room=${room}`);

    socket.addEventListener('open',()=>{
        console.log('connection established');
        status.textContent='Connected to server';
        status.style.color='green';
        
    })
    socket.addEventListener('message',(event)=>{

        

        let message
        try {
            message = JSON.parse(event.data)
        } catch (err) {
            // 收到非 JSON(例如 welcome 字串),忽略或當作純文字
            console.warn('Non-JSON message:', event.data)
            return
        }
        if (message.type !== 'danmaku') return

        

        const now = Date.now();
        let chosenLane = -1
        for (let i = 0; i < NUM_LANES; i++) {
            if (occupied[i] <= now) {
                chosenLane = i
                break
            }
        }
        if (chosenLane === -1) {
            chosenLane = occupied.indexOf(Math.min(...occupied))
        }
        
        occupied[chosenLane] = now + cooldown
        // 統一在這裡更新一次
        console.log('danmaku:', message.text, 'size:', message.size)
        const p = document.createElement("p");
        p.textContent = message.text;
        p.classList.add('danmaku', message.size)
        if (message.color) p.style.color = message.color

        
        
        p.style.top= ((chosenLane) * laneHeight) + 'px';

        
        
        document.getElementById("message").append(p);

        p.addEventListener('animationend', () => {
        p.remove();  // 從 DOM 移除自己
        });
    })
    socket.addEventListener('close',()=>{
        status.textContent = 'Disconnected from server';
        status.style.color = 'red';
    })
    socket.addEventListener('error',(error)=>{
        console.log(error)
    })
}