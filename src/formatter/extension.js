"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formatting = require("./formatting");

exports.formatCode = (source) => {
    const formatOptions = getFormatOptions();
    return formatting.process(source, formatOptions);
}

const getFormatOptions = (options) => {
    if (!options) {
        //const sysCfg = vs.workspace.getConfiguration('editor');
        options = {
            insertSpaces: true, //sysCfg.get('insertSpaces', true),
            tabSize: 4//sysCfg.get('tabSize', 4),
        };
    }
    //const cfg = vs.workspace.getConfiguration('csharpfixformat');
    return {
        useTabs: !options.insertSpaces,
        tabSize: options.tabSize,
        sortUsingsEnabled: true,//cfg.get('sort.usings.enabled', true),
        sortUsingsOrder: 'System', //cfg.get('sort.usings.order', 'System'),
        sortUsingsSplitGroups: false,//cfg.get('sort.usings.splitGroups', false),
        styleEnabled: true,//cfg.get('style.enabled', true),
        styleNewLineMaxAmount: 0,//cfg.get('style.newline.maxAmount', 0),
        styleNewLineAtEnd: false,//cfg.get('style.newline.atEnd', false),
        styleNewLineElseCatch: false,//cfg.get('style.newline.elseCatch', false),
        styleIndentPreprocessorIgnored: true,//cfg.get('style.indent.preprocessorIgnored', true),
        styleIndentRegionIgnored: false, //cfg.get('style.indent.regionIgnored', false),
        styleIndentSwitchCaseIgnored: false, //cfg.get('style.indent.switchCaseIgnored', false),
        styleBracesOnSameLine: true,//cfg.get('style.braces.onSameLine', true),
        styleBracesAllowInlines: true, //cfg.get('style.braces.allowInlines', true),
        styleSpacesBeforeParenthesis: true,//cfg.get('style.spaces.beforeParenthesis', true),
        styleSpacesAfterParenthesis: true, //cfg.get('style.spaces.afterParenthesis', true),
        styleSpacesBeforeIndexerBracket: true,//cfg.get('style.spaces.beforeIndexerBracket', true),
        styleSpacesBeforeBracket: false,//cfg.get('style.spaces.beforeBracket', false),
        styleSpacesAfterBracket: true,//cfg.get('style.spaces.afterBracket', true),
        styleSpacesInsideEmptyParenthis: false,//cfg.get('style.spaces.insideEmptyParenthis', false),
        styleSpacesInsideEmptyBraces: true,//cfg.get('style.spaces.insideEmptyBraces', true),
        styleSpacesInsideEmptyBrackets: false, //cfg.get('style.spaces.insideEmptyBrackets', false),
        styleSpacesRemoveAfterCommandBeforeParenthesis: '', //cfg.get('style.spaces.removeAfterCommandBeforeParenthesis', ''),
        styleOperatorsOnSameLine: true //cfg.get('style.operators.onSameLine', true)
    };
};
