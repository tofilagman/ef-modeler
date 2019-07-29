const { random } = require('./util.js');
const moment = require('moment');

exports.recentDto = {
    key: random.GUID(),
    name: null,
    nameSpace: null,
    classPath: null,
    dateCreated: moment().format(),
    lastAccess: moment().format(),
    sql: {}
}