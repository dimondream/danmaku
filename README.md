# Danmaku Overlay 桌面彈幕

把彈幕（飛過螢幕的留言）顯示在桌面最上層的小專案。一個 WebSocket server 負責廣播訊息，一個透明的 Electron 視窗把收到的彈幕從右往左飛過你的整個桌面 — 不擋滑鼠、不擋鍵盤、永遠置頂。

> 這是一個邊做邊學的專案，從零手刻 WebSocket、Electron、彈幕動畫與軌道分配演算法。

## 架構

```
   發送端 (Sender)                Server                  接收端 (Receiver)
 ┌────────────────┐                                      ┌──────────────────┐
 │ index.html     │                                      │ Electron 透明視窗 │
 │ (網頁表單)      │── ws ──┐                    ┌── ws ──│ 全螢幕 / 置頂      │
 │ client.js      │        ├──►  server.js  ────┤        │ click-through    │
 │ (CLI 輸入)      │── ws ──┘   broadcast :8080  └── ws ──│ 彈幕從右飛到左    │
 └────────────────┘                                      └──────────────────┘
```

- **Server** 收到任何 client 的訊息後，廣播給所有連線的 client（含失敗隔離，單一 client 出錯不影響其他人）。
- **Receiver** 解析 JSON 彈幕，透過軌道分配（lane allocation）演算法把同時湧入的彈幕分散到不同高度，避免重疊。

## 功能

- ✅ WebSocket 廣播 server（失敗隔離）
- ✅ 兩種發送端：網頁表單 + Node CLI
- ✅ Electron 透明全螢幕疊加層，置頂且滑鼠穿透（click-through）
- ✅ 彈幕 CSS 動畫（右 → 左）+ 動畫結束自動清除 DOM
- ✅ 軌道分配演算法（彈幕分軌不重疊）
- ✅ 訊息格式支援字體大小、顏色
- ✅ 全域快捷鍵 `Ctrl + Shift + Q` 結束程式

## 專案結構

```
danmaku/
├── danmaku receiver/          # WebSocket server + 發送端
│   ├── server.js              # 廣播 server（port 8080）
│   ├── client.js              # CLI 發送端（終端機輸入彈幕）
│   └── index.html             # 網頁發送端（表單）
└── electron test/             # Electron 桌面疊加層（接收端）
    ├── main.js                # 視窗設定：透明 / 全螢幕 / 置頂 / 穿透
    ├── renderer.html          # 渲染頁面
    ├── script.js              # 接 WS、軌道分配、建立彈幕
    └── style.css              # 彈幕動畫與樣式
```

## 開始使用

需要 [Node.js](https://nodejs.org/)（含 npm）。

### 1. 啟動 server

```bash
cd "danmaku receiver"
npm install
node server.js
# WebSocket server is running on ws://localhost:8080
```

### 2. 啟動桌面接收端（Electron）

另開一個終端機：

```bash
cd "electron test"
npm install
npm start
```

透明視窗會蓋滿整個桌面並開始等待彈幕。

### 3. 發送彈幕

**方式 A — 網頁表單：** 用瀏覽器打開 `danmaku receiver/index.html`，輸入文字按送出。

**方式 B — CLI：** 再開一個終端機：

```bash
cd "danmaku receiver"
node client.js
# Enter a message (or "exit" to quit):
```

輸入的訊息會即時飛過你的桌面。

## 快捷鍵

| 快捷鍵 | 功能 |
| --- | --- |
| `Ctrl + Shift + Q` | 結束 Electron 程式 |

## 訊息格式

發送端送出的彈幕為 JSON：

```json
{
  "type": "danmaku",
  "text": "Hello world",
  "size": "medium",
  "color": "white"
}
```

`size` 可為 `small` / `medium` / `large`；`color` 接受任何 CSS 顏色。

## Roadmap

- [x] **Phase 0** — WebSocket echo → 廣播 → 網頁/CLI 發送 → Electron 透明疊加 → 彈幕動畫 → 軌道分配
- [ ] **Phase 1** — 體驗收尾（穿透切換快捷鍵）、自動重連 + 心跳機制
- [ ] **Phase 2** — 同一 WiFi 多裝置（server 直接 serve 網頁 + QR code 掃碼發彈幕）
- [ ] **Phase 3** — 房間概念（多群人各自獨立的彈幕頻道）
- [ ] **Phase 4** — 上雲（跨網路、wss 加密、rate limiting）
- [ ] **Phase 5** — 純網頁觀看端（無需 Electron）

完整路線圖見 [`milestone.md`](./milestone.md)。

## 技術

- [ws](https://github.com/websockets/ws) — WebSocket server / client
- [Electron](https://www.electronjs.org/) — 桌面透明疊加視窗
- 原生 HTML / CSS / JavaScript
