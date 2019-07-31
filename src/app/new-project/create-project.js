const { remote, ipcRenderer } = require('electron');
let currentWindow = remote.getCurrentWindow();
const { folderDialog, tmplCompile } = require('../util.js');
const path = require('path');
const fs = require('fs')
const { recentDto } = require('../dto.js');
const sql = require('mssql/msnodesqlv8');

const appDataPath = remote.app.getPath('userData');
const RECENTFILENAME = ".recent"

if (remote.getGlobal('isDev'))
    currentWindow.webContents.openDevTools();

currentWindow.setSize(600, 600);

ipcRenderer.on('win-data', (sender, e) => {
    console.log('windata',e);
});

$(document).ready(() => {
    var recentFile = path.join(appDataPath, RECENTFILENAME);
    var recentObj = [];

    if (fs.existsSync(recentFile))
        recentObj = JSON.parse(fs.readFileSync(recentFile));

    //events
    $('#project-form').submit((event) => {
        event.preventDefault();

        var recentItem = recentDto;
        recentItem.name = $('#project-name').val();
        recentItem.nameSpace = $('#project-nameSpace').val();
        recentItem.classPath = $('#project-classPath').val();
        recentItem.sql = getConfig();
        recentObj.push(recentItem);

        fs.writeFileSync(recentFile, JSON.stringify(recentObj));
        fs.writeFileSync(path.join(recentItem.classPath, `${recentItem.name}.efmodelproj`), JSON.stringify(recentItem));

        currentWindow.getParentWindow().webContents.send('loadProject', recentItem);
        currentWindow.close();
    });

    $('#button-classPath').click(() => {
        var txtPath = $('#project-classPath');
        folderDialog(txtPath.val(), (selectedPath) => {
            txtPath.val(selectedPath[0]);
        });
    });

    $('#btn-back').click(() => {
        currentWindow.loadFile(path.join(__dirname, 'new-project.html'));
    })

    $('#sys-close-create').click(() => {
        currentWindow.close();
    });

    $('#sql-trusted').change(ev => {
        if ($(ev.currentTarget).is(':checked'))
            $('.sql-user-group').slideUp();
        else
            $('.sql-user-group').slideDown();
    });

    $('.sql-user-group').slideUp();

    $('#button-sql-load').click(ev => {
        const conn = new sql.ConnectionPool(getConfig());
        conn.connect().then(pool => {
            pool.request().query("SELECT * FROM sys.databases d WHERE d.database_id > 4").then(d => {
                var opts = `{{#each recordset}}<option>{{name}}</option>{{/each}}`;
                $('#sql-database').append(tmplCompile(opts, d));
            }).then(() => {
                conn.close();
            });
        }).catch(err => {
            conn.close();
            alert(err.message);
        });
    });
 
    getConfig = () => {
        return {
            driver: 'msnodesqlv8',
            user: $('#sql-user').val() || '',
            password: $('#sql-password').val() || '',
            server: $('#sql-server').val(),
            database: $('#sql-database').val() || 'master',
            options: {
                trustedConnection: $('#sql-trusted').is(':checked'),
                encrypt: false // Use this if you're on Windows Azure
            }
        }
    }
})
