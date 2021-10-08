const { BrowserWindow, app } = require('electron');
app.on('ready', () => {
	let win = new BrowserWindow({ width: 4000, height: 4000, webPreferences: { nodeIntegration: true, contextIsolation: false } });
	win.on('closed', () => {
		win = null;
	});
	win.loadURL(`file://${__dirname}/ChoreChart/index.html`);
	win.show();
	win.maximize();
});

const ipc = require('electron').ipcMain;

var settings = {};

ipc.on('cacheSettings', function (event, data) {
	settings = data;
	var result = 'some data was sent';
	event.sender.send('cacheReply', result);
});

ipc.on('requestSettings', function (event, data) {
	var result = settings;
	event.sender.send('settingsReturn', result);
});