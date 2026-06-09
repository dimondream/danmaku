Danmaku Receiver — 完整路線圖
✅ 已完成

M1: WebSocket echo server
M2: Broadcast server + 失敗隔離
M3: 網頁 sender (HTML form)
M4: Electron 視窗 (BrowserWindow + load HTML)
M4.5: Renderer 接 WebSocket、顯示訊息
M5: 透明 + 全螢幕 + 置頂 + click-through
M6: 彈幕從右往左飛(CSS animation + cleanup)
M7: Lane allocation 演算法(分軌道飛)

Phase 1: 把現有東西收尾、能 demo
M8: 體驗收尾 ✅(已完成)

加 globalShortcut (Ctrl+Shift+Q quit、可選的 toggle 穿透 Ctrl+Shift+M)
加 skipTaskbar: true、minimizable: false、focusable: false
寫 README,包含截圖跟基本使用說明

M9: 重連邏輯 + 心跳 ✅(已完成)

Renderer 在 'close' 事件後自動重連
Exponential backoff(1s, 2s, 4s, 8s, max 30s)
設最大重試次數(or 無限,看你)
心跳機制:每 30 秒互送 ping/pong,偵測殭屍連線
UI 顯示「重連中...」狀態

完成後:server 重啟、網路斷一下也不會崩。

Phase 2: LAN 多裝置(同個 WiFi)

目標:你打開 Electron app,朋友來你家,掏出手機掃 QR code,直接發彈幕到你桌面。

M10: Server 順便 serve HTML ✅(已完成)

Node http.createServer + WebSocketServer 共用同一 port
Server 同時供應 /sender.html 跟 ws://
Sender HTML 改 new WebSocket(\ws://${window.location.host}`)`(動態 URL)
測試:本機瀏覽器開 http://localhost:8080 → 載入 sender、能發訊息

M11: LAN 連線 ✅(已完成)

設定 Windows Defender 允許 Node.js 接受連線
找出自己電腦的 LAN IP (ipconfig)
從手機輸入 http://<LAN IP>:8080 測試連線
驗收:手機發訊息,電腦 Electron 視窗即時看到

M12: QR Code 體驗 ✅(已完成)

寫一個 admin.html 頁面,server 也 serve 它
動態抓 server LAN IP(可能需要 Node 端讀網卡 IP 再注入 HTML)
用 qrcode 套件畫 QR code,內容是 sender 頁面的 URL
Electron 啟動時順手打開 admin 頁面(另一個視窗或同視窗的角落)

Phase 2 完成 → 滿足 Use Case 1: 「手機發送到電腦,同個 WiFi 內任何裝置都能參加」

Phase 3: 房間概念(多群人)

目標:不同朋友群可以同時用同一台 server,彈幕互不干擾。

M13: 房間架構升級 ✅(已完成)

Server 的 state 從 clients: Set 改成 rooms: Map<roomId, Set<client>>
連線時要決定加入哪個房間(URL query param: ws://...?room=abc123)
Broadcast 範圍從「所有人」改成「同房間」
連線斷掉時要把 client 從它的房間移除
Renderer / Sender 都要支援指定房間
訊息格式可能要從純字串升級成 JSON { type, room, text, sender }

M14: 房間 URL 分享 🟢(0.5 天)

隨機產生 6-8 位英數字 room ID
Sender URL: http://<host>/sender?room=abc123
Electron / admin 頁面顯示「目前房間連結」+ QR code
朋友拿到連結 → 自動進對應房間

M15(可選): 暱稱 / 識別 🟡(0.5 天)

進房間時讓使用者輸入暱稱
訊息上顯示「<暱稱>: 訊息內容」(類似 Twitch 聊天)
用 localStorage 記住暱稱,下次自動填

Phase 3 完成 → 滿足 Use Case 2: 「朋友群之間分享房間,各自發彈幕」

Phase 4: 上雲(跨網路使用)

目標:朋友不在你 WiFi 內也能用。

M16: 雲端部署 🟡(1-2 天)

選平台:Railway(最簡單)/ Fly.io / Render
處理 environment variables(port、CORS 等)
升級 ws:// → wss://(TLS 加密,平台會自動處理)
Domain 綁定(可選,用平台預設 URL 也行)
處理 Cloudflare / CDN 對 WebSocket 的相容(通常要關閉 Cloudflare proxy 對特定 path)

M17: 上 production 的硬底功夫 🟡(視需求)

Rate limiting: 每個 IP / client 每秒最多 N 則,防灌爆
訊息長度上限: 例如 200 字
基本內容過濾(可選): bad word 黑名單
連線數監控: server 顯示目前同時在線人數
錯誤上報: 用 Sentry 之類抓 client / server crash

Phase 4 完成:這是個能放網路上跑、給陌生人用的小產品。

Phase 5: 公開網頁版本(無 Electron)

目標:不只 Electron 桌面,有人想直接在瀏覽器看也可以(像彈幕網站)。

M18: Web Receiver 🟢(1 天)

跟 Electron renderer 共用 99% code(因為 renderer 本來就是個瀏覽器頁面)
純網頁版本不能透明 / click-through,所以畫面要設計成「全螢幕、深色背景、彈幕飛過」風格
可以放進手機瀏覽器當「觀看端」
URL: https://your-domain.com/view?room=abc123
