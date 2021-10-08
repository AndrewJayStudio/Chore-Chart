var settings = {
	'color': '#05ff75',
	'users': {
		'name1': {
			'specific': {
				'start': 1,
				'max': 4
			},
			'daily': ['chore1', 'chore2', 'chore3', 'chore4', 'chore5', 'chore6', 'chore7'],
			'alternate': [{
				'type': 'altchore1',
				'start': 1,
				'options': ['op1', 'op2']
			}, {
				'type': 'altchore2',
				'start': 1,
				'options': ['op1', 'op2']
			}]
		},
		'name2': {
			'specific': {
				'start': 1,
				'max': 4
			},
			'daily': ['chore1', 'chore2'],
			'alternate': [{
				'type': 'altchore1',
				'start': 1,
				'options': ['op1', 'op2']
			}, {
				'type': 'altchore2',
				'start': 1,
				'options': ['op1', 'op2']
			}]
		},
		'name3': {
			'specific': {
				'start': 1,
				'max': 4
			},
			'daily': ['chore1', 'chore2'],
			'alternate': [{
				'type': 'altchore1',
				'start': 1,
				'options': ['op1', 'op2']
			}, {
				'type': 'altchore2',
				'start': 1,
				'options': ['op1', 'op2']
			}]
		}
	},
	'shared': {
		'start': 1,
		'max': 14
	}
};

var choreCalc = choreCalc();
var isMonday = false;
var Monday;
var selectedDate;
var parent;
var startDate = new Date(2019, 0, 1).getTime();
var printWindow = '';
var ipc = require('electron').ipcRenderer;

window.onload = function () {
	getSettings();
	monday();
	var m1date = new Date(Monday * 86400000 + startDate);
	document.getElementById('monday').value = m1date.toDateString();
	var label = (isMonday) ? '<strong>Today is</strong> Monday' : '<strong>Next</strong> Monday';
	document.getElementById('date-label').innerHTML = label;
	selectedDate = new Date(document.getElementById('monday').value);
	parent = document.getElementsByName('parent')[0];
	document.getElementById('monday').addEventListener('change', (event) => {
		changeSelected(event);
	});
	document.querySelector('.settings-icon').addEventListener('click', (event) => {
		document.querySelector('.set-pos').style.top = '128px';
		document.querySelector('.set-behind').style.display = 'block';
	});
}

function getSettings() {
	var fs = require('fs');
	fs.readFile(`C:/ProgramData/AJ Acup/Chore Chart/settings.json`, 'utf-8', (err, data) => {
		if (err) {
			fs.writeFile(`C:/ProgramData/AJ Acup/Chore Chart/settings.json`, JSON.stringify(settings), (err) => {
				if (err) {
					if (!fs.existsSync('C:/ProgramData/AJ Acup')) {
						fs.mkdirSync('C:/ProgramData/AJ Acup');
					}
					if (!fs.existsSync('C:/ProgramData/AJ Acup/Chore Chart')) {
						fs.mkdirSync('C:/ProgramData/AJ Acup/Chore Chart');
					}
					fs.writeFile(`C:/ProgramData/AJ Acup/Chore Chart/settings.json`, JSON.stringify(settings), (err) => {
						if (err) {
							throw (err);
						}
						else {
							getSettings();
						}
					});
				}
				else {
					getSettings();
				}
			});
		}
		else {
			settings = JSON.parse(data);
			buildPage();
			buildSettings();
		}
	});
}

function changeSelected(event) {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
	selectedDate = new Date(event.srcElement.value);
	selectedDate = (selectedDate == 'Invalid Date') ? new Date() : selectedDate;
	monday(selectedDate);
	buildPage();
	var m1date = new Date(Monday * 86400000 + startDate);
	document.getElementById('monday').value = m1date.toDateString();
	try {
		document.querySelector('#date-label strong').innerHTML = 'Selected';
	}
	catch (err) { }
}

function nextWeek(boolean) {
	var input = document.getElementById('monday');
	var previous = new Date(input.value);
	if (boolean) {
		input.value = new Date(
			previous.getTime() - 7 * 86400000
		).toDateString();
	}
	else {
		input.value = new Date(
			previous.getTime() + 7 * 86400000
		).toDateString();
	}
	changeSelected({ 'srcElement': input });
}

function buildPage() {
	Object.getOwnPropertyNames(settings.users)
		.forEach((user, useri, usera) => {
			var newBlock = parent.appendChild(
				document.getElementsByName('data-block')[0].cloneNode(true)
			);
			newBlock.querySelector('[name="name"]').innerHTML = user;
			newBlock.querySelector('[name="specChore"]').innerHTML = `${user}'s Chores: <span name="specific"></span>`;
			newBlock.querySelector('[name="shared"]')
				.innerHTML = choreCalc.shared(useri, usera);
			newBlock.querySelector('[name="specific"]').innerHTML = choreCalc.specific(settings.users[user].specific);
			var daily = newBlock.querySelector('[name="daily"]');
			settings.users[user].daily.forEach((chore, dailyi, dailya) => {
				list = document.createElement('li');
				list.innerHTML = chore;
				daily.appendChild(list);
			});
			var alternate = newBlock.querySelector('[name="alternate"]');
			settings.users[user].alternate.forEach((chore, alti, alta) => {
				list = document.createElement('li');
				list.innerHTML = `${chore.type}: ${choreCalc.alternate(chore)}`;
				alternate.appendChild(list);
			});
			newBlock.removeAttribute('name');
		});
	document.querySelectorAll('.user-color').forEach((element) => {
		element.style.color = settings.color;
	});
	document.querySelectorAll('.user-back').forEach((element) => {
		element.style.background = settings.color;
	});
	document.querySelectorAll('.user-border').forEach((element) => {
		element.style.border = `1px solid ${settings.color}`;
	});
	document.querySelectorAll('.user-border-bum').forEach((element) => {
		element.style['border-bottom'] = `1px solid ${settings.color}`;
	});
}

function buildSettings() {
	var options = document.querySelector('.options');
	options.querySelectorAll('.option').forEach((optionSection, optionIndex) => {
		if (optionIndex > 0) {
			optionSection.remove();
		}
	});
	var optiontemp = document.querySelector('.off-screen .option');
	setSetting('set-share-max', settings.shared.max);
	setSetting('set-share-start', settings.shared.start);
	if (settings.color == undefined) {
		settings.color = '#05ff75';
	}
	setSetting('set-color', settings.color);
	options.querySelector('[name="set-ex"]').style.color = settings.color;
	Object.getOwnPropertyNames(settings.users).forEach((user, useri, usera) => {
		option = optiontemp.cloneNode(true);
		option.querySelector('.op-title h3').innerHTML = user;
		option.querySelector('.op-chores h3').innerHTML = `Number of ${user}'s chores:`;
		setSetting('set-name', user, option);
		var daily = '';
		settings.users[user].daily.forEach((chore) => {
			daily = daily + chore + '; ';
		});
		daily = daily.slice(0, daily.length - 2);
		setSetting('set-daily', daily, option);
		setSetting('set-specific', settings.users[user].specific.max, option);
		setSetting('set-spec-start', settings.users[user].specific.start, option);
		settings.users[user].alternate.forEach((chore, chorei, chorea) => {
			var opt = '';
			chore.options.forEach((op) => {
				opt = opt + op + '; ';
			});
			opt = opt.slice(0, opt.length - 2);
			if (chorei > 0) {
				var altOpt = document.querySelector('.off-screen .option .op-alt');
				var optOpt = altOpt.nextElementSibling;
				var altbox = option.querySelector('.op-alt').parentNode.appendChild(altOpt.cloneNode(true));
				var optbox = option.querySelector('.op-alt').parentNode.appendChild(optOpt.cloneNode(true));
				setSetting('set-alternating', chore.type, altbox);
				setSetting('set-option', opt, optbox);
			}
			else {
				setSetting('set-alternating', chore.type, option);
				setSetting('set-option', opt, option);
			}
		});
		options.appendChild(option);
	});
	document.getElementsByName('set-share-max')[0].addEventListener('change', (event) => {
		var valMax = event.srcElement.value;
		var elStart = document.getElementsByName('set-share-start')[0];
		elStart.max = Number(valMax);
		if (Number(elStart.value) >= Number(valMax)) {
			elStart.value = Number(valMax);
		}
	});
	document.querySelectorAll('[name="set-specific"]').forEach((element, index, array) => {
		element.addEventListener('change', (event) => {
			var valMax = event.srcElement.value;
			var elStart = element.parentNode.parentNode.querySelector('[name="set-spec-start"]');
			elStart.max = Number(valMax);
			if (Number(elStart.value) >= Number(valMax)) {
				elStart.value = Number(valMax);
			}
		});
	});
	document.querySelector('input[type="color"]').addEventListener('change', (event) => {
		document.querySelector('h1[name="set-ex"]').style.color = event.srcElement.value;
	});
}

function setSetting(setting, value, node) {
	var options = document.querySelector('.options');
	if (node) {
		node.querySelector(`[name="${setting}"]`).value = value;
	}
	else {
		options.querySelector(`[name="${setting}"]`).value = value;
	}
}

function choreCalc() {
	this.shared = (useri, usera) => {
		var start = settings.shared.start;
		var max = settings.shared.max;
		var users = usera.length;
		var y = users * Monday - users + useri;
		return (y - start) % max + 1;
	};
	this.specific = (setting) => {
		var start = setting.start;
		var max = setting.max;
		return (Monday - start) % max + 1;
	};
	this.alternate = (setting) => {
		var start = setting.start;
		var max = setting.options.length;
		return setting.options[(Monday - start) % max];
	}
	return this;
}

function monday(date = new Date()) {
	var start = new Date(2019, 0, 1);
	if (date.getDay() == 1) {
		var monday = 86400000 * (Math.ceil(date.getTime() / 86400000) - 1);
		isMonday = true;
	}
	else {
		isMonday = false;
		var diff = 8 - date.getDay();
		diff = diff <= 6 ? diff : 1;
		var mili = new Date(date.toDateString()).getTime();
		monday = diff * 86400000 + mili;
	}
	Monday = Math.ceil((monday - start.getTime()) / 86400000);
}

function printBtn() {
	settings.monday = Math.ceil(new Date(document.getElementById('monday').value).getTime() / 86400000) * 86400000;
	ipc.once('cacheReply', function (event, response) {
	});
	ipc.send('cacheSettings', settings);
	const { BrowserWindow, app } = require('electron').remote;
	let printWin = new BrowserWindow({ width: 4000, height: 4000, webPreferences: { nodeIntegration: true } });
	printWin.on('closed', () => {
		printWin = null;
	});
	printWin.loadURL(`file://${__dirname}/printout.html`);
	printWin.show();
	printWin.maximize();
}

function exitSet() {
	document.querySelector('.set-pos').style.top = '-1000px';
	document.querySelector('.set-behind').style.display = 'none';
}

function deleteAlt(event) {
	var chore = event.srcElement.parentNode.parentNode;
	var chores = chore.parentNode.querySelectorAll('.op-alt').length;
	if (chores > 1) {
		var options = chore.nextElementSibling;
		options.remove();
		chore.remove();
	}
}

function deleteOpt(event) {
	var chore = event.srcElement.parentNode.parentNode.parentNode;
	if (chore.parentNode.querySelectorAll('.option').length > 2) {
		chore.remove();
	}
}

function addAlt(event) {
	var altOpt = document.querySelector('.off-screen .option .op-alt');
	var optOpt = altOpt.nextElementSibling;
	event.srcElement.parentNode.parentNode.parentNode.appendChild(altOpt.cloneNode(true));
	event.srcElement.parentNode.parentNode.parentNode.appendChild(optOpt.cloneNode(true));
}

function addOpt(event) {
	var opt = document.querySelector('.off-screen .option');
	event.srcElement.parentNode.parentNode.parentNode.parentNode.appendChild(opt.cloneNode(true));
}

function setCancel() {
	buildSettings();
	exitSet();
}

var saveCache = {
	'user': '',
	'alt': {},
	'order': 0
}

function wut() {
	if (2 > 14) {
		return true;
	}
	else {
		return false;
	}
}

function setSave() {
	var inputs = document.querySelector('.options').querySelectorAll('input, textarea');
	var toSave = { 'shared': {}, 'users': {} };
	inputs.forEach((input, index, all) => {
		var name = input.name;
		var value = input.value;
		switch (name) {
			case 'set-name':
				saveCache.user = value;
				toSave.users[value] = { 'specific': {}, 'alternate': [], 'daily': [], 'index': saveCache.order };
				saveCache.order += 1;
				break;
			case 'set-share-max':
				toSave.shared.max = Number(value);
				break;
			case 'set-share-start':
				if (Number(value) > toSave.shared.max) {
					value = toSave.shared.max;
				}
				toSave.shared.start = Number(value);
				break;
			case 'set-color':
				toSave.color = value;
				break;
			case 'set-daily':
				value = value.split('; ');
				toSave.users[saveCache.user].daily = value;
				break;
			case 'set-specific':
				toSave.users[saveCache.user].specific.max = Number(value);
				break;
			case 'set-spec-start':
				if (Number(value) > toSave.users[saveCache.user].specific.max) {
					value = toSave.users[saveCache.user].specific.max;
				}
				toSave.users[saveCache.user].specific.start = Number(value);
				break;
			case 'set-alternating':
				var a = toSave.users[saveCache.user].alternate.push({ 'type': value, 'start': 1, 'options': [] });
				saveCache.alt = a - 1;
				break;
			case 'set-option':
				value = value.split('; ');
				toSave.users[saveCache.user].alternate[saveCache.alt].options = value;
				break;
			default:
				throw ('Something went wrong while attempting to save.');
		}
	});
	var fs = require('fs');
	fs.writeFile(`C:/ProgramData/AJ Acup/Chore Chart/settings.json`, JSON.stringify(toSave), (err) => {
		if (err) {
			throw (err);
		}
		else {
			location.reload();
		}
	});
}






function sendBtn(params, payload) {
	var send = {};
	send.params = params;
	send.payload = payload;
	postData(send).then(data => {
		displayOutput(data);
	}).catch((err) => {
		sendReTry(send, 0);
	});
}

function postData(send, attempt = 0) {
	if (send.params !== 'send') {
		send.params === 'return';
	}
	return new Promise(function (resolve, reject) {
		fetch('https://script.google.com/macros/s/AKfycbzjt5XqQ0GrIZ7o9j2rraACLMZCCpoZyFiL7TBjrpbnsSLjKclN/exec', {
			method: 'POST',
			body: JSON.stringify({
				"auth": [send.params],
				"payload": [send.payload]
			}),
		}).then(response => response.json())
			.then(data => {
				resolve(data);
			}).catch((err) => {
				reject(err);
			});
	});
}

function displayOutput(data) {
	console.log(data);
}

function sendReTry(resend, attempts) {
	postData(resend).then(data => {
		displayOutput(data);
	}).catch((err) => {
		if (attempts >= 6) {
			displayOutput(checkConnection());
		}
		else {
			setTimeout((resend, attempts) => {
				attempts++;
				sendReTry(resend, attempts)
			}, 3000, resend, attempts);
		}
	});
}

function checkConnection() {
	var status;
	if (navigator.onLine) {
		status = {
			"code": "d01",
			"type": "Timed Out",
			"output": "Could not connect to server in time."
		};
	}
	else {
		status = {
			"code": "b01",
			"type": "Internet Disconnected",
			"output": "No internet<br>Try:<br>Checking the network cables, modem, and router<br>Reconnecting to Wi-Fi<br>Running Windows Network Diagnostics"
		};
	}
	return status;
}