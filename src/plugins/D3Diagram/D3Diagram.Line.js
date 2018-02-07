/**
 * ETL 连线操作
 */
import * as d3 from 'd3';
import { event } from 'd3-selection';
import { interpolatePath } from 'd3-interpolate-path';
import store from '../../vuex';
import { UI } from './config';

/**
 * 连线绘制
 * @param  {Array}  [configs=[]] [description]
 * @return {[type]}              [description]
 */
export function line (configs = []) {
    const _this = this;
    let lineData;

    lineData = this.instance
        .selectAll('g.connected')
        .data(configs)
        .enter()
        .append('g')
        .on('mouseover', function (d) {
            d3.select(this).select('use').style('display', 'block');
            d3.select(this).select('path[data-type="connector"]').transition().duration(170).attr('stroke-width', 2);
        })
        .on('mouseleave', function (d) {
            d3.select(this).select('use').style('display', 'none');
            d3.select(this).select('path[data-type="connector"]').transition().duration(170).attr('stroke-width', 1);
        })
        .attr('in-uid', d => d.inUID)
        .attr('out-uid', d => d.outUID)
        .each(function (d) {
            d3.select(this)
                .append('path')
                .attr('d', d => {
                    return calculateLine({
                        p1: { x: d.x1, y: d.y1 },
                        p2: { x: d.x2, y: d.y2 }
                    });
                })
                .attr('fill', 'none')
                .attr('stroke', '#999999')
                .attr('stroke-width', 15)
                .attr('stroke-opacity', 0)
                .attr('data-type', 'connector_cover');
            d3.select(this)
                .append('path')
                .attr('d', d => {
                    return calculateLine({
                        p1: { x: d.x1, y: d.y1 },
                        p2: { x: d.x2, y: d.y2 }
                    });
                })
                .attr('stroke-dasharray', d => d.strokeDasharray)
                .attr('fill', 'none')
                .attr('stroke', '#999999')
                .attr('stroke-width', 1)
                .attr('data-type', 'connector');
            d3.select(this)
                .append('use')
                .attr('x', (d.x2 - d.x1) / 2 + d.x1 - 8)
                .attr('y', (d.y2 - d.y1) / 2 + d.y1 - 8)
                .attr('fill', '#cccccc')
                .attr('height', 18)
                .attr('width', 18)
                .attr('xlink:href', '#icon-etl-delete')
                .style('display', 'none')
                .style('cursor', 'pointer')
                .on('mouseover', function () {
                    d3.select(this).transition().duration(170).style('fill', UI.CLOSE.HOVER_FILL);
                })
                .on('mouseleave', function () {
                    d3.select(this).transition().duration(170).style('fill', UI.CLOSE.DEFAULT_FILL);
                });
        })
        .lower()
        .on('click', function (d) {
            _this.dispatcher.call('line_click', _this, { data: d, event: event });
        });

    configs.forEach(line => {
        store.dispatch('etl/addETLLine', { inUID: line.inUID, outUID: line.outUID });
    });
}
/**
 * 检查连线是否允许
 * @param       {[type]} d [description]
 * @constructor
 * @return      {[type]}   [description]
 */
export function checkLineConnectable (d) {
    let check = false;

    if (!d3.selectAll(`g[out-uid="${d.uid}"]`).empty() && d3.selectAll(`g[out-uid="${d.uid}"]`).size() == d.maxInput) {
        check = true;
    } else if (!d3.select(`g[in-uid="${this.connector.attr('input-uid')}"]`).empty()) {
        d3.selectAll(`g[in-uid="${this.connector.attr('input-uid')}"]`)
            .each(function () {
                if (d3.select(this).attr('out-uid') == d.uid) {
                    check = true;
                }
            })
    }

    return check;
}
/**
 * 将连接成功的线绘制到画布
 * @param  {[type]} d [description]
 * @return {[type]}   [description]
 */
export function drawLineToCanvas (d) {
    let lineConf, _this = this;
    if (d3.select(`g[out-uid="${d.uid}"]`).empty() || d3.select(`g[out-uid="${d.uid}"]`).attr('in-uid') != this.connector.attr('input-uid')) {
        this.connector.select('path').attr('d', function (_d) {
            // let dataset = _this.$d3.select(`rect[data-uid="${_this.connector.attr('input-uid')}"]`).data()[0];
            let inUid = _this.connector.attr('input-uid');
            let dataset = store.getters['etl/ETLTable'][inUid];
            let inRectData = store.getters['etl/ETLDOMMap'][inUid];
            lineConf = {
                x1: _d.x1,
                y1: _d.y1,
                x2: d.x,
                y2: d.y + UI.RECT.HEIGHT / 2,
                strokeDasharray: dataset && !inRectData.error ? 'none' : UI.LINE.STORKE_DASH,
                inUID: _this.connector.attr('input-uid'),   // 连线 start 连接的rect元素uid
                outUID: d.uid                               // 连线 end 连接的rect元素uid
            }
            // 标记连线insource的左右表值
            _this.markTable(lineConf);
            // 将连线画到画布上
            line.call(_this, [lineConf]);
        });
    }
    /** 去掉rect元素上连线point的connecting样式(标记为非连接状态) */
    d3.select(`circle[bind-uid="${this.connector.attr('input-uid')}"]`).classed('connecting', false);
    /** 清空鼠标连线 */
    this.connector.remove();
    this.connector = null;
    this.connecting = false;

    this.dispatcher.call('line_connected', this, {
        data: {
            inUID: lineConf.inUID,
            outUID: lineConf.outUID
        }
    });
}
/**
 * 绘制连线或拖动连线时，计算连线的绘制方式
 * @param  {[type]} p1 [description]
 * @param  {[type]} p2 [description]
 * @return {[type]}    [description]
 */
export function calculateLine ({ p1, p2 }) {
    const MAX_ARC_DIAMETER = 10;

    /** 画笔移动到初始点p1 */
    let connector = `M ${p1.x} ${p1.y} `;
    if ((Math.abs(calculateYDistance()) < MAX_ARC_DIAMETER && calculateXDistance() < 0) || (Math.abs(calculateYDistance()) < MAX_ARC_DIAMETER && Math.abs(calculateXDistance()) < 60)) {

    } else {
        /**
         * 当点p1在点p2右半侧的时候:
         *      画直线到 [p1.x + 20, p1.y] 处
         * 反之:
         *      画直线到 [(p2.x - p1.x) / 2 + p1.x - Math.abs(calculateYDistance()) / 2, p1.y]
         */
        connector += calculateXDistance() > 60 ? line(
            (p2.x - p1.x) / 2 + p1.x - Math.abs(calculateYDistance()) / 2,
            p1.y
        ) : line(
            p1.x + 20,
            p1.y
        );

        if (calculateXDistance() > 60) {
            /** 点p1在点p2左半侧 */

            if (Math.abs(calculateYDistance()) == MAX_ARC_DIAMETER) {
                /** 点p1和点p2的y轴距离大于等于拐角圆弧 */

                connector += curve(
                    (p2.x - p1.x) / 2 + p1.x,
                    p1.y + calculateYDistance() / 2,
                    1
                );
            } else {
                /** 点p1和点p2的y轴距离小于拐角圆弧 */

                connector += curve(
                    (p2.x - p1.x) / 2 + p1.x + Math.abs(calculateYDistance()) / 2,
                    p2.y
                )
            }
        } else {
            /** 点p1在点p2右半侧 */

            connector += curve(
                p1.x + 20 + Math.abs(calculateYDistance()) / 2,
                p1.y + calculateYDistance() / 2,
                1
            );
        }

        if (calculateXDistance() < 60) {
            if (calculateXDistance() < 40) {
                connector += line(
                    p1.x + 20 + Math.abs(calculateYDistance()) / 2,
                    (p2.y - p1.y) / 2 + p1.y - calculateYDistance() / 2
                );
                connector += arc(
                    p1.x + 20,
                    (p2.y - p1.y) / 2 + p1.y,
                    p2.y > p1.y ? 1 : 0
                );
                connector += line(
                    p2.x - 20,
                    (p2.y - p1.y) / 2 + p1.y
                );
                connector += curve(
                    p2.x - 20 - Math.abs(calculateYDistance()) / 2,
                    (p2.y - p1.y) / 2 + p1.y + calculateYDistance() / 2,
                    1
                );
            } else {
                connector += line(
                    p1.x + 20 + Math.abs(calculateYDistance()) / 2,
                    (p2.y - p1.y) / 2 + p1.y - calculateYDistance() / 2
                );
                connector += curveX(
                    p1.x + 20 + Math.abs(calculateYDistance()) / 2,
                    (p2.y - p1.y) / 2 + p1.y - calculateYDistance() / 2,
                    p2.x - 20 - Math.abs(calculateYDistance()) / 2,
                    (p2.y - p1.y) / 2 + p1.y + calculateYDistance() / 2
                );
            }
        }

        if (Math.abs(calculateYDistance()) == MAX_ARC_DIAMETER) {
            connector += calculateXDistance() > 60 ? line(
                (p2.x - p1.x) / 2 + p1.x,
                p2.y - calculateYDistance() / 2
            ) : line(
                p2.x - 20 - Math.abs(calculateYDistance()) / 2,
                p2.y - calculateYDistance() / 2
            );

            connector += calculateXDistance() > 60 ? curve(
                (p2.x - p1.x) / 2 + p1.x + Math.abs(calculateYDistance()) / 2,
                p2.y,
                0
            ) : arc(
                p2.x - 20,
                p2.y,
                p2.y > p1.y ? 0 : 1
            );
        }
    }

    connector += line(
        p2.x,
        p2.y
    );

    /**
     * 直线绘制规则生成
     * @param  {[type]} x [description]
     * @param  {[type]} y [description]
     * @return {[type]}   [description]
     */
    function line (x, y) {
        return `L ${x} ${y} `;
    }

    /**
     * 圆弧绘制规则生成
     * @param  {[type]} x [description]
     * @param  {[type]} y [description]
     * @param  {[type]} d [description]
     * @return {[type]}   [description]
     */
    function arc (x, y, d) {
        return `A 5 5 0 0 ${d} ${x} ${y} `;
    }

    /**
     * 曲线（贝塞尔）绘制规则生成
     * @param  {[type]} x      [description]
     * @param  {[type]} y      [description]
     * @param  {[type]} d      [description]
     * @param  {[type]} forceC [description]
     * @return {[type]}        [description]
     */
    function curve (x, y, d, forceC) {
        let controlPoint = '';
        if (Math.abs(calculateYDistance()) == MAX_ARC_DIAMETER && !forceC) {
            controlPoint = d == 1 ? `${x} ${y - calculateYDistance() / 2}` : `${x - Math.abs(calculateYDistance()) / 2} ${y}`;
        } else {
            controlPoint = !forceC ? `${x} ${y - calculateYDistance()} ${x - Math.abs(calculateYDistance())} ${y}` : `${x + 10 - (calculateXDistance() - 40) / 2} ${y} ${x} ${y + 10}`;
        }

        return `${Math.abs(calculateYDistance()) == MAX_ARC_DIAMETER && !forceC ? 'Q' : 'C'} ${controlPoint} ${x} ${y} `;
    }

    /**
     * 曲线（贝塞尔）绘制规则生成 -- 根据x轴位置判断绘制
     * @param  {[type]} x1 [description]
     * @param  {[type]} y1 [description]
     * @param  {[type]} x2 [description]
     * @param  {[type]} y2 [description]
     * @return {[type]}    [description]
     */
    function curveX (x1, y1, x2, y2) {
        return `C ${x1} ${(y1 - y2) / 2 + y2} ${x2} ${(y1 - y2) / 2 + y2} ${x2} ${y2}`;
    }

    /**
     * 计算连线起始点和结束点的y轴相对位置信息
     * @return {[type]} [description]
     */
    function calculateYDistance () {
        if (Math.abs(p2.y - p1.y) > MAX_ARC_DIAMETER) {
            return p2.y - p1.y > 0 ? MAX_ARC_DIAMETER : -MAX_ARC_DIAMETER;
        } else {
            return p2.y - p1.y;
        }
    }

    /**
     * 计算连线起始点和结束点的x轴相对位置信息
     * @return {[type]} [description]
     */
    function calculateXDistance () {
        return p2.x - p1.x;
    }

    return connector;
}
/**
 * 连线的移动
 * @param  {[type]} d             [description]
 * @param  {[type]} mx            [description]
 * @param  {[type]} my            [description]
 * @param  {Number} [animation=0] [description]
 * @return {[type]}               [description]
 */
export function moveLine (d, mx, my, animation = 0) {
    const _this = this;

    d3.selectAll(`g[in-uid="${d.uid}"]`).each(function () {
        d3.select(this)
            .select('use')
            .transition()
            .duration(animation)
            .attr('x', function (_d) {
                return (_d.x2 - (_d.x1 = mx + UI.RECT.WIDTH)) / 2 + (_d.x1 = mx + UI.RECT.WIDTH) - 8;
            })
            .attr('y', function (_d) {
                return (_d.y2 - (_d.y1 = my + UI.RECT.HEIGHT / 2)) / 2 + (_d.y1 = my + UI.RECT.HEIGHT / 2) - 8;
            })
        d3.select(this)
            .selectAll('path')
            .each(function () {
                d3.select(this)
                    .transition()
                    .duration(animation)
                    .attrTween('d', function (_d) {
                        return interpolatePath(d3.select(this).attr('d'), calculateLine({
                            p1: {
                                x: _d.x1 = mx + UI.RECT.WIDTH,
                                y: _d.y1 = my + UI.RECT.HEIGHT / 2
                            },
                            p2: {
                                x: _d.x2,
                                y: _d.y2
                            }
                        }));
                    });
            });
    });
    d3.selectAll(`g[out-uid="${d.uid}"]`).each(function () {
        d3.select(this)
            .select('use')
            .transition()
            .duration(animation)
            .attr('x', function (_d) {
                return ((_d.x2 = mx) - _d.x1) / 2 + _d.x1 - 8;
            })
            .attr('y', function (_d) {
                return ((_d.y2 = my + UI.RECT.HEIGHT / 2) - _d.y1) / 2 + _d.y1 - 8;
            })
        d3.select(this)
            .selectAll('path')
            .each(function () {
                d3.select(this)
                    .transition()
                    .duration(animation)
                    .attrTween('d', function (_d) {
                        return interpolatePath(d3.select(this).attr('d'), calculateLine({
                            p1: {
                                x: _d.x1,
                                y: _d.y1
                            },
                            p2: {
                                x: _d.x2 = mx,
                                y: _d.y2 = my + UI.RECT.HEIGHT / 2
                            }
                        }));
                    });
            });
    });
}
export function deleteLine (d) {
    if (d) {
        d3.select(`g[in-uid="${d.inUID}"]`).remove();

        this.dispatcher.call('line_delete', this, { data: d });

        // 删除线的时候，检查左右表的属性，重置左右表属性
        if (!d3.select(`g[out-uid="${d.outUID}"]`).empty()) {
            let markedData = store.getters['etl/ETLDOMMap'][d3.select(`g[out-uid="${d.outUID}"]`).attr('in-uid')];

            markedData.markAsLeft = true;
            markedData.markAsRight = false;

            store.dispatch('etl/updateETLDomMap', markedData);
        }
    }
}
