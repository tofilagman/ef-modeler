const { remote, ipcRenderer } = require('electron');
const { dialog, BrowserWindow, Menu, MenuItem, app, } = remote;
const path = require('path');
const isDev = remote.getGlobal('isDev');
const fs = require('fs');
const handlebars = require('handlebars');

let currentWindow = remote.getCurrentWindow();


exports.dialog = (windowFile, show = true) => {
    var dlg = new BrowserWindow({
        modal: true, show: false, parent: currentWindow, titleBarStyle: 'hidden', resizable: false, minimizable: false, maximizable: false, webPreferences: {
            nodeIntegration: true
        }
    });

    dlg.loadFile(path.join(__dirname, windowFile));
    if (!isDev) {
        dlg.setMenu(null);
    }
    if (show)
        dlg.once('ready-to-show', () => {
            dlg.show();
        });

    return dlg;
}

exports.folderDialog = (curPath, onSelect) => {
    return dialog.showOpenDialog(currentWindow, {
        defaultPath: curPath,
        properties: ['openDirectory'],
    }, onSelect);
}

exports.random = (function () {
    return {
        S4: function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        },
        GUID: function () {
            return (exports.random.S4() + exports.random.S4() + "-" + exports.random.S4() + "-4" + exports.random.S4().substr(0, 3) + "-" + exports.random.S4() + "-" + exports.random.S4() + exports.random.S4() + exports.random.S4()).toLowerCase();
        }
    }
}())

exports.tmpl = (templateName, data, callback) => {

    const tmplfile = path.join(__dirname, `../templates/${templateName}.html`);

    fs.readFile(tmplfile, (err, htmlData) => {

        if (err)
            throw err;

        var template = handlebars.compile(htmlData.toString());
        callback(template(data));
    });
}

exports.tmplCompile = (htmlString, data)=> {
    var template = handlebars.compile(htmlString);
    return template(data);
}

exports.arry = {
    Remove: (arr, filter)=> {
        for(var i in arr){
            if(filter(arr[i]) === true)
               arr.splice(i, 1);
        }
    }
}
