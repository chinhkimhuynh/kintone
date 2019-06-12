/*
 * checkvalue Plug-in
 * Copyright (c) 2017 Cybozu
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();

(function($, PLUGIN_ID) {
    'use strict';

    // プラグインIDの設定
    var KEY = PLUGIN_ID;
    var CONF = kintone.plugin.app.getConfig(KEY);
    var fields = [];

    function escapeHtml(htmlstr) {
        return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/'/g, '&quot;').replace(/'/g, '&#39;');
    };

    function addRow(target) {
        return addRowExec($(target).parent().parent());
    };

    function addRowExec(after) {
        if (!after) {
            return null;
        }
        var r = $('#row_0').clone();
        r.attr('id', 'row_' + (new Date()).getTime());
        after.after(r);
        r.find('.kintoneplugin-button-add-row-image').on('click', function(e) {
            addRow(e.target);
        });
        r.find('.kintoneplugin-button-remove-row-image').on('click', function(e) {
            removeRow(e.target);
        });
        return r;
    }

    function removeRow(target) {
        var r = $(target).parent().parent();
        if (r.attr('id') != 'row_0') {
            r.remove();
        }
    };

    function init() {
        if (CONF) {
            var v = [];
            if (CONF['fields']) {
                v = CONF['fields'].split(',');
            }
        }
        for (var i = 0; i < v.length; i++) {
            var r = null;
            if (i == 0) {
                r = $('#row_0');
            } else {
                r = addRowExec($('#plugin_field_box .kintoneplugin-row:last'));
            }
            r.find('.target-field-code').val(v[i]);
        }
    };

    function getFields(onComplete) {
        // フォーム設計情報を取得し、選択ボックスに代入する
        kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', { 'app': kintone.app.getId() }, function(resp) {
            for (var i in resp.properties) {
                var prop = resp.properties[i];

                switch (prop.type) {
                    // 文字列と数値が対象(変更前イベントの対象、テキスト入力可能)
                    case 'SINGLE_LINE_TEXT':
                        break;
                    case 'CALC':
                        fields.push({
                            'parentCode': '',
                            'value': escapeHtml(prop.code),
                            'text': escapeHtml(prop.label)
                        });
                        break;
                    case 'NUMBER':
                        fields.push({
                            'parentCode': '',
                            'value': escapeHtml(prop.code),
                            'text': escapeHtml(prop.label)
                        });
                        break;
                    case 'SUBTABLE' :
                        for (var j in prop.fields) {
                            if (prop.fields[j].type == 'NUMBER' || prop.fields[j].type == 'CALC') {
                                fields.push({
                                    'parentCode': prop.code,
                                    'value': escapeHtml(prop.fields[j].code),
                                    'text': escapeHtml(prop.fields[j].label)
                                });
                            }
                        }
                        break;
                    default:
                        break;
                }
            }
            //row_0のデータを生成する
            for (var i = 0; i < fields.length; i++) {
                // 初期値を設定する
                var $option = $('<option>');
                if (fields[i].parentCode == '') {
                    $option.attr('value', fields[i].value);
                    $option.text(fields[i].text + "( " + fields[i].value + " )");
                } else {
                    $option.attr('value', fields[i].parentCode + '.' + fields[i].value);
                    $option.text(fields[i].text + "( " + fields[i].parentCode + ' - ' + fields[i].value + " )");
                }
                
                $('#row_0 .target-field-code').append($option.clone());
            }
            //ボタン処理
            $('#row_0 .kintoneplugin-button-add-row-image').on('click', function(e) {
                addRow(e.target);
            });
            $('#row_0 .kintoneplugin-button-remove-row-image').on('click', function(e) {
                removeRow(e.target);
            });

            //初期化後の処理
            onComplete();
        });
    };

    $(document).ready(function() {
        //フィールドを取得
        getFields(init);

        // 「保存する」ボタン押下時に入力情報を設定する
        $('#check-plugin-submit').click(function() {
            var config = [];
            var fields = [];
            $("#plugin_field_box .target-field-code").each(function(i, elem) {
                var v = $(elem).val();
                if (v && fields.indexOf(v) < 0) {
                    fields.push(v);
                }
            });
            config['fields'] = fields.join(',');
            kintone.plugin.app.setConfig(config);
        });

        // 「キャンセル」ボタン押下時の処理
        $('#check-plugin-cancel').click(function() {
            history.back();
        });
    });

})(jQuery, kintone.$PLUGIN_ID);