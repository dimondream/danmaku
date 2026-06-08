const { app, BrowserWindow, globalShortcut} = require('electron')

let win

const createWindow = () => {
  win = new BrowserWindow({

    fullscreen: true,
    frame: false,
    alwaysOnTop: true,
    transparent:true,
    skipTaskbar: true,
    minimizable: false,
    focusable: false,
}

  )

  win.loadFile('renderer.html');
  win.setIgnoreMouseEvents(true);

}

app.whenReady().then(()=>{
  createWindow()

  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    app.quit()
  })
})
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})




