/**
 * ETL画布键盘事件
 */
import * as d3 from 'd3';
import _ from 'lodash';
import { event } from 'd3-selection';
import noevent from './D3Diagram.NoEvent';
import { UI, KEY_MAP } from './config';
import store from '../../vuex';
import Utils from '../../utils/uuid.utils';
import * as D3Rect from './D3Diagram.Rect';
import * as D3Line from './D3Diagram.Line';

export default class KeyEvent {
    constructor (D3) {
        this.dom            = d3.select(document);
        this.commandKey     = false;
        this.shiftKey       = false;
        this.keyEvent       = true;
        this.pasteData      = null;
        this.keyMap         = null;
        this.functionStack  = {};
        this.D3             = D3;
    }

    init () {
        this.keyMap = KEY_MAP[this._getSystemName()];

        this.pasteData = document.createElement('textarea');
        // 修复生成dom占位bug
        this.pasteData.style.display = 'none';
        document.body.appendChild(this.pasteData);

        this._bindKeyUpEvent();
        this._bindKeyDownEvent();
    }

    destroy () {
        this.pasteData.remove();
        this.dom.on('keydown', null);
        this.dom.on('keyup', null)
    }

    bind (name, call = (() => {})) {
        this.functionStack[name] = call;
    }

    disabledKeyEvent () {
        this.keyEvent = false;
    }

    enabledKeyEvent () {
        this.keyEvent = true;
    }

    _bindKeyUpEvent () {
        this.dom.on('keyup', () => {
            if (this.keyEvent) {
                switch (event.code) {
                    case this.keyMap.Space:
                        this.D3.instance.classed('drag', false);
                        this.D3.isCanvasReadyToDrag = false;
                        break;
                    case this.keyMap.Command:
                    case this.keyMap.FFCommand:
                        this.commandKey = false;
                        break;
                    case this.keyMap.Shift:
                        this.shiftKey = false;
                        break;
                    default:
                        break;
                }
            }
        });
    }

    _bindKeyDownEvent () {
        this.dom.on('keydown', () => {
            if (this.keyEvent) {
                this.commandKey = {
                    Mac: event.metaKey,
                    Win: event.ctrlKey
                }[this._getSystemName()];

                this.pasteData.focus();

                switch (event.code) {
                    case this.keyMap.Equal:
                        noevent();
                        this.commandKey ? this._canvasZoomOut() : void 0;
                        break;
                    case this.keyMap.Minus:
                        noevent();
                        this.commandKey ? this._canvasZoomIn() : void 0;
                        break;
                    case this.keyMap.Digit0:
                        noevent();
                        this.commandKey ? this.D3.resetViewbox() : void 0;
                        break;
                    case this.keyMap.KeyA:
                        noevent();
                        this.commandKey ? this._selectAllRect() : void 0;
                        break;
                    case this.keyMap.KeyC:
                        noevent();
                        this.commandKey ? this._copyClipedData() : void 0;
                        break;
                    case this.keyMap.KeyV:
                        this.commandKey ? this._pasteClipedData() : void 0;
                        break;
                    case this.keyMap.ArrowRight:
                        noevent();
                        this.commandKey ? this._alignment2Right() : this._alignmentRect();
                        break;
                    case this.keyMap.ArrowLeft:
                        noevent();
                        this.commandKey ? this._alignment2Left() : this._alignmentRect();
                        break;
                    case this.keyMap.ArrowDown:
                        noevent();
                        this.commandKey ? this._alignment2Bottom() : this._alignmentRect();
                        break;
                    case this.keyMap.ArrowUp:
                        noevent();
                        this.commandKey ? this._alignment2Top() : this._alignmentRect();
                        break;
                    case this.keyMap.Delete:
                    case this.keyMap.Backspace:
                        noevent();
                        this.commandKey ? void 0 : this._deleteSelected();
                        break;
                    case this.keyMap.Space:
                        noevent();
                        this.commandKey ? void 0 : (
                            this.D3.instance.classed('drag', true),
                            this.D3.isCanvasReadyToDrag = true
                        );
                        break;
                    case this.keyMap.Shift:
                        noevent();
                        this.commandKey ? void 0 : this.shiftKey = true;
                        break;
                    default:

                }
            }
        });
    }

    _canvasZoomOut () {
        d3.select('.resize-wrapper_increase').node().click();
        d3.select('.resize-wrapper_increase').transition().duration(170).style('background-color', '#cccccc');
        d3.select('.resize-wrapper_increase').transition().delay(170).duration(170).style('background-color');
    }

    _canvasZoomIn () {
        d3.select('.resize-wrapper_decrease').node().click();
        d3.select('.resize-wrapper_decrease').transition().duration(170).style('background-color', '#cccccc');
        d3.select('.resize-wrapper_decrease').transition().delay(170).duration(170).style('background-color');
    }

    _selectAllRect () {
        d3.selectAll('rect[data-uid]').classed('jelly animated', false).classed('cliped', true);
    }

    _alignmentRect () {
        let active = store.getters['etl/ETLActiveUid'];

        if (active) {
            let rect    = d3.select(`rect[data-uid="${active}"]`).transition().duration(170),
                icon    = d3.select(`use[bind-uid="${active}"].icon-dataset`),
                output  = d3.select(`circle[bind-uid="${active}"]`),
                input   = d3.select(`path[bind-uid="${active}"]`),
                close   = d3.select(`use[bind-uid="${active}"].icon-close`),
                text    = d3.select(`text[bind-uid="${active}"]`);

            this.keyMap.ArrowUp     == event.code && rect.attr('y', d => (d.y = d.y % 5 == 0 ? d.y - 5 : d.y - d.y % 5 - 5));
            this.keyMap.ArrowRight  == event.code && rect.attr('x', d => (d.x = d.x % 5 == 0 ? d.x + 5 : d.x - d.x % 5 + 5));
            this.keyMap.ArrowDown   == event.code && rect.attr('y', d => (d.y = d.y % 5 == 0 ? d.y + 5 : d.y - d.y % 5 + 5));
            this.keyMap.ArrowLeft   == event.code && rect.attr('x', d => (d.x = d.x % 5 == 0 ? d.x - 5 : d.x - d.x % 5 - 5));

            rect.each(d => {
                // close.attr('x', d.x + UI.RECT.WIDTH - UI.CLOSE.RELA_LEFT).attr('y', d.y - UI.CLOSE.RELA_TOP);
                // output.attr('cx', d.x + UI.RECT.WIDTH).attr('cy', d.y + UI.RECT.HEIGHT / 2);
                // icon.attr('x', d.x + (UI.RECT.WIDTH - UI.ICON.WIDTH) / 2).attr('y', d.y + (UI.RECT.HEIGHT - UI.ICON.HEIGHT) / 2);
                // input.attr('d', `M ${d.x - UI.HOOK.INPUT.WIDTH / 2} ${d.y + UI.RECT.HEIGHT / 2 - UI.HOOK.INPUT.HEIGHT / 2} L ${d.x + UI.HOOK.INPUT.WIDTH / 2} ${d.y + UI.RECT.HEIGHT / 2} L ${d.x - UI.HOOK.INPUT.WIDTH / 2} ${d.y + UI.RECT.HEIGHT / 2 + UI.HOOK.INPUT.HEIGHT / 2} z`);
                // text.attr('x', d.x + UI.RECT.WIDTH / 2).attr('y', d.y + UI.RECT.HEIGHT + 18);
                D3Rect.moveRect.call(this.D3, d, { x: d.x, y: d.y }, 170);
                D3Line.moveLine.call(this, d, d.x, d.y, 170);
            });
        }
    }

    _alignment2Right () {
        let maxX = _.maxBy(d3.selectAll('.cliped').data(), 'x');

        d3.selectAll('.cliped')
            .each(d => {
                D3Rect.moveRect.call(this.D3, d, { x: maxX.x, y: d.y }, 300);
            });
    }

    _alignment2Left () {
        let minX = _.minBy(d3.selectAll('.cliped').data(), 'x');

        d3.selectAll('.cliped')
            .each(d => {
                D3Rect.moveRect.call(this.D3, d, { x: minX.x, y: d.y }, 300);
            });
    }

    _alignment2Bottom () {
        let maxY = _.maxBy(d3.selectAll('.cliped').data(), 'y');

        d3.selectAll('.cliped')
            .each(d => {
                D3Rect.moveRect.call(this.D3, d, { x: d.x, y: maxY.y }, 300);
            });
    }

    _alignment2Top () {
        let minY = _.minBy(d3.selectAll('.cliped').data(), 'y');

        d3.selectAll('.cliped')
            .each(d => {
                D3Rect.moveRect.call(this.D3, d, { x: d.x, y: minY.y }, 300);
            });
    }

    _deleteSelected () {
        let active = store.getters['etl/ETLActiveUid'];
        if (active) {
            D3Rect.deleteRect.call(this.D3, store.getters['etl/ETLDOMMap'][active]);
        }
        d3.selectAll('rect.cliped').each(d => {
            D3Rect.deleteRect.call(this.D3, d);
        });
    }

    _copyClipedData () {
        let uiData = { rect: [], line: [] }, tableData = [];
        d3.selectAll('.cliped').each(d => {
            uiData.rect.push(d);

            // 读取连接线数据
            d3.selectAll(`g[out-uid="${d.uid}"]`).each(l => {
                uiData.line.push(l);
            });

            // 读取table数据
            let table = store.getters['etl/ETLTable'][d.uid];
            if (table) {
                tableData.push({
                    uid: d.uid,
                    table: table
                });
            }
        });

        let hideData = document.createElement('textarea');
        // 修复生成dom占位bug
        hideData.style.display = 'none';
        document.body.appendChild(hideData);
        hideData.value = this._encodeCopyData({ uiData, tableData });
        hideData.select();
        document.execCommand('copy', false, null);
        hideData.remove();
    }

    _pasteClipedData () {
        setTimeout(() => {
            let copyData = this._decodeCopyData(this.pasteData.value);
            let replaceUIDMap = {}, replaceTableMap = {};

            if (copyData && copyData.uiData) {
                copyData.uiData.rect.forEach(d => {
                    replaceUIDMap[d.uid] = Utils.uuid();
                });
                let replaceString = JSON.stringify(copyData);
                for (let [key, value] of Object.entries(replaceUIDMap)) {
                    replaceString = replaceString.replace(new RegExp(key, 'g'), value);
                }
                copyData = JSON.parse(replaceString);
                // 存储新的table数据
                copyData.tableData.forEach(table => {
                    store.dispatch('etl/addETLTable', table);
                    replaceTableMap[table.uid] = table.table;
                });
                D3Rect.addRect.call(this.D3, copyData.uiData.rect, replaceTableMap);
                D3Line.line.call(this.D3, copyData.uiData.line, replaceTableMap);
            }
            this.pasteData.value = '';
        }, 100);
    }

    _emitClick () {
        let args = Array.from(arguments);

        this.functionStack[args.shift()].call(this, args);
    }

    _getSystemName () {
        const ua = window.navigator.userAgent;

        if (ua.indexOf('Macintosh') > -1) {
            return 'Mac';
        }
        if (ua.indexOf('Windows') > -1) {
            return 'Win';
        }
    }

    /**
     * encode复制的画布元素数据
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    _encodeCopyData (data) {
        return encodeURIComponent(JSON.stringify(data));
    }

    /**
     * decode复制的画布元素数据
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    _decodeCopyData (data) {
        let result = '';
        try {
            result = JSON.parse(decodeURIComponent(data));
        } catch (e) {
            //
        }
        return result;
    }
}
