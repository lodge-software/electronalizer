import {app, BrowserWindow} from 'electron';

app.on('ready', () => {
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
  window.loadURL(`file://${__dirname}/../website/index.html`);
});
