/**
 * ETL流程图绘制工具
 *
 * 该方法在项目初始化的时候写入plugin
 * 可通过 this.D3Diagram 访问
 *
 */
import { event } from 'd3-selection';
import _ from 'lodash';
import { datasetSource as etldDatasetSource } from '../../components/etl/config/dataset.icon.config';
import { UI } from './config';
import store from '../../vuex';
import KeyEvent from './D3Diagram.KeyEvent';
import MouseEvent from './D3Diagram.MouseEvent';
import * as D3Util from './D3Diagram.Utils';
import * as D3Rect from './D3Diagram.Rect';
import * as D3Line from './D3Diagram.Line';

const Velocity = require('velocity-animate/velocity');

export default class D3Diagram {
    constructor ($d3) {
        this.$d3                = $d3;      // d3
        /** 注册事件 */
        this.dispatcher = this.$d3.dispatch(
            'onload',
            'rect_added',
            'rect_click',
            'rect_move',
            'rect_delete',
            'line_click',
            'line_connected',
            'line_delete'
        );

        this.resetContext();
    }

    /**
     * 初始化（销毁）画布的所有properties
     */
    resetContext () {
        this.instance           = null;     // 工具实例(单例)
        /** 连线相关变量 */
        this.connecting         = false;    // 当前画布上是否有连线事件
        this.connector          = null;     // 当前画布上正在连接的线 (type: d3.selector)

        this.dom                = '';
        this.config             = null;

        /** 画布绝对位置偏移量 */
        this.containerLeft      = 0;
        this.containerTop       = 0;

        /** 画布外边距的修正值 */
        this.outerLeft          = 0;
        this.outerTop           = 0;

        this.viewPercent        = 1;        // 画布放大比率
        this.isCanvasReadyToDrag= false;
        this.keyEvent           = true;     // 默认开启画布键盘事件
        this.pasteData          = null;

        this.D3KeyEvent         = null;
        this.D3MouseEvent       = null;

        this.rectIconMap        = {};
        this.rectLastState      = {};

        // 数据source配置
        this.datasetSource = etldDatasetSource;
    }

    /**
     * 初始化画布
     * @param  {String} dom        初始化元素selector
     * @param  {Object} config     配置
     * @return {undefined}
     */
    init ({ dom, config = {} }) {
        const _this = this;

        this.dom = dom;
        this.config = config;

        /** 初始化获取画布的绝对位置偏移量 */
        this.containerLeft = this.$d3.select(dom).node().offsetLeft + this.outerLeft;
        this.containerTop = this.$d3.select(dom).node().offsetTop + this.outerTop;

        /** 添加画布resize的监听 */
        this.containerResize(dom, config);

        /** 初始化工具实例 */
        this.instance = this.$d3
                            .select(dom)
                            .append('svg')
                            .attr('tabindex', -1)
                            // .style('transform', `translate(${-this.containerLeft}px, ${-this.containerTop}px)`);

        this.initViewbox(dom, config);

        this.D3KeyEvent = new KeyEvent(this);
        this.D3KeyEvent.init();

        /** 画布的拖拽 */
        this.D3MouseEvent = new MouseEvent(this.instance, this);
        this.D3MouseEvent.init();

        /** 设置画布 */
        for (let [key, value] of Object.entries(config)) {
            this.instance.attr(key, value);
        }

        this.cleanCanvas();
        this.dispatcher.call('onload', this, true);
    }

    /**
     * 获取当前画布的实例instance
     * @return {instance}
     */
    getInstance () {
        return this.instance;
    }

    /**
     * 添加新的画布 mousedown 事件到画布 MouseEvent 的调用栈中
     * @param {Function} func mousedown事件
     */
    setMouseDownFuncs (func) {
        this.D3MouseEvent.addMouseDownStack(func);
    }

    /**
     * 添加新的画布 mouseup 事件到画布 MouseEvent 的调用栈中
     * @param {Function} func mouseup事件
     */
    setMouseUpFuncs (func) {
        this.D3MouseEvent.addMouseUpStack(func);
    }

    /**
     * 添加新的画布 mousemove 事件到画布 MouseEvent 的调用栈中
     * @param {Function} func mousemove事件
     */
    setMouseMoveFunc (func) {
        this.D3MouseEvent.addMouseMoveStack(func);
    }

    /**
     * 生成矩形
     * @param  {Array} config      配置
     * @param  {Object} func
     * @return {instance}
     */
    rect (configs = [], func = {}, tableMap) {
        D3Rect.rect.call(this, configs, func, tableMap);
    }

    /** 获取输入insource源数据
     * @param {Object} rectData rect data
     * @return {array} uid|uids
     */
    getRectInputSourceData (d) {
        let ids = [], _this = this;
        let uid = d.uid;
        const lines = this.instance
            .selectAll(`g[out-uid="${uid}"]`)
            .each(function () {
                ids.push(_this.$d3.select(this).attr('in-uid'));
            });
        return ids;
    }

    /**
     * 连线绘制
     * @param  {Array}  [configs=[]] [description]
     * @return {[type]}              [description]
     */
    line (configs = []) {
        D3Line.line.call(this, configs);
    }

    /**
     * 绑定事件
     * @param  {[type]}   type [description]
     * @param  {Function} cb   [description]
     * @return {[type]}        [description]
     */
    on (type, cb) {
        this.dispatcher.on(type, cb);
    }

    /**
     * 容器大小修改事件监听
     * @param  {[type]} dom [description]
     * @return {[type]}     [description]
     */
    containerResize (dom, config) {
        const _this = this;
        window.document.body.onresize = function () {
            let domHTML =  document.querySelector(dom);
            if (domHTML){
                _this.containerLeft = domHTML.offsetLeft + _this.outerLeft;
                _this.containerTop = domHTML.offsetTop + _this.outerTop;

                _this.setViewbox();
            }
        }
    }

    /**
     * 保存
     * @return {[type]} [description]
     */
    save () {
        let result = {
            rect: [],
            line: []
        };

        this.$d3.selectAll('rect[data-uid]').each(d => {
            result.rect.push(d);
        });

        this.$d3.selectAll('g[in-uid]').each(d => {
            result.line.push(d);
        });

        return result;
    }

    initViewbox (dom, config) {
        const _this = this;

        this.instance.attr('viewBox', `0 0 ${+config.width.split('%')[0] / 100 * this.$d3.select(dom).node().offsetWidth} ${+config.height.split('%')[0] / 100 * this.$d3.select(dom).node().offsetHeight}`);

        let wrapper     = this.$d3.select(dom).append('div').classed('resize-wrapper', true),
            resizeTip   = this.$d3.select(dom).append('div').classed('resize-tip', true).style('opacity', 0);

        let decreaseBTN = wrapper.append('div').classed('resize-wrapper_decrease', true).text('-').on('click', decrease),
            resetBTN    = wrapper.append('div').classed('resize-wrapper_reset', true).text(`${this.viewPercent * 100}%`),
            increaseBTN = wrapper.append('div').classed('resize-wrapper_increase', true).text('+').on('click', increase),
            timer       = 0;
        function decrease () {
            if (!_this.instance.selectAll('*').empty()) {
                _this.viewPercent -= 0.1;
                let label = (_this.viewPercent * 100).toFixed(0);

                label < 10 ? (label = 10, _this.viewPercent = 0.1) : '';

                resetBTN.text(`${label}%`);

                _this.setViewbox();

                // showResizeTip(label);
            }
        }

        function increase () {
            if (!_this.instance.selectAll('*').empty()) {
                _this.viewPercent += 0.1;
                let label = (_this.viewPercent * 100).toFixed(0);

                label > 500 ? (label = 500, _this.viewPercent = 5) : '';

                resetBTN.text(`${label}%`);

                _this.setViewbox();

                // showResizeTip(label);
            }
        }

        function showResizeTip (label) {
            resizeTip.text(`${label}%`);
            if (timer) {
                clearInterval(timer);
            }
            if (+label == 10 || +label == 190) {
                Velocity.animate(resizeTip.node(), { opacity: 0 }, 300);
            } else {
                Velocity.animate(resizeTip.node(), { opacity: 1 }, 700).then(() => {
                    timer = setInterval(() => {
                        Velocity.animate(resizeTip.node(), { opacity: 0 }, 500);
                        clearInterval(timer);
                    }, 1000);
                });
            }
        }
    }

    resetViewbox () {
        this.$d3.select('.resize-wrapper_reset').text('100%');
        this.viewPercent = 1;
        this.setViewbox();
    }

    setViewbox (direct) {
        let offsetWidth = +this.config.width.split('%')[0] / 100 * this.$d3.select(this.dom).node().offsetWidth;
        let offsetHeight = +this.config.height.split('%')[0] / 100 * this.$d3.select(this.dom).node().offsetHeight;
        let width = offsetWidth / this.viewPercent;
        let height = offsetHeight / this.viewPercent;
        if (direct) {
            this.instance.attr('viewBox', `${(offsetWidth - width) / 2} ${(offsetHeight - height) / 2} ${width} ${height}`);
        } else {
            this.instance.transition().duration(300).attr('viewBox', `${(offsetWidth - width) / 2} ${(offsetHeight - height) / 2} ${width} ${height}`);
        }
    }

    deleteLine (d) {
        D3Line.deleteLine.call(this, d);
    }

    getCoords (event, fix) {
        return D3Util.getCoords(fix, this.viewPercent, this.instance, this.containerLeft, this.containerTop, event);
    }

    cleanCanvas () {
        this.instance.selectAll('*').remove();
        this.$d3.select('div.etl-empty').remove();
        this.$d3
            .select(this.dom)
            .append('div')
            .classed('etl-empty', true)
            .text('Start your ETL now...');
    }

    /**
     * 画布销毁，初始化画布实例
     * @return {[type]} [description]
     */
    destroy () {
        console.log('%c[D3D]', 'color:#2888e5', 'Destroy D3 Diagram Successfully');
        this.D3MouseEvent.destroy();
        this.D3KeyEvent.destroy();
        this.resetContext();
    }

    /**
     * 往ui层上绑定数据，同时更新ui（icon、line）
     * @param  {[type]} d    [description]
     * @param  {[type]} data [description]
     * @param {Boolean} isAutoClick popbox自动应用，为true时，不需要移除错误提示/false时，需要移除
     * @return {[type]}      [description]
     */
    bindData (d, data, isAutoClick) {
        if (data) {
            if (d.type === 'dataset') {
                this.$d3.select(`use[bind-uid="${d.uid}"].icon-dataset`)
                    .attr('xlink:href', this.datasetSource[data.tableSourceCode])
                    .attr('fill', d.error ? UI.ICON.DEFAULT_FILL : UI.ICON.ACTIVED_FILL);
            } else {
                this.$d3.select(`use[bind-uid="${d.uid}"].icon-dataset`).attr('fill', UI.ICON.ACTIVED_FILL);
            }

            this.$d3
                .select(`g[in-uid="${d.uid}"]`)
                .select(`path[data-type="connector"]`)
                .attr('stroke-dasharray', function (_d) {
                    return _d.strokeDasharray = d.error ? UI.LINE.STORKE_DASH : 'none';
                });
            this.$d3
                .select(`g[data-uid="${d.uid}"]`)
                .select('text')
                .text(data.name);

            // 删除将tabledata打到rect数据上方法 -- 此处将数据移至vuex
            // store.dispatch('etl/updateETLDomMap', { ...store.getters['etl/ETLDOMMap'][d.uid], ...{ name: data.name } });

            // 移除元素上的warning
            if (!d.error && !isAutoClick) {
                this.removeWarningMark(d);
            }
        }
    }

    /**
     * 标记table的左右表顺序
     */
    markTable (d) {
        let markedData = store.getters['etl/ETLDOMMap'][d.inUID];
        if (this.$d3.select(`g[out-uid="${d.outUID}"]`).empty()) {
            markedData.markAsLeft = true;
            markedData.markAsRight = false;
        } else {
            markedData.markAsLeft = false;
            markedData.markAsRight = true;
        }
        store.dispatch('etl/updateETLDomMap', markedData);
    }

    /**
     * 关闭画布键盘事件
     * @return {[type]} [description]
     */
    disabledKeyEvent () {
        console.log('%c[D3D]', 'color:#2888e5', 'D3 KeyEvent Disabled');
        this.D3KeyEvent.disabledKeyEvent();
    }

    /**
     * 开启画布键盘事件
     * @return {[type]} [description]
     */
    enabledKeyEvent () {
        console.log('%c[D3D]', 'color:#2888e5', 'D3 KeyEvent Enabled');
        this.D3KeyEvent.enabledKeyEvent();
    }

    /**
     * 向画布中添加一个rect元素
     * @param {[type]} rects    [description]
     * @param {[type]} tableMap [description]
     */
    addRect (rects, tableMap) {
        D3Rect.addRect.call(this, rects, tableMap);
    }

    /**
     * 标记指定rect的警告信息
     * @param  {[type]} d   [description]
     * @param  {[type]} msg [description]
     * @return {[type]}     [description]
     */
    markRectWarning (d, msg) {
        const _this = this;
        // fix: mouseover事件初始化一次，msg不更新bug(每次重新生成warn标签)
        this.$d3
            .select(`g[data-uid="${d.uid}"]`)
            .selectAll('use.icon-warning')
            .remove();
        this.$d3
            .select(`g[data-uid="${d.uid}"]`)
            .selectAll('use.icon-warning')
            .data([{
                x: d.x - 1,
                y: d.y - 1,
                height: UI.WARNING.HEIGHT,
                width: UI.WARNING.WIDTH,
                fill: UI.WARNING.FILL,
                href: '#icon-etl-warning'
            }])
            .enter()
            .append('use')
            .attr('x'           , _d => _d.x)
            .attr('y'           , _d => _d.y)
            .attr('height'      , _d => _d.height)
            .attr('width'       , _d => _d.width)
            .attr('fill'        , _d => _d.fill)
            .attr('xlink:href'  , _d => _d.href)
            .classed('icon-warning', true)
            .on('mouseover', () => {
                let texts = D3Util.splitByLine(msg, 240, 12);
                let tipHeight = Math.ceil(texts.length * 9.5 + 18.5);
                let tipY = d.y + (d.y > tipHeight + 2 ? (-tipHeight - 2) : UI.RECT.HEIGHT + 2);

                let warningTip = this.$d3
                    .select(`g[data-uid="${d.uid}"]`)
                    .append('g');
                warningTip
                    .append('rect')
                    .attr('x', d.x - UI.RECT.WIDTH)
                    .attr('y', tipY + 2)
                    .attr('width', 258)
                    .attr('height', tipHeight)
                    .attr('rx', 4)
                    .attr('ry', 4)
                    .attr('fill', UI.WARNING.SHADOW_FILL)
                    .transition()
                    .styleTween('opacity', function () {
                        return _this.$d3.interpolateNumber(0, 1);
                    });
                warningTip
                    .append('rect')
                    .attr('x', d.x - UI.RECT.WIDTH)
                    .attr('y', tipY)
                    .attr('width', 258)
                    .attr('height', tipHeight)
                    .attr('rx', 4)
                    .attr('ry', 4)
                    .attr('fill', UI.WARNING.FILL)
                    .transition()
                    .styleTween('opacity', function () {
                        return _this.$d3.interpolateNumber(0, 1);
                    });
                D3Util.appendMultiText(
                    warningTip,
                    msg,
                    d.x + 10 - UI.RECT.WIDTH,
                    tipY + 6,
                    240,
                    UI.WARNING.FONT_COLOR,
                    12,
                    'Open Sans'
                );
            })
            .on('mouseleave', () => {
                this.$d3
                    .select(`g[data-uid="${d.uid}"]`)
                    .select('g')
                    .selectAll('*')
                    .transition()
                    .styleTween('opacity', function () {
                        return _this.$d3.interpolateNumber(1, 0);
                    })
                    .on('end', () => {
                        this.$d3.select(`g[data-uid="${d.uid}"]`).select('g').remove();
                    });
            });
    }

    /**
     * 移除warning标记
     * @param  {[type]} d [description]
     * @return {[type]}   [description]
     */
    removeWarningMark (d) {
        d && this.$d3
            .select(`g[data-uid="${d.uid}"]`)
            .select('use.icon-warning')
            .remove();
    }

    /**
     * 标记指定rect的错误信息
     * @param  {[type]} d             [description]
     * @param  {[type]} msg           [description]
     * @param  {Number} [duration=-1] [description]
     * @return {[type]}               [description]
     */
    markRectError (d, msg, duration = -1) {
        const _this = this;
        this.removeErrorMark(d);

        let texts = D3Util.splitByLine(msg, 240, 12);
        let tipHeight = Math.ceil(texts.length * 9.5 + 18.5);
        let tipY = d.y + (d.y > tipHeight + 2 ? (-tipHeight - 2) : UI.RECT.HEIGHT + 2);

        let errorTip = this.$d3
            .select(`g[data-uid="${d.uid}"]`)
            .append('g')
            .attr('error', d.uid);
        errorTip
            .append('rect')
            .attr('x', d.x - UI.RECT.WIDTH)
            .attr('y', tipY + 2)
            .attr('width', 258)
            .attr('height', tipHeight)
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('fill', UI.ERROR.SHADOW_FILL)
            .transition()
            .styleTween('opacity', function () {
                return _this.$d3.interpolateNumber(0, 1);
            });
        errorTip
            .append('rect')
            .attr('x', d.x - UI.RECT.WIDTH)
            .attr('y', tipY)
            .attr('width', 258)
            .attr('height', tipHeight)
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('fill', UI.ERROR.FILL)
            .transition()
            .styleTween('opacity', function () {
                return _this.$d3.interpolateNumber(0, 1);
            });
        D3Util.appendMultiText(
            errorTip,
            msg,
            d.x + 10 - UI.RECT.WIDTH,
            tipY + 6,
            240,
            UI.ERROR.FONT_COLOR,
            12,
            'Open Sans'
        );

        if (duration > -1) {
            errorTip
                .selectAll('*')
                .transition()
                .delay(duration)
                .styleTween('opacity', function () {
                    return _this.$d3.interpolateNumber(1, 0);
                })
                .on('end', () => {
                    this.removeErrorMark(d);
                });
        }
    }

    removeErrorMark (d) {
        d && this.$d3.select(`g[error="${d.uid}"]`).remove();
    }

    /**
     * 更新UI数据
     * @param  {[type]} d [description]
     * @return {[type]}   [description]
     */
    updateRect (d) {
        const _this = this;

        d && this.$d3
            .select(`g[data-uid="${d.uid}"]`)
            .each(function (_d) {
                _d = Object.assign(_d, d);

                let rect = _this.$d3.select(`use[bind-uid="${_d.uid}"].icon-dataset`);
                let tableData = store.getters['etl/ETLTable'][_d.uid];
                // 删除原有逻辑,变成固有逻辑，且处理线由出入线变成输出线
                // if (_d.error && _d.error.type !== 8) { // type=8 的特殊处理(输入源为2个的元素)
                //     _this.rectLastState[_d.uid] = {
                //         fill: rect.attr('fill'),
                //         strokeDasharray: []
                //     };
                //     // 根据数据模型上的错误信息更新rect的icon颜色
                //     rect.attr('fill', _d.error.type % 2 == 0 ? UI.ICON.DEFAULT_FILL : UI.ICON.ACTIVED_FILL);
                //     // 有错误的元素连线变成虚线
                //     _this.$d3
                //         .selectAll(`g[out-uid="${_d.uid}"]`)
                //         .each(function (l, i) {
                //             _this.rectLastState[_d.uid].strokeDasharray[i] = _this.$d3.select(this).select('path[data-type="connector"]').attr('stroke-dasharray');
                //             _this.$d3.select(this).select('path[data-type="connector"]').attr('stroke-dasharray', l.strokeDasharray = (_d.error.type % 2 == 0 ? UI.LINE.STORKE_DASH : 'none'));
                //         })
                // } else {
                //     if (_this.rectLastState[_d.uid]) {
                //         rect.attr('fill', _this.rectLastState[_d.uid].fill);
                //         _this.$d3
                //             .selectAll(`g[out-uid="${_d.uid}"]`)
                //             .each(function (l, i) {
                //                 _this.$d3.select(this).select('path[data-type="connector"]').attr('stroke-dasharray', l.strokeDasharray = _this.rectLastState[_d.uid].strokeDasharray[i]);
                //             });
                //         delete _this.rectLastState[_d.uid];
                //     }
                // }

                // 根据数据模型上的错误信息更新rect的icon颜色(note: rect有error或者table数据不存在，rect变浅，否则为深)
                rect.attr('fill', (!_d.error && tableData ) ? UI.ICON.ACTIVED_FILL : UI.ICON.DEFAULT_FILL);
                // 有错误的元素输出连线变成虚线(note: rect有error或者table数据不存在，line变虚，否则为实线)
                _this.$d3
                    .selectAll(`g[in-uid="${_d.uid}"]`)
                    .each(function (l, i) {
                        _this.$d3.select(this).select('path[data-type="connector"]').attr('stroke-dasharray', l.strokeDasharray = ((!_d.error && tableData) ? 'none' :  UI.LINE.STORKE_DASH));
                    })
                /** 处理rect上的icon UI变化 */
                if (rect.attr('xlink:href') !== '#icon-loading') {
                    _this.rectIconMap[_d.uid] = rect.attr('xlink:href');
                }
                if (_d.isLoaded == 1) {
                    rect.attr('xlink:href', '#icon-loading');
                } else {
                    rect.attr('xlink:href', _this.rectIconMap[_d.uid]);
                    delete _this.rectIconMap[_d.uid];
                }
                /** end */
                store.dispatch('etl/updateETLDomMap', _d);
            });
    }

    /**
     * 遍历所给元素后续所有相连接的rect元素
     * @param  {[type]} d    [description]
     * @param  {[type]} func [description]
     * @return {[type]}      [description]
     */
    recursiveNextRect (d, func) {
        const _this = this;

        let through = function (uid) {
            if (hasNext(uid)) {
                let nextD = getD(nextUID(uid));
                func.call(_this, nextD);
                through(nextD.uid);
            } else {
                return;
            }
        }

        let hasNext = function (uid) {
            return !!store.getters['etl/ETLLineMap'][uid];
        }

        let nextUID = function (uid) {
            return store.getters['etl/ETLLineMap'][uid].outUID;
        }

        let getD = function (uid) {
            return store.getters['etl/ETLDOMMap'][uid];
        }

        through(d.uid);
    }

    /**
     * 根据所给的名称prefix获得当前可用名称
     * @param  {[type]} preName [description]
     * @return {[type]}         [description]
     */
    getName (preName) {
        let index = D3Util.getNameIndex(preName, store.getters['etl/ETLDOMMap']);

        return index ? `${preName}_${index}` : preName;
    }

    /**
     * 清除画布的动画效果
     * @return {[type]} [description]
     */
    clearAnimation () {
        D3Rect.clearAnimation.call(this);
    }
}
