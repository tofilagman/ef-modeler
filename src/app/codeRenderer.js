const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const templateFile = path.join(__dirname, '../codeTemplate/cSharp.template');

let template = null;
let originalCode = null;
let TableName = null;
let className = null;
let classPath = null;

exports.prepare = (conf, tableName, res) => {
    TableName = tableName;
    template = fs.readFileSync(templateFile).toString();
    exports.feedDefault(conf, tableName);

    className = exports.getClassName(tableName);
    classPath = path.join(conf.classPath, `${className}.cs`);
    if (fs.existsSync(classPath)) {
        originalCode = fs.readFileSync(classPath).toString();
    } else
        originalCode = null;

    exports.plotProperties(res, tableName);
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

exports.getString = () => template

exports.getTableName = () => TableName;

exports.getOriginalCode = () => originalCode;

exports.plotProperties = (resultset, tableName) => {
    let props = [];
    var res = resultset[0];

    for (var r in res) {

        var item = {
            attributes: [],
            name: "",
            type: null,
            props: []
        };

        item.name = res[r].ColumnName;
        item.type = exports.getType(res[r].DataType, res[r].AllowDBNull);

        if (res[r].Identity)
            item.attributes.push('Key');

        //foreign key
        var fks = resultset[1].filter(x => x.column === item.name);
        if (fks.length > 0) {
            for (var j in fks) {
                item.attributes.push(`ForeignKey("${item.name}")`);
                item.name = item.type = exports.getClassName(fks[j].referenced_table);
            }
        }

        //foreign key collection
        var fksx = resultset[1].filter(x => x.referenced_column === item.name && x.referenced_table === tableName);
        if (fksx.length > 0) {
            for (var j in fksx) {
                var clsss = exports.getClassName(fksx[j].table);
                item.props.push({
                    attributes: [],
                    name: clsss,
                    type: `ICollection<${clsss}>`,
                    attributes: [`ForeignKey("${item.name}")`]
                })
            }
        }

        props.push(item);
    }

    //plot
    var h = [];

    var arSet = (arry, prop) => {
        for (var attr in prop.attributes) {
            arry.push(`[${prop.attributes[attr]}]`);
        }
        arry.push(`public ${prop.type} ${prop.name} { get; set; }`);
    }

    for (var p in props) {
        arSet(h, props[p]);
        for (var c in props[p].props) {
            arSet(h, props[p].props[c]);
        }
        h.push('');
    }

    template = exports.rephrase(template, 'body', h.join('\n'));
}

exports.getType = (sqlDataType, nullable) => {

    switch (sqlDataType) {
        case 'int':
            return 'int' + (nullable ? '?' : '');
        case 'bigint':
            return 'long' + (nullable ? '?' : '');
        case 'date':
        case 'time':
        case 'datetime':
            return 'DateTime' + (nullable ? '?' : '');
        case 'bit':
            return 'bool' + (nullable ? '?' : '');
        case 'smallint':
                return 'int16'+ (nullable ? '?' : '');
        default:
            return 'string';
    }
}

exports.save = function (modifiedTemplate) {
    if (TableName !== null) {
        fs.writeFileSync(classPath, modifiedTemplate);
    }
}

exports.openContainingFolder = function () {
    if (classPath !== null) {
        exec(`start "" "${classPath}"`);
    }
}

exports.updateTemplate = (tempString) => {
    template = tempString;
}
