const fs = require('fs');
const path = require('path');

const templateFile = path.join(__dirname, '../codeTemplate/cSharp.template');

let template = null;
let originalCode = null;

exports.prepare = (conf, tableName, res) => {
    template = fs.readFileSync(templateFile).toString();
    exports.feedDefault(conf, tableName);

    var className = exports.getClassName(tableName);
    var classPath = path.join(conf.classPath, `${className}.cs`);
    if (fs.existsSync(classPath)){
        originalCode = fs.readFileSync(classPath).toString();
    }

}

exports.rephrase = (body, name, value) => {
    const regex = new RegExp('\\$' + name + '\\b', 'gm');
    return body.replace(regex, value);
}
exports.feedDefault = (conf, tableName) => {

    template = exports.rephrase(template, 'nameSpace', conf.nameSpace);
    template = exports.rephrase(template, 'classAttribute', tableName); 
    template = exports.rephrase(template, 'className', exports.getClassName(tableName));
}

exports.hasExistingClass = () => {
    return originalCode !== null;
}

exports.getClassName = (tableName) => {
    var className = tableName.substr(0, 1);

    if (className === className.toLowerCase()) {
        className = tableName.substr(1);
    } else
        className = tableName;
    return className;
}

exports.getString = () => {
    return template;
}
