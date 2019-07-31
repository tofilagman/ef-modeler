const { remote } = require('electron');
let currentWindow = remote.getCurrentWindow();
const path = require('path');
const fs = require('fs');
const { tmpl, arry, fileDialog, confirmDialog } = require('../util.js');
const appDataPath = remote.app.getPath('userData');
const RECENTFILENAME = ".recent"
const moment = require('moment');

if (remote.getGlobal('isDev'))
    currentWindow.webContents.openDevTools();

currentWindow.setSize(800, 600);

$(document).ready(() => {
    var recentFile = path.join(appDataPath, RECENTFILENAME);
    var recents = [];

    if (fs.existsSync(recentFile)) {
        recents = JSON.parse(fs.readFileSync(recentFile));

        recents = recents.sort(x => x.lastAccess);

        tmpl('recent-item-template', { items: recents }, htmlData => {
            $('#lst-recent').append(htmlData);

            $('.list-group-item .close').click((ev) => {
                var key = $(ev.currentTarget).parentsUntil('.list-group-flush').last();

                var name = $('.li-desc', key).html().trim();
                confirmDialog(`Remove Recent Item ${name}?`, callback => {
                    arry.Remove(recents, x => x.key === key.attr('data'));
                    fs.writeFileSync(recentFile, JSON.stringify(recents));
                    key.remove();
                }); 
            });

        $('.list-group-item .li-desc').click((ev) => {
            var key = $(ev.currentTarget).parentsUntil('.list-group-flush').last().attr('data');
            var recentItem = recents.filter(x => x.key === key)[0];
            currentWindow.getParentWindow().webContents.send('loadProject', recentItem);
            currentWindow.close();
        });
    })
    }

//events
$('#btn-create').click(() => {
    currentWindow.loadFile(path.join(__dirname, 'create-project.html'));
});

$('#btn-open').click(() => {
    fileDialog('EF Model Project', ['efmodelproj'], selectedFile => {
        var sItem = JSON.parse(fs.readFileSync(selectedFile[0]));
        var nItem = recents.filter(x => x.key == sItem.key);

        if (nItem.length > 0) {
            nItem[0].lastAccess = moment().format();
        } else
            recents.push(sItem);

        fs.writeFileSync(recentFile, JSON.stringify(recents));

        currentWindow.getParentWindow().webContents.send('loadProject', sItem);
        currentWindow.close();
    })
})

$('#sys-close-new').click(() => {
    currentWindow.close();
});
})
