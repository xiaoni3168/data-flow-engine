/**
 * 画布上的鼠标事件
 */
import * as d3 from 'd3';
import { event } from 'd3-selection'
import noevent from './D3Diagram.NoEvent';
import { UI, KEY_MAP } from './config';
import store from '../../vuex';
import * as D3Line from './D3Diagram.Line';

export default class MouseEvent {
    constructor (container, D3) {
        this.container          = container;
        this.D3                 = D3;

        this.onMouseUpFuncs     = [];
        this.onMouseDownFuncs   = [];
        this.onMouseMoveFuncs   = [];
        this.onMouseLeaveFuncs  = [];
        this.onMouseWheelFuncs  = [];
    }

    init () {
        const _this = this;

        this.container
            .on('mousedown', function () {
                _this.onMouseDownFuncs.forEach(f => {
                    f.call(this, _this.D3);
                })
            })
            .on('mouseup', function () {
                _this.onMouseUpFuncs.forEach(f => {
                    f.call(this, _this.D3);
                });
            })
            .on('mousemove', function () {
                _this.onMouseMoveFuncs.forEach(f => {
                    f.call(this, _this.D3);
                });
            })
            .on('mouseleave', function () {
                _this.onMouseLeaveFuncs.forEach(f => {
                    f.call(this, _this.D3);
                });
            })
            .on('wheel.zoom', function () {
                noevent();
                _this.onMouseWheelFuncs.forEach(f => {
                    f.call(this, _this.D3);
                });
            });

        this._canvasDragInit();
        this._canvasClipInit();
        this._canvasZoomInit();
    }

    destroy () {
        this.onMouseUpFuncs     = [];
        this.onMouseDownFuncs   = [];
        this.onMouseMoveFuncs   = [];
        this.onMouseLeaveFuncs  = [];
        this.onMouseWheelFuncs  = [];
    }

    addMouseDownStack (f) {
        this.onMouseDownFuncs.push(f);
    }

    addMouseUpStack (f) {
        this.onMouseUpFuncs.push(f);
    }

    addMouseMoveStack (f) {
        this.onMouseMoveFuncs.push(f);
    }

    addMouseLeaveStack (f) {
        this.onMouseLeaveFuncs.push(f);
    }

    addMouseWheelStack (f) {
        this.onMouseWheelFuncs.push(f);
    }

    _canvasDragInit () {
        const _this = this;
        let isCanvasDragging = false,
                          dx = 0,
                          dy = 0,
                      active = '';
        this.addMouseDownStack(function () {
            if (_this.D3.isCanvasReadyToDrag) {
                d3.select(this).classed('dragging', true);
                isCanvasDragging = true;

                dx = event.x;
                dy = event.y;
            }
            /** 初始化选中的元素，并去掉选中状态 */
            active = store.getters['etl/ETLActiveUid'];
            if (active && event.target.nodeName != 'use') { // 当点击的不是删除按钮时才初始化
                d3.select(`use[bind-uid="${active}"].icon-close`).style('display', 'none');
                d3.select(`rect[data-uid="${active}"]`).classed('focused', false);
                store.dispatch('etl/setActiveUid', '');
            }
        });

        this.addMouseMoveStack(function () {
            if (isCanvasDragging) {
                let selector = d3.select(this);

                selector.selectAll('rect')
                    .attr('x', function (d) {
                        let mx = d.x + event.x - dx,
                            my = d.y + event.y - dy;

                        d3.select(`circle[bind-uid="${d.uid}"]`).attr('cx', mx + UI.RECT.WIDTH);
                        d3.select(`path[bind-uid="${d.uid}"]`).attr('d', `M ${mx - UI.HOOK.INPUT.WIDTH / 2} ${my + UI.RECT.HEIGHT / 2 - UI.HOOK.INPUT.HEIGHT / 2} L ${mx + UI.HOOK.INPUT.WIDTH / 2} ${my + UI.RECT.HEIGHT / 2} L ${mx - UI.HOOK.INPUT.WIDTH / 2} ${my + UI.RECT.HEIGHT / 2 + UI.HOOK.INPUT.HEIGHT / 2} z`);
                        d3.select(`use[bind-uid="${d.uid}"].icon-close`).attr('x', mx + UI.RECT.WIDTH - UI.CLOSE.RELA_LEFT);
                        d3.select(`use[bind-uid="${d.uid}"].icon-dataset`).attr('x', mx + (UI.RECT.WIDTH - UI.ICON.WIDTH) / 2);
                        d3.select(`text[bind-uid="${d.uid}"]`).attr('x', mx + UI.RECT.WIDTH / 2);
                        d3.select(`g[data-uid="${d.uid}"]`).select(`use.icon-warning`).attr('x', mx - 1);

                        D3Line.moveLine.call(_this, d, mx, my);

                        return mx;
                    })
                    .attr('y', function (d) {
                        let my = d.y + event.y - dy
                        d3.select(`circle[bind-uid="${d.uid}"]`).attr('cy', my + UI.RECT.HEIGHT / 2);
                        d3.select(`use[bind-uid="${d.uid}"].icon-close`).attr('y', my - UI.CLOSE.RELA_TOP);
                        d3.select(`use[bind-uid="${d.uid}"].icon-dataset`).attr('y', my + (UI.RECT.HEIGHT - UI.ICON.HEIGHT) / 2);
                        d3.select(`text[bind-uid="${d.uid}"]`).attr('y', my + UI.RECT.HEIGHT + 18);
                        d3.select(`g[data-uid="${d.uid}"]`).select(`use.icon-warning`).attr('y', my - 1);

                        return my;
                    });

            }
        });

        this.addMouseUpStack(function () {
            if (isCanvasDragging) {
                d3.select(this).classed('dragging', false);

                let selector = d3.select(this);

                selector.selectAll('rect')
                    .attr('x', function (d) {
                        return d.x = d.x + event.x - dx;
                    })
                    .attr('y', function (d) {
                        return d.y = d.y + event.y - dy;
                    });

                isCanvasDragging = false;
            }
        });

        this.addMouseLeaveStack(function () {
            if (isCanvasDragging) {
                d3.select(this).classed('dragging', false);

                let selector = d3.select(this);

                selector.selectAll('rect')
                    .attr('x', function (d) {
                        let mx = d.x + event.x - dx,
                            my = d.y + event.y - dy;

                        d3.select(`circle[bind-uid="${d.uid}"]`).attr('cx', mx + UI.RECT.WIDTH);
                        d3.select(`path[bind-uid="${d.uid}"]`).attr('d', `M ${mx - UI.HOOK.INPUT.WIDTH / 2} ${my + UI.RECT.HEIGHT / 2 - UI.HOOK.INPUT.HEIGHT / 2} L ${mx + UI.HOOK.INPUT.WIDTH / 2} ${my + UI.RECT.HEIGHT / 2} L ${mx - UI.HOOK.INPUT.WIDTH / 2} ${my + UI.RECT.HEIGHT / 2 + UI.HOOK.INPUT.HEIGHT / 2} z`);
                        d3.select(`use[bind-uid="${d.uid}"].icon-close`).attr('x', mx + UI.RECT.WIDTH - UI.CLOSE.RELA_LEFT);
                        d3.select(`use[bind-uid="${d.uid}"].icon-dataset`).attr('x', mx + (UI.RECT.WIDTH - UI.ICON.WIDTH) / 2);
                        d3.select(`text[bind-uid="${d.uid}"]`).attr('x', mx + UI.RECT.WIDTH / 2);
                        d3.select(`g[data-uid="${d.uid}"]`).select(`use.icon-warning`).attr('y', mx - 1);

                        D3Line.moveLine.call(_this, d, mx, my);

                        return d.x = mx;
                    })
                    .attr('y', function (d) {
                        let my = d.y + event.y - dy;
                        d3.select(`circle[bind-uid="${d.uid}"]`).attr('cy', my + UI.RECT.HEIGHT / 2);
                        d3.select(`use[bind-uid="${d.uid}"].icon-close`).attr('y', my - UI.CLOSE.RELA_TOP);
                        d3.select(`use[bind-uid="${d.uid}"].icon-dataset`).attr('y', my + (UI.RECT.HEIGHT - UI.ICON.HEIGHT) / 2);
                        d3.select(`text[bind-uid="${d.uid}"]`).attr('y', my + UI.RECT.HEIGHT + 18);
                        d3.select(`g[data-uid="${d.uid}"]`).select(`use.icon-warning`).attr('y', my - 1);

                        return d.y = my;
                    });

                isCanvasDragging = false;
            }
        });
    }

    _canvasClipInit () {
        const _this = this;

        this.addMouseDownStack(function () {
            if (event.target.nodeName == 'svg') {
                d3.selectAll('rect[data-uid]').classed('cliped', false);
                !_this.D3.isCanvasReadyToDrag && _this.container
                    .selectAll('rect.clip')
                    .data([{ x: _this.D3.getCoords(event).x, y: _this.D3.getCoords(event).y, height: 0, width: 0 }])
                    .enter()
                    .append('rect')
                    .classed('clip', true)
                    .attr('x', d => d.x)
                    .attr('y', d => d.y)
                    .attr('height', d => d.height)
                    .attr('width', d => d.width)
                    .attr('fill', 'rgba(40, 136, 229, 0.2)');
            }
        });
        this.addMouseMoveStack(function () {
            if (!d3.select('rect.clip').empty()) {
                d3.select('rect.clip')
                    .attr('x', d => {
                        return _this.D3.getCoords(event).x > d.x ? d.x : _this.D3.getCoords(event).x;
                    })
                    .attr('y', d => {
                        return _this.D3.getCoords(event).y > d.y ? d.y : _this.D3.getCoords(event).y;
                    })
                    .attr('height', d => {
                        return Math.abs(_this.D3.getCoords(event).y - d.y);
                    })
                    .attr('width', d => {
                        return Math.abs(_this.D3.getCoords(event).x - d.x);
                    })
                    .each(d => {
                        _this._checkClip({
                            x: _this.D3.getCoords(event).x > d.x ? d.x : _this.D3.getCoords(event).x,
                            y: _this.D3.getCoords(event).y > d.y ? d.y : _this.D3.getCoords(event).y,
                            height: Math.abs(_this.D3.getCoords(event).y - d.y),
                            width: Math.abs(_this.D3.getCoords(event).x - d.x)
                        });
                    });
            }
        });

        this.addMouseUpStack(function () {
            d3.select('rect.clip').remove();
        });

        this.addMouseLeaveStack(function () {
            if (!d3.select('rect.clip').empty()) {
                d3.select('rect.clip')
                    .attr('x', d => {
                        return _this.D3.getCoords(event).x > d.x ? d.x : _this.D3.getCoords(event).x;
                    })
                    .attr('y', d => {
                        return _this.D3.getCoords(event).y > d.y ? d.y : _this.D3.getCoords(event).y;
                    })
                    .attr('height', d => {
                        return Math.abs(_this.D3.getCoords(event).y - d.y);
                    })
                    .attr('width', d => {
                        return Math.abs(_this.D3.getCoords(event).x - d.x);
                    })
                    .each(d => {
                        _this._checkClip({
                            x: _this.D3.getCoords(event).x > d.x ? d.x : _this.D3.getCoords(event).x,
                            y: _this.D3.getCoords(event).y > d.y ? d.y : _this.D3.getCoords(event).y,
                            height: Math.abs(_this.D3.getCoords(event).y - d.y),
                            width: Math.abs(_this.D3.getCoords(event).x - d.x)
                        });
                    });
                setTimeout(() => {
                    d3.select('rect.clip').remove();
                }, 200);
            }
            if (_this.isCanvasReadyToDrag) {
                _this.isCanvasReadyToDrag = false;
            }
        });
    }

    _canvasZoomInit () {
        const _this = this;

        this.addMouseWheelStack(function () {
            if (_this.D3.D3KeyEvent.commandKey && !d3.selectAll('*').empty()) {
                if (event.wheelDelta > 0 || (_this._getBrowserName() === 'Firefox' && event.deltaY > 0)) {
                    _this.D3.viewPercent -= 0.1;
                    let label = (_this.D3.viewPercent * 100).toFixed(0);

                    label < 10 ? (label = 10, _this.D3.viewPercent = 0.1) : _this.D3.viewPercent = label / 100;

                    d3.select('.resize-wrapper_reset').text(`${label}%`);

                    _this.D3.setViewbox(true);
                } else {
                    _this.D3.viewPercent += 0.1;
                    let label = (_this.D3.viewPercent * 100).toFixed(0);

                    label > 500 ? (label = 500, _this.D3.viewPercent = 5) : '';

                    d3.select('.resize-wrapper_reset').text(`${label}%`);

                    _this.D3.setViewbox(true);
                }
            }
        });
    }

    _checkClip (rect) {
        d3.selectAll('rect[data-uid]')
            .classed('jelly animated', false)
            .each(function (d) {
                d3.select(this)
                    .classed('cliped', !((d.x + UI.RECT.WIDTH < rect.x) || (d.y + UI.RECT.HEIGHT < rect.y) || (rect.x + rect.width < d.x) || (rect.y + rect.height < d.y)));
            });
    }

    _getBrowserName () {
        const ua = window.navigator.userAgent.toLowerCase();

        if (ua.indexOf('chrome') > -1) {
            return 'Chrome';
        }
        if (ua.indexOf('safari') > -1) {
            return 'Safari';
        }
        if (ua.indexOf('firefox') > -1) {
            return 'Firefox';
        }
        return 'Other';
    }
}
