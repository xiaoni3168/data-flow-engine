/**
 * ETL 矩形操作
 */
import * as d3 from 'd3';
import { event } from 'd3-selection';
import noevent from './D3Diagram.NoEvent';
import store from '../../vuex';
import { UI } from './config';
import { datasetSource } from '../../components/etl/config/dataset.icon.config';
import * as D3Line from './D3Diagram.Line';
import * as D3Util from './D3Diagram.Utils';

// 操作类配置
const operation = {
    join: {
        type: 'join',
        icon: '#icon-etl-joindata'
    },
    appendrow: {
        type: 'appendrow',
        icon: '#icon-etl-appendrows'
    },
    groupby: {
        type: 'groupby',
        icon: '#icon-etl-groupby'
    },
    calculatedfield: {
        type: 'calculatedfield',
        icon: '#icon-etl-calculatedfield'
    },
    selectcolumn: {
        type: 'selectcolumn',
        icon: '#icon-etl-selectcolumn'
    },
    collapsecolumn: {
        type: 'collapsecolumn',
        icon: '#icon-etl-collapsecolumn'
    },
    code: {
        type: 'code',
        icon: '#icon-edit'
    }
};
// 数据源dataset配置
const dataset = {
    dataset: {
        type: 'dataset',
        icon: '#icon-etl-dataset'
    }
};

let vTime = 0;

export function rect (configs = [], func = {}, tableMap) {
    const _this = this;

    d3.select('div.etl-empty').remove();

    let vTime   = 0,    // 计算元素 mousedown 和 mouseup 事件的timeStamp差值，用来模拟 click 事件(vTime < 300ms)
        domMap  = {},
        rectData;       // 画布上所有rect元素数据

    tableMap = tableMap ? tableMap : store.getters['etl/ETLTable'];

    rectData = this.instance
        .selectAll('g[data-uid]')
        .data(configs)
        .enter()
        .append('g')
        .attr('data-uid',       d => d.uid)
        .on('mouseover', d => {
            d3.select(`g[data-uid="${d.uid}"]`).select('use.icon-close').style('display', 'block');
        })
        .on('mouseleave', d => {
            d3.select(`g[data-uid="${d.uid}"]`).select('use.icon-close').style('display', 'none');
        })
        .append('rect')
        /** rect元素绘制 */
        .attr('x',              d => d.x)
        .attr('y',              d => d.y)
        .attr('data-uid',       d => d.uid)
        .attr('height',         UI.RECT.HEIGHT)
        .attr('width',          UI.RECT.WIDTH)
        .attr('rx',             UI.RECT.RX)
        .attr('ry',             UI.RECT.RY)
        .attr('fill',           UI.RECT.DEFAULT_FILL)
        .attr('stroke',         UI.RECT.DEFAULT_STROKE)
        .attr('stroke-width',   UI.RECT.DEFAULT_STROKE_WIDTH)
        /** rect元素连接点绘制 */
        .each(d => drawHook.call(this, d))
        /** rect元素icon绘制 */
        .each(d => drawIcon.call(this, d, tableMap))
        .each(d => drawText.call(this, d, tableMap))
        /** rect元素上 mouseup 事件(用于：连线) */
        .on('mouseup', function (d) { rectMouseUp.call(this, d, _this); })
        .on('mouseover', function (d) { rectMouseOver.call(this, d, _this); })
        .on('mouseleave', function (d) { rectMouseLeave.call(this, d, _this); })
        /** rect元素添加到画布的动画效果添加 */
        .classed('animated jelly', true)
        .attr('style',          d => {
            return `transform-origin: ${d.x + UI.RECT.WIDTH / 2}px ${d.y + UI.RECT.HEIGHT / 2}px;-moz-transform-origin: ${d.x + UI.RECT.WIDTH / 2}px ${d.y + UI.RECT.HEIGHT / 2}px;`;
        });

    configs.forEach(d => {
        domMap[d.uid] = d;
    });
    store.dispatch('etl/setETLDomMap', domMap);

    /** rect元素拖拽事件 */
    rectData.call(
        this.$d3
            .drag()
            .on('start',    function (d) { dragstarted.call(this, d, _this); })
            .on('drag',     function (d) { draged.call(this, d, _this); })
            .on('end',      function (d) { dragended.call(this, d, _this); })
        );

    return this.instance;
}
/**
 * 移动选中的元素
 * @param  {[type]} d         [description]
 * @param  {[type]} poi       [description]
 * @param  {[type]} animation [description]
 * @return {[type]}           [description]
 */
export function moveRect (d, poi, animation = 0) {
    /** rect元素在画布上拖拽重绘 */
    d3.select(`rect[data-uid="${d.uid}"]`).transition().duration(animation).attr('x', d.x = poi.x).attr('y', d.y = poi.y);

    /** rect元素的output在画布上拖拽重绘 */
    d3.select(`circle[bind-uid="${d.uid}"]`).transition().duration(animation).attr('cx', poi.x + UI.RECT.WIDTH).attr('cy', poi.y + UI.RECT.HEIGHT / 2);
    /** rect元素的input在画布上拖拽重绘 */
    d3.select(`path[bind-uid="${d.uid}"]`).transition().duration(animation).attr('d', `M ${poi.x - UI.HOOK.INPUT.WIDTH / 2} ${poi.y + UI.RECT.HEIGHT / 2 - UI.HOOK.INPUT.HEIGHT / 2} L ${poi.x + UI.HOOK.INPUT.WIDTH / 2} ${poi.y + UI.RECT.HEIGHT / 2} L ${poi.x - UI.HOOK.INPUT.WIDTH / 2} ${poi.y + UI.RECT.HEIGHT / 2 + UI.HOOK.INPUT.HEIGHT / 2} z`);

    /** rect元素的关闭按钮在画布上拖拽重绘 */
    d3.select(`use[bind-uid="${d.uid}"].icon-close`).transition().duration(animation).attr('x', poi.x + UI.RECT.WIDTH - UI.CLOSE.RELA_LEFT).attr('y', poi.y - UI.CLOSE.RELA_TOP);
    /** rect元素的icon在画布上拖拽重绘 */
    d3.select(`use[bind-uid="${d.uid}"].icon-dataset`).transition().duration(animation).attr('x', poi.x + (UI.RECT.WIDTH - UI.ICON.WIDTH) / 2).attr('y', poi.y + (UI.RECT.HEIGHT - UI.ICON.HEIGHT) / 2);

    // 线的拖动
    D3Line.moveLine.call(this, d, poi.x, poi.y, animation);
    // rect绑定数据的name拖动
    d3.select(`text[bind-uid="${d.uid}"]`).transition().duration(animation).attr('x', poi.x + UI.RECT.WIDTH / 2).attr('y', poi.y + UI.RECT.HEIGHT + 18);

    // warning的拖动
    d3.select(`g[data-uid="${d.uid}"]`).transition().duration(animation).select(`use.icon-warning`).attr('x', poi.x - 1).attr('y', poi.y - 1);

    /** 广播rect元素的拖拽事件 */
    this.dispatcher.call('rect_move', this, {data: d, event: poi});
}
/**
 * 向画布中添加一个rect元素
 * @param {[type]} rects    [description]
 * @param {[type]} tableMap [description]
 */
export function addRect (rects, tableMap) {
    let arr = [];
    this.instance.selectAll('rect[data-uid]').each(r => {
        arr.push(r);
    });

    rect.call(this, arr.concat(rects), null, tableMap);

    this.dispatcher.call('rect_added', this, { data: rects });

    clearAnimation.call(this);
}
export function deleteRect (d) {
    const _this = this;
    // todos 运行中状态，不能删除rect块(目前想监听dispatch的返回值来判断是否运行不能实现)
    if (d.isLoaded === 1) {
        return;
    }
    // dispatch rect的删除操作，在此处发出rect_delete事件，让外界可以拿到删除之前的数据
    this.dispatcher.call('rect_delete', _this, { data: d, event: event });
    /** 点击关闭按钮时删除所有绑定当前uid的svg元素 */
    d3.selectAll(`[bind-uid="${d.uid}"]`).each(function () {
        d3.select(this).remove();
    });

    d3.select(`[data-uid="${d.uid}"]`).remove();
    // 删除元素上输出线
    this.deleteLine(store.getters['etl/ETLLineMap'][d.uid]);
    // 删除元素上所有输入线
    d3.selectAll(`[out-uid="${d.uid}"]`).each(function () {
        _this.deleteLine(store.getters['etl/ETLLineMap'][d3.select(this).attr('in-uid')]);
    });

    if (this.instance.selectAll('*').empty()) {
        this.cleanCanvas();
    }

    // 删除存储的DOM数据
    store.dispatch('etl/deleteETLDom', d);
    // 删除绑定在rect上的table数据
    store.dispatch('etl/deleteETLTable', d.uid);
}
export function clearAnimation () {
    // 在添加一个元素到画布后，清除所有有元素的动画class，解决在Safari上后续操作导致触发animation效果
    // animated的animation-duration = 1s
    d3.timeout(() => {
        if (this.instance && this.instance.selectAll) {
            this.instance.selectAll('*').classed('animated jelly', false).style();
        }
    }, 1000);
}
function drawHook (d) {
    const _this = this;
    /** 绘制input和output */
    d3.set([...Object.keys(dataset), ...Object.keys(operation)])
        .has(d.type) ? d3.select(`g[data-uid="${d.uid}"]`)  // output
        .append('circle')
        .attr('bind-uid', d.uid)
        .attr('cx', d.x + UI.RECT.WIDTH)
        .attr('cy', d.y + UI.RECT.HEIGHT / 2)
        .attr('r', UI.HOOK.OUTPUT.RADIUS)
        .attr('fill', UI.HOOK.OUTPUT.DEFAULT_FILL)
        .attr('stroke', UI.HOOK.OUTPUT.DEFAULT_STROKE)
        .attr('stroke-width', UI.HOOK.OUTPUT.DEFAULT_STROKE_WIDTH)
        .classed('animated jelly', true)
        .on('mouseover', function () {
            if (!d3.select(`g[in-uid="${d.uid}"]`).empty()) {
                d3.select(this).classed('unabled', true);
            }
        })
        .on('mouseleave', function () {
            d3.select(this).classed('unabled', false);
        })
        /** 连线开始 */
        .on('mousedown', function () {
            noevent();

            /** 当前元素只允许一个输出 */
            if (d3.select(`g[in-uid="${d.uid}"]`).empty()) {
                _this.connecting = true;
                /** 创建鼠标连线 */
                _this.connector = _this.instance.append('g').attr('input-uid', d.uid);
                _this.connector
                    .selectAll('path.connector') // 此处加上.connector是为了让d3选择器选择一个空节点来填充数据
                    .data([{ x1: d.x + UI.RECT.WIDTH + 4, y1: d.y + UI.RECT.HEIGHT / 2, x2: d.x + UI.RECT.WIDTH + 4, y2: d.y + UI.RECT.HEIGHT / 2 }])
                    .enter()
                    .append('path')
                    .attr('d', function (_d) {
                        return `M ${_d.x1} ${_d.y1} L ${_d.x2} ${_d.y2}`;
                    })
                    .attr('fill', 'none')
                    .attr('stroke', '#5abeff')
                    .attr('stroke-width', 2)
                    .attr('input-uid', d.uid)
                    .style('pointer-events', 'none');
                /** 添加rect元素上连线point的connecting样式(标记为连接状态) */
                d3.select(this).classed('connecting', true);
            }
        })
        .style('-moz-transform-origin', `${d.x + UI.RECT.WIDTH / 2}px ${d.y + UI.RECT.HEIGHT / 2}px`)
        .style('transform-origin', `${d.x + UI.RECT.WIDTH / 2}px ${d.y + UI.RECT.HEIGHT / 2}px`) : void 0;

    d3.set(Object.keys(operation))
        .has(d.type) ? d3.select(`g[data-uid="${d.uid}"]`)  // input
        .append('path')
        .attr('bind-uid', d.uid)
        .attr('d', `M ${d.x - UI.HOOK.INPUT.WIDTH / 2} ${d.y + UI.RECT.HEIGHT / 2 - UI.HOOK.INPUT.HEIGHT / 2} L ${d.x + UI.HOOK.INPUT.WIDTH / 2} ${d.y + UI.RECT.HEIGHT / 2} L ${d.x - UI.HOOK.INPUT.WIDTH / 2} ${d.y + UI.RECT.HEIGHT / 2 + UI.HOOK.INPUT.HEIGHT / 2} z`)
        .attr('fill', UI.HOOK.INPUT.DEFAULT_FILL)
        .attr('stroke', UI.HOOK.INPUT.DEFAULT_STROKE)
        .attr('stroke-width', UI.HOOK.INPUT.DEFAULT_STROKE_WIDTH)
        .classed('animated jelly', true)
        .on('mouseover', function () {
            if (_this.connecting) {
                if(d3.select(`path[bind-uid="${d.uid}"]`).empty() || D3Line.checkLineConnectable.call(_this, d)) {
                    d3.select(this).classed('connecting-unabled', true);
                }
            }
        })
        /** 连线终止 */
        .on('mouseup', function () {
            if (_this.connecting) {
                if (d3.select(this).classed('connecting-unabled')) {
                    d3.select(this).classed('connecting-unabled', false);
                } else if (_this.connector.attr('input-uid') != d.uid) {
                    D3Line.drawLineToCanvas.call(_this, d);
                }
            }
        })
        .on('mouseleave', function () {
            if (_this.connecting) {
                d3.select(this).classed('connecting-unabled', false);
            }
        })
        .style('-moz-transform-origin', `${d.x + UI.RECT.WIDTH / 2}px ${d.y + UI.RECT.HEIGHT / 2}px`)
        .style('transform-origin', `${d.x + UI.RECT.WIDTH / 2}px ${d.y + UI.RECT.HEIGHT / 2}px`) : void 0;
    /** 将鼠标画线事件添加到画布 MouseEvent 的事件调用栈中 */
    _this.setMouseMoveFunc(drawLineMove);
    _this.setMouseUpFuncs(drawLineUp);
    /** 绘制关闭按钮 */
    d3.select(`g[data-uid="${d.uid}"]`)
        .append('use')
        .attr('bind-uid', d.uid)
        .attr('x', d.x + UI.RECT.WIDTH - UI.CLOSE.RELA_LEFT)
        .attr('y', d.y - UI.CLOSE.RELA_TOP)
        .attr('height', UI.CLOSE.HEIGHT)
        .attr('width', UI.CLOSE.WIDTH)
        .attr('xlink:href', '#icon-delete')
        .classed('icon-close', true)
        .style('display', 'none')
        .on('click', function () {
            deleteRect.call(_this, d);
        });
}
/**
 * 绘制rect元素icon
 * @param  {[type]} d [description]
 * @return {[type]}   [description]
 */
function drawIcon (d, tableMap) {
    // 绑定在rect上的数据
    let data = tableMap[d.uid];
    if (d.type == 'dataset') { // 绘制dataset元素icon
        // 绘制rect
        d3.select(`g[data-uid="${d.uid}"]`)
            .append('use')
            .attr('bind-uid', d.uid)
            .attr('x', d.x + (UI.RECT.WIDTH - UI.ICON.WIDTH) / 2)
            .attr('y', d.y + (UI.RECT.HEIGHT - UI.ICON.HEIGHT) / 2)
            .attr('height', UI.ICON.HEIGHT)
            .attr('width', UI.ICON.WIDTH)
            .attr('fill', data && data.tableSourceCode == 'dataflow' ? UI.ICON.ACTIVED_FILL : UI.ICON.DEFAULT_FILL)
            .attr('xlink:href', data ? datasetSource[data.tableSourceCode] : dataset[d.type].icon)
            .classed('icon-dataset', true)
            .classed('animated jelly', true)
            .attr('style', `transform-origin: ${d.x + UI.RECT.WIDTH / 2}px ${d.y + UI.RECT.HEIGHT / 2}px;-moz-transform-origin: ${d.x + UI.RECT.WIDTH / 2}px ${d.y + UI.RECT.HEIGHT / 2}px;`)
    }


    if (Object.keys(operation).indexOf(d.type) > -1) {
        let data = tableMap[d.uid];
        d3.select(`g[data-uid="${d.uid}"]`)
            .append('use')
            .attr('bind-uid', d.uid)
            .attr('x', d.x + (UI.RECT.WIDTH - UI.ICON.WIDTH) / 2)
            .attr('y', d.y + (UI.RECT.HEIGHT - UI.ICON.HEIGHT) / 2)
            .attr('height', UI.ICON.HEIGHT)
            .attr('width', UI.ICON.WIDTH)
            .attr('fill', data && !d.error ? UI.ICON.ACTIVED_FILL : UI.ICON.DEFAULT_FILL)
            .attr('xlink:href', operation[d.type].icon)
            .classed('icon-dataset', true)
            .classed('animated jelly', true)
            .attr('style', `transform-origin: ${d.x + UI.RECT.WIDTH / 2}px ${d.y + UI.RECT.HEIGHT / 2}px;-moz-transform-origin: ${d.x + UI.RECT.WIDTH / 2}px ${d.y + UI.RECT.HEIGHT / 2}px;`)
    }
}
function drawText (d, tableMap) {
    let data = tableMap[d.uid];

    d3.select(`g[data-uid="${d.uid}"]`)
        .append('text')
        .attr('x', d.x + UI.RECT.WIDTH / 2)
        .attr('y', d.y + UI.RECT.HEIGHT + 18)
        .attr('bind-uid', d.uid)
        .attr('font-size', UI.TEXT.FONT_SIZE)
        .attr('fill', UI.TEXT.DEFAULT_FILL)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .text(data ? data.name : d.name);
}
/**
 * 鼠标连线在画布上移动时动态更新连线
 * @return {[type]} [description]
 */
function drawLineMove (D3) {
    if (D3.connecting) {
        D3.connector.select('path').attr('d', function (_d) {
            // return `M ${_d.x1} ${_d.y1} L ${_d.x2 = _this.getCoords(event, -4).x} ${_d.y2 = _this.getCoords(event).y}`;
            return D3Line.calculateLine({
                p1: {
                    x: _d.x1,
                    y: _d.y1
                },
                p2: {
                    x: _d.x2 = D3.getCoords(event, -4).x,
                    y: _d.y2 = D3.getCoords(event).y
                }
            });
        });
    }
}

/**
 * 鼠标连线在画布上松开按键时删除当前连线(视为连线不成功)
 * @return {[type]} [description]
 */
function drawLineUp (D3) {
    if (D3.connecting) {
        /** 去掉rect元素上连线point的connecting样式(标记为非连接状态) */
        d3.select(`circle[bind-uid="${D3.connector.attr('input-uid')}"]`).classed('connecting', false);
        /** 清空鼠标连线 */
        D3.connector.remove();
        D3.connector = null;
        D3.connecting = false;
    }
}
/**
 * 鼠标在rect元素上抬起时，绘制连线
 * @param  {[type]} d [description]
 * @return {[type]}   [description]
 */
function rectMouseUp (d, D3) {
    if (D3.connecting) {
        if (d3.select(this).classed('connecting-unabled')) {
            d3.select(this).classed('connecting-unabled', false);
        } else if (D3.connector.attr('input-uid') != d.uid) {
            D3Line.drawLineToCanvas.call(D3, d);
            d3.select(this).classed('connecting-abled', false);
        }
    }
}
/**
 * 鼠标移动到rect元素上时，处理事件
 * @param  {[type]} d [description]
 * @return {[type]}   [description]
 */
function rectMouseOver (d, D3) {
    if (D3.connecting) {
        if(d3.select(`path[bind-uid="${d.uid}"]`).empty() || D3Line.checkLineConnectable.call(D3, d)) {
            d3.select(this).classed('connecting-unabled', true);
        } else {
            d3.select(this).classed('connecting-abled', true);
        }
    }
}
/**
 * 鼠标离开rect元素时，处理事件
 * @param  {[type]} d [description]
 * @return {[type]}   [description]
 */
function rectMouseLeave (d, D3) {
    if (D3.connecting) {
        d3.select(this).classed('connecting-unabled', false);
        d3.select(this).classed('connecting-abled', false);
    }
}
/**
 * 元素拖拽 - start
 * @param  {[type]} d [description]
 * @return {[type]}   [description]
 */
function dragstarted (d, D3) {
    d3.select(`g[data-uid="${d.uid}"]`).raise().selectAll('*').classed('animated jelly', false);

    vTime = event.sourceEvent.timeStamp;
}
/**
 * 元素拖拽 - drag
 * @param  {[type]} d [description]
 * @return {[type]}   [description]
 */
function draged (d, D3) {
    if (d3.select(this).classed('cliped')) {
        d3.selectAll('.cliped')
            .each(_d => {
                moveRect.call(D3, _d, D3Util.relativeRect(d, _d, event));
            });
    } else {
        moveRect.call(D3, d, event);
    }
}
/**
 * 元素拖拽 - end
 * @param  {[type]} d [description]
 * @return {[type]}   [description]
 */
function dragended (d, D3) {
    /** 去掉rect元素的拖动样式 */
    d3.select(this).classed('dragging', false);

    /** 模拟rect元素上的click事件 */
    if (event.sourceEvent.timeStamp - vTime < 200) {
        // clip事件
        if (D3.D3KeyEvent.shiftKey) {
            d3.select(this).classed('cliped', !d3.select(this).classed('cliped'));
            return;
        }
        // 点击元素事件
        D3.dispatcher.call('rect_click', D3, {data: d, event: event, inUids: D3.getRectInputSourceData(d)});

        /** 点击之前初始化点击 */
        let active = store.getters['etl/ETLActiveUid'];
        if (active) {
            d3.select(`rect[data-uid="${active}"]`).classed('focused', false);
        }
        if (d3.select(this).classed('focused')) {
             d3.select(this).classed('focused', false);
             store.dispatch('etl/setActiveUid', '');
        } else {
             d3.select(this).classed('focused', true);
             store.dispatch('etl/setActiveUid', d);
        }
    }
}
