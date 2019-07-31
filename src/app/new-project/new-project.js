const { remote } = require('electron');
let currentWindow = remote.getCurrentWindow();
const path = require('path');
const fs = require('fs');
const { tmpl, arry } = require('../util.js');
const appDataPath = remote.app.getPath('userData');
const RECENTFILENAME = ".recent"

currentWindow.webContents.openDevTools();
currentWindow.setSize(800, 600);

$(document).ready(() => {
    var recentFile = path.join(appDataPath, RECENTFILENAME);

    if (fs.existsSync(recentFile)) {
        var recents = JSON.parse(fs.readFileSync(recentFile));

        recents = recents.sort(x => x.lastAccess);

        tmpl('recent-item-template', { items: recents }, htmlData => {
            $('#lst-recent').append(htmlData);

            $('.list-group-item .close').click((ev) => {
                var key = $(ev.currentTarget).parentsUntil('.list-group-flush').last();
                 
                var name = $('.li-desc', key).html().trim();
                if (confirm(`Remove Recent Item ${name}?`)) {
                    arry.Remove(recents, x=> x.key === key.attr('data'));
                    fs.writeFileSync(recentFile, JSON.stringify(recents));
                    key.remove();
                }
            });

            $('.list-group-item .li-desc').click((ev) => {
                var key = $(ev.currentTarget).parentsUntil('.list-group-flush').last().attr('data');
                var recentItem = recents.filter(x=> x.key === key)[0];
                currentWindow.getParentWindow().webContents.send('loadProject', recentItem);
                currentWindow.close();
            });
        })
    }

    //events
    $('#btn-create').click(() => {
        currentWindow.loadFile(path.join(__dirname, 'create-project.html'));
    });

    $('#sys-close-new').click(() => {
        currentWindow.close();
    });
})
