/*
 * Add comma Plug-in
 *
 * Licensed under the MIT License
 */
(function(PLUGIN_ID) {
    'use strict';

    // 設定値読み込み用変数
    var CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);

    // 設定値読み込み
    if (!CONFIG) {
        return false;
    }

    var tableFields = [];
    var subTableFieldsList = [];
    var tableChangeEvent = [];
    var fieldsChange = [];
    var fieldsInTableChange = [];
    var fieldsInTableChangeEvent = [];

    // プラグイン設定画面で選択したフィールド
    var targets = (CONFIG['fields']) ? CONFIG['fields'].split(',') : [];

    var windowTableFieldList = window.cybozu.data.page.SCHEMA_DATA.table.fieldList;
    var windowSubTable = window.cybozu.data.page.SCHEMA_DATA.subTable;

    for (var i = 0; i < targets.length; i++) {
        if (targets[i].indexOf('.') == -1) {
            for (var key in windowTableFieldList) {
                if (windowTableFieldList[key].var == targets[i]) {
                    fieldsChange.push('app.record.create.change.' + targets[i]);
                    fieldsChange.push('app.record.edit.change.' + targets[i]);
                    tableFields.push(windowTableFieldList[key]);
                }
            }
        } else {
            for (var key in windowSubTable) {
                if (windowSubTable[key].var == targets[i].split('.')[0]) {
                    tableChangeEvent.push('app.record.create.change.' + targets[i].split('.')[0]);
                    tableChangeEvent.push('app.record.edit.change.' + targets[i].split('.')[0]);
                    var changeObj = {};
                    changeObj[targets[i].split('.')[1]] = targets[i].split('.')[0];
                    fieldsInTableChange.push(changeObj);
                    for (var field in windowSubTable[key].fieldList) {
                        if (windowSubTable[key].fieldList[field].var == targets[i].split('.')[1]) {
                            windowSubTable[key].fieldList[field]["subTable"] = windowSubTable[key].var;
                            subTableFieldsList.push(windowSubTable[key].fieldList[field]);
                        }
                    }
                }
            }
        }
    }

    for (var i = 0; i < fieldsInTableChange.length; i++) {
        for (var key in fieldsInTableChange[i]) {
            fieldsInTableChangeEvent.push('app.record.create.change.' + key);
            fieldsInTableChangeEvent.push('app.record.edit.change.' + key);
        }
        
    }

    var init = function () {

        $(document).ready(function () {
            for (var i = 0; i < tableFields.length; i++) {
                var kintoneInput = $('.field-' + tableFields[i].id).find('input')[0];
                var pluginInput = $(kintoneInput).clone();
                $(kintoneInput).hide();
                $(pluginInput).removeAttr('id');
                $(pluginInput).val(formatCurrency($(pluginInput).val()));
                $(pluginInput).attr('id', tableFields[i].var);
                $(pluginInput).addClass('comma-plugin-input');
                $($(kintoneInput).parent()).append(pluginInput);
                $(pluginInput).change(function (event) {
                    var txtValue = $(this).val();
                    $(this).val(formatCurrency($(this).val()));
                    var dataSet = kintone.app.record.get();
                    var record = dataSet.record;
                    record[$(this).attr('id')].value = formatNumber(txtValue);
                    kintone.app.record.set(dataSet);
                    return event;
                });
            }
            for (var i = 0; i < subTableFieldsList.length; i++) {
                $('.field-' + subTableFieldsList[i].id).each(function(index){
                    var kintoneInput = $(this).find('input')[0];
                    var pluginInput = $(kintoneInput).clone();
                    $(kintoneInput).hide();
                    $(pluginInput).removeAttr('id');
                    $(pluginInput).addClass('comma-plugin-input');
                    $(pluginInput).val(formatCurrency($(pluginInput).val()));
                    $(pluginInput).attr('id', subTableFieldsList[i].subTable + '-' +subTableFieldsList[i].var + '-' + index);
                    $($(kintoneInput).parent()).append(pluginInput);
                    $(pluginInput).focusout(function () {
                        var dataSet = kintone.app.record.get();
                        var record = dataSet.record;
                        record[$(this).attr('id').split('-')[0]].value[index].value[$(this).attr('id').split('-')[1]].value = formatNumber($(this).val());
                        kintone.app.record.set(dataSet);
                        $(this).val(formatCurrency($(this).val()));

                    });
                });
            }
        });
    }

    // カンマ桁区切りをする関数
    function formatCurrency(number) {
        var isMinus = false;
        if (!number || number == '' || number == 'NaN') {
            return number;
        }
        var n = formatNumber(number);

        if (!$.isNumeric(n)) {
            return n;
        }
        if ((n * 1) < 0) {
            isMinus = true;
            n = n.substring(1, n.length);
        }
        if (n && n != '') {
            n = n.split('').reverse().join("");
            var n2 = n.replace(/\d\d\d(?!$)/g, "$&,");  
            if (isMinus) {
                return  '-' + (n2.split('').reverse().join(''));
            } else {
                return n2.split('').reverse().join('');
            }
            
        } else {
            return n;
        }
        
    }

    // イベントでカンマを削除する関数
    var formatNumber = function (number) {
        if (!number || number == '' || number == 'NaN') {
            return number;
        }
        var n = number;
        
        if (n && n.indexOf(",") != -1) {
            n = n.split(",").join("");
        }
        if ($.isNumeric(n)) {
            return parseInt(n) + '';
        }
        return number;
    }

    kintone.events.on(tableChangeEvent, function (event) {
        var tableChange = event.type.split('.')[event.type.split('.').length - 1];
        for (var i = 0; i < subTableFieldsList.length; i++) {
            if (subTableFieldsList[i].subTable == tableChange) {

                $('.field-' + subTableFieldsList[i].id).each(function (index) {
                    if ($(this).find('input').length == 1) {
                        var kintoneInput = $(this).find('input')[0];
                        var pluginInput = $(kintoneInput).clone();
                        $(kintoneInput).hide();
                        $(pluginInput).removeAttr('id');
                        $(pluginInput).addClass('comma-plugin-input');
                        $(pluginInput).val(formatCurrency($(pluginInput).val()));
                        $(pluginInput).attr('id', subTableFieldsList[i].subTable + '-' + subTableFieldsList[i].var + '-' + index);
                        $($(kintoneInput).parent()).append(pluginInput);
                        $(pluginInput).focusout(function () {
                            var dataSet = kintone.app.record.get();
                            var record = dataSet.record;
                            record[$(this).attr('id').split('-')[0]].value[index].value[$(this).attr('id').split('-')[1]].value = formatNumber($(this).val());
                            kintone.app.record.set(dataSet);
                            $(this).val(formatCurrency($(this).val()));
                        });
                    } 
                });

            }
        }
        return event;
    });

    // kintone.events.on(['app.record.create.change.chinhhk'], function (event) {
    //     var field = event.type.split('.')[event.type.split('.').length - 1];
    //     $('#'+field).val(formatCurrency(event.record[field].value));
    //     return event;
    // });

    kintone.events.on(fieldsInTableChangeEvent, function (event) {
        var field = event.type.split('.')[event.type.split('.').length - 1];
        for (var i = 0; i < fieldsInTableChange.length; i++) {
            for (var key in fieldsInTableChange[i]) {
                if (key == field) {
                    var tableHaveField = fieldsInTableChange[i][key];
                    for (var j = 0; j < event.record[tableHaveField].value.length; j++) {
                        $('#' + tableHaveField + '-' + field + '-' + j).val(formatCurrency(event.record[tableHaveField].value[j].value[field].value));
                    }
                }
            }
        }
        return event;
    });

    kintone.events.on([
        "app.record.create.show",
        "app.record.edit.show"
    ], function(event) {
        init();
        return event;
    });

    

})(kintone.$PLUGIN_ID);