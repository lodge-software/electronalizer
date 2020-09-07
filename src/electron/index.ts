import {app, BrowserWindow} from 'electron';

function createWindow() {
  // once electron has started up, create a window.
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // hide the default menu bar that comes with the browser window
  window.setMenuBarVisibility(true);

  // load a website to display
  window.loadFile('../website/index.html');
  window.webContents.openDevTools();
}

app.on('ready', createWindow);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
