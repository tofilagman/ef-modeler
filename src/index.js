 
const electron = require('electron')
const {app, BrowserWindow, globalShortcut } = electron
const path = require('path');

const os =require('os');

global.isDev = process.argv.find(x => x === '--dev') !== undefined;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true
    }, 
    icon: path.join(__dirname, './contents/favicon.png')
  });
  
  mainWindow.webContents.openDevTools()

  globalShortcut.register('f5', function() {
    mainWindow.reload()
  })
  globalShortcut.register('CommandOrControl+R', function() {
    mainWindow.reload()
  })

  mainWindow.maximize(); 
  // and load the index.html of the app.
  mainWindow.loadFile(`${__dirname}/index.html`);
 
  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  if (global.isDev) {
    let platform = os.platform()
    if (platform === 'darwin') {
        globalShortcut.register('Command+Option+I', () => {
          mainWindow.webContents.openDevTools()
        });

        globalShortcut.register('Command+R', () => {
          mainWindow.webContents.reload();
        });
    } else if (platform === 'linux' || platform === 'win32') {
        globalShortcut.register('Control+Shift+I', () => {
          mainWindow.webContents.openDevTools()
        })

        globalShortcut.register('Control+R', () => {
          mainWindow.webContents.reload();
        });
    }
} else {
  mainWindow.setMenu(null);
}

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
