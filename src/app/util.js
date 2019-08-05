const { remote, ipcRenderer } = require('electron');
const { dialog, BrowserWindow, Menu, MenuItem, app, } = remote;
const path = require('path');
const isDev = remote.getGlobal('isDev');
const fs = require('fs');
const handlebars = require('handlebars');

let currentWindow = remote.getCurrentWindow();


exports.dialog = (windowFile, show = true, data = null) => {
    var dlg = new BrowserWindow({
        modal: true,
        show: false,
        parent: currentWindow,
        resizable: false,
        minimizable: false,
        maximizable: false,
        frame: false,
        titleBarStyle: 'hidden',
        webPreferences: {
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
    dlg.on('show', () => {
        if (data !== null)
            dlg.webContents.send('win-data', data);
    });

    return dlg;
}

exports.folderDialog = (curPath, onSelect) => {
    return dialog.showOpenDialog(currentWindow, {
        defaultPath: curPath,
        properties: ['openDirectory'],
    }, onSelect);
}

exports.fileDialog = (name, extensions, onSelect) => {
    return dialog.showOpenDialog(currentWindow, {
        properties: ['openFile'],
        filters: [{
            name: name,
            extensions: extensions
        }]
    }, onSelect);
}

exports.confirmDialog = (message, callback) => { 
    var modal = $(`
     <div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Confirm</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                ${message}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button id="btn-modal-ok" type="button" class="btn btn-primary">OK</button>
            </div>
            </div>
        </div>
        </div>
     `);
 
     modal.find('#btn-modal-ok').click(()=> {
         modal.modal('hide');
         callback();
     })

    $('body').append(modal);

    modal.modal('show');
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

exports.tmplCompile = (htmlString, data) => {
    var template = handlebars.compile(htmlString);
    return template(data);
}

exports.arry = {
    Remove: (arr, filter) => {
        for (var i in arr) {
            if (filter(arr[i]) === true)
                arr.splice(i, 1);
        }
    }
}
