const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const linq = require('linq');
const formatter = require('../formatter/extension.js');
const templateFile = path.join(__dirname, '../codeTemplate/cSharp.template');

let template = null;
let originalCode = null;
let TableName = null;
let className = null;
let classPath = null;
let databasePath = null;

exports.prepare = (conf, tableName, res) => {
    TableName = tableName;
    databasePath = conf.databasePath;
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
    if (/[A-Z]/.test(tableName)) {
        var className = tableName.substr(0, 1);
        if (className === className.toLowerCase()) {
            return tableName.substr(1);
        }
    }
    return tableName;
}

exports.getString = () => template

exports.getTableName = () => TableName;

exports.getOriginalCode = () => originalCode;

exports.plotProperties = (resultset, tableName) => {
    let props = [];
    let collections = [];
    var res = resultset[0];
    var className = exports.getClassName(tableName);

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

        if (res[r].Computed)
            item.attributes.push('NotMapped');

        //foreign key
        var fks = resultset[1].filter(x => x.column === item.name);
        if (fks.length > 0) {
            for (var j in fks) {
                item.attributes.push(`ForeignKey("${item.name}")`);
                item.fName = item.fType = exports.getClassName(fks[j].referenced_table);

                if (item.fName === className) {
                    item.fName = `Parent_${item.fName}`;
                }
            }
        }

        //foreign key collection
        var fksx = resultset[1].filter(x => x.referenced_column === item.name && x.referenced_table === tableName);
        if (fksx.length > 0) {
            for (var j in fksx) {
                var clsss = exports.getClassName(fksx[j].table);
                if (linq.from(collections).any(x => x.name === clsss))
                    continue;

                collections.push({
                    name: clsss,
                    type: `ICollection<${clsss}>`,
                    constructor: `${clsss} = new HashSet<${clsss}>();`
                })
            }
        }

        props.push(item);
    }

    //plot
    var h = [];

    var arSet = (arry, prop) => {
        var fk = linq.from(prop.attributes).firstOrDefault();
        if (fk)
            arry.push(`[${fk}]`);

        if (prop.fName) {
            arry.push(`public ${prop.fType} ${prop.fName} { get; set; }`);
        }

        arry.push(`public ${prop.type} ${prop.name} { get; set; }`);
    }

    for (var p in props) {
        arSet(h, props[p]);
        for (var c in props[p].props) {
            arSet(h, props[p].props[c]);
        }
    }

    template = exports.rephrase(template, 'body', h.join('\n'));

    if (collections.length > 0) {
        template = exports.rephrase(template, 'constructor', linq.from(collections).select(x => x.constructor).toArray().join('\n'));

        let nc = []
        linq.from(collections).forEach(x => arSet(nc, x));

        template = exports.rephrase(template, 'collections', nc.join('\n'));
    } else {
        template = exports.rephrase(template, 'constructor', '');
        template = exports.rephrase(template, 'collections', '');
    }
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
            return 'int16' + (nullable ? '?' : '');
        case 'uniqueidentifier':
            return 'Guid' + (nullable ? '?' : '');
        case 'decimal': 
            return 'decimal' + (nullable ? '?' : '');
        default:
            return 'string';
    }
}

exports.save = function (modifiedTemplate) {
    if (TableName !== null) {
        fs.writeFileSync(classPath, modifiedTemplate);
    }

    if (databasePath !== null) {
        var kj = fs.readFileSync(databasePath).toString();
        //check if the object already defined
        var className = exports.getClassName(TableName);
        var rg = new RegExp(`\\bDbSet<${className}>`, 'gm');

        if (!rg.test(kj)) {
            var k = kj.split(/(\bDbSet<\w+>.+)$/gm);
            var inset = `\npublic DbSet<${className}> ${className} { get; set; }`;
            k.splice(k.length - 1, 0, inset);
            formatter.formatCode(k.join('')).then(ccode => {
                fs.writeFileSync(databasePath, ccode);
            });
        }
    }
}

exports.openContainingFolder = function () {
    if (classPath !== null) {
        var cf = path.dirname(classPath);
        exec(`start "" "${cf}"`);
    }
}

exports.updateTemplate = (tempString) => {
    template = tempString;
}

exports.removeItemFile = () => {
    fs.unlinkSync(classPath);
    classPath = null;

    if (databasePath !== null) {
        var kj = fs.readFileSync(databasePath).toString();
        var className = exports.getClassName(TableName);
        var rg = new RegExp(`(!?.+DbSet<${className}>.+)$\n`, 'gm');

        if (rg.test(kj)) {
            var k = kj.replace(rg, '');
            fs.writeFileSync(databasePath, k);
        }
    }
}
