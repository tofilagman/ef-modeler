const { remote, ipcRenderer } = require('electron');
let currentWindow = remote.getCurrentWindow();
const path = require('path');
const { dialog } = require('./util.js');
const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const pace = require('../contents/pace/pace.min.js');
const codeRenderer = require('./codeRenderer.js');
const formatter = require('../formatter/extension.js');

(function () {
  const tableSchema = fs.readFileSync(path.join(__dirname, '../contents/tableSchema.sql'));
  const amdLoader = require('../../node_modules/monaco-editor/min/vs/loader.js');
  const amdRequire = amdLoader.require;
  const amdDefine = amdLoader.require.define;

  let currentItem = null;
  let editor = null;

  function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');
    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
      pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
  }

  amdRequire.config({
    baseUrl: uriFromPath(path.join(__dirname, '../../node_modules/monaco-editor/min'))
  });
  // workaround monaco-css not understanding the environment
  self.module = undefined;

  ipcRenderer.on('loadProject', (sender, e) => {
    loadProject(e);
  });

  //events
  $('#btn-project').click(() => {
    dialog("new-project/new-project.html");
  });

  $('#sys-min').click(() => {
    remote.getCurrentWindow().minimize();
  });

  $('#sys-max').click(() => {
    if(currentWindow.isMaximized()) {
      currentWindow.unmaximize();
    } else {
      currentWindow.maximize();
    }
  });

  $('#sys-close').click(() => {
    remote.app.quit();
  });

  //methods
  var loadProject = (item) => {
    currentItem = item;
    loadTables(item.sql);
  }

  var loadTableSchema = (sqlConnString, tableName, callback) => {
    pace.start();
    const conn = new sql.ConnectionPool(sqlConnString);
    conn.connect().then(pool => {

      const ps = new sql.PreparedStatement(conn);

      ps.input('ObjectName', sql.VarChar);

      ps.prepare(tableSchema.toString(), err => {
        if (err)
          throw err;

        ps.execute({ ObjectName: tableName }, (err, result) => {
          if (err)
            throw err;

          pace.stop();
          callback(result.recordsets);

          conn.close();
        });

      });
    }).catch(err => {
      pace.stop();
      conn.close();
      alert(err.message);
    });
  }

  var loadTables = (sqlConnString) => {
    pace.start();
    const conn = new sql.ConnectionPool(sqlConnString);
    conn.connect().then(pool => {
      pool.request().query("SELECT * FROM sys.tables t ORDER BY t.name").then(d => {

        var tables = [];

        for (var table in d.recordset) {
          tables.push({
            text: d.recordset[table].name
          })
        }

        var tree = [
          {
            text: "Tables",
            nodes: tables
          }
        ];

        $('#tree-objects').treeview({
          data: tree,
          onNodeSelected: function (event, data) {
            loadSelectedTable(data.text);
          }
        });

      }).then(() => {
        pace.stop();
        conn.close();
      });
    }).catch(err => {
      pace.stop();
      conn.close();
      alert(err.message);
    });
  }

  var loadSelectedTable = (tableName) => {
    loadTableSchema(currentItem.sql, tableName, res => {
      pace.start();
      codeRenderer.prepare(currentItem, tableName, res);
      $('#code-container').empty();
      amdRequire(['vs/editor/editor.main'], function () {

        formatter.formatCode(codeRenderer.getString()).then(ccode => {

          if (!codeRenderer.hasExistingClass()) {

            editor = monaco.editor.create(document.getElementById('code-container'), {
              value: ccode,
              language: 'csharp',
              automaticLayout: true,
              theme: "vs-dark",
            });
          } else {

            var originalModel = monaco.editor.createModel("heLLo world!", "csharp");
            var modifiedModel = monaco.editor.createModel("hello orlando!", "csharp");

            editor = monaco.editor.createDiffEditor(document.getElementById("container"), {
              language: 'csharp',
              automaticLayout: true,
              theme: "vs-dark",
            });
            editor.setModel({
              original: originalModel,
              modified: modifiedModel
            });
          }

          editor.updateOptions({
            "autoIndent": true,
            "formatOnPaste": true,
            "formatOnType": true
          });
        });
        
      });
    });

  }

})();