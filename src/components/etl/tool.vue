<template>
    <div class="etl-toolbox">
        <div class="etl-toolbox__elements">
            <div class="etl-toolbox__elements-element"
                v-for="element in filterElements"
                :key="element.id"
                :e-type="element.type"
                :e-name="element.name"
                :max-input="element.maxInput">
                <svg class="element-icon">
                    <use :xlink:href="element.icon"></use>
                </svg>
                <span class="element-label">{{element.name}}</span>
                <div class="element-cover"></div>
            </div>
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3';
// import { etlPopElements } from './config/dataset.pop.config';
import { UI } from '../../plugins/D3Diagram/config';
import Utils from '../../utils/uuid.utils';

export default {
    data() {
        return {
            filterElements: [
                {
                    id: 0,
                    type: 'dataset',
                    name: 'Output',
                    maxInput: 1
                },
                {
                    id: 1,
                    type: 'join',
                    name: 'Input',
                    maxInput: 2
                }
            ],

            poi: [20, 20],
            vTime: 0
        }
    },
    mounted () {
        this.$nextTick(() => {
            this.initDrag();
        });
    },
    methods: {
        initDrag () {
            const _this = this;
            let cloneNode = null,
                clickNode = false;

            d3.selectAll('.etl-toolbox__elements-element')
                .each(function () {
                    d3.select(this)
                        .on('mousedown', function () {
                            _this.clickNode = false;
                            cloneNode = this.cloneNode(true);
                            let e = d3.event;
                            // setTimeout(() => {
                            //     if (!_this.clickNode && cloneNode) {
                                    document.body.appendChild(cloneNode);
                                    cloneNode.className = 'etl-element dragging';
                                    cloneNode.style.transform = `translate(${e.x - cloneNode.offsetWidth / 2}px, ${e.y - cloneNode.offsetHeight / 2}px)`;
                                // }
                            // }, 200);
                            // 屏蔽toolbox鼠标事件，方便拖动元素
                            // _d3.select('.diagram-content-toolbox').style('pointer-events', 'none');

                            _this.vTime = +Date.now();
                        })
                        // .on('mouseup', function () {
                        //     if (+Date.now() - _this.vTime < 200) {
                        //         // 点击元素
                        //         _this.clickNode = true;
                        //     }
                        // });
                });

            document.body.onmousemove = function (e) {
                if (cloneNode) {
                    d3.select(cloneNode).style('transform', `translate(${e.x - cloneNode.offsetWidth / 2}px, ${e.y - cloneNode.offsetHeight / 2}px)`);
                }
            }
            document.body.onmouseup = function (e) {
                if (cloneNode) {
                    d3.select(cloneNode).remove();
                    cloneNode = null;
                }
            }
            document.body.onmouseleave = function (e) {
                if (cloneNode) {
                    d3.select(cloneNode).remove();
                    cloneNode = null;
                }
            }
            this.D3Diagram.setMouseUpFuncs(function () {
                if (cloneNode) {
                    let x, y;

                    x = _this.D3Diagram.getCoords(d3.event).x - UI.RECT.WIDTH / 2;
                    y = _this.D3Diagram.getCoords(d3.event).y - UI.RECT.HEIGHT / 2;

                    let name = d3.select(cloneNode).attr('e-name');

                    let rect = {
                        'uid': Utils.uuid(),
                        'x': x,
                        'y': y,
                        'type': d3.select(cloneNode).attr('e-type'),
                        'name': _this.D3Diagram.getName(name),
                        'maxInput': +d3.select(cloneNode).attr('max-input')
                    };
                    _this.D3Diagram.addRect([rect]);

                    // dataset块和sql块，拖拽自动打开弹框
                    if (d3.select(cloneNode).attr('e-type') === 'dataset' || d3.select(cloneNode).attr('e-type') === 'code') {
                        let event = {
                            x: x,
                            y: y
                        };
                        _this.$nextTick(() => {
                            _this.$emit('rectClick', {data: rect, event: event, viewPercent: _this.D3Diagram.viewPercent});
                        });
                    }

                    d3.select(cloneNode).remove();
                    cloneNode = null;
                }
            })
        },
        elementClick (e) {
            let cloneNode = e.target.parentElement.cloneNode(true);

            document.body.appendChild(cloneNode);
            cloneNode.className = 'etl-element dragging';
            cloneNode.style.transform = `translate(${e.x - cloneNode.offsetWidth / 2}px, ${e.y - cloneNode.offsetHeight / 2}px)`;

            this.$nextTick(() => {
                let _e = {
                    x: 20 + this.poi[0],
                    y: 62 + this.poi[1]
                }
                d3.select(cloneNode)
                    .transition()
                    .duration(200)
                    .style('transform', `translate(${_e.x}px, ${_e.y}px)`)
                    .on('end', () => {
                        let x, y;

                        x = this.D3Diagram.getCoords(_e).x;
                        y = this.D3Diagram.getCoords(_e).y;

                        let rect = {
                            'uid': Utils.uuid(),
                            'x': x,
                            'y': y,
                            'type': d3.select(cloneNode).attr('e-type'),
                            'name': d3.select(cloneNode).attr('e-name'),
                            'maxInput': +d3.select(cloneNode).attr('max-input')
                        };
                        this.D3Diagram.addRect([rect]);

                        if (d3.select(cloneNode).attr('e-type') == 'dataset') {
                            let event = {
                                x: x,
                                y: y
                            };
                            this.$nextTick(() => {
                                this.$emit('rectClick', {data: rect, event: event, viewPercent: 2 - this.D3Diagram.viewPercent});
                            });
                        }

                        d3.select(cloneNode).remove();
                        cloneNode = null;
                    });
                this.updatePOI();
            });
        },
        onFocus () {
            this.D3Diagram.disabledKeyEvent();
        },
        onBlur () {
            this.D3Diagram.enabledKeyEvent();
        },
        onSearch (data) {
            this.filterElements = data;
            this.$nextTick(() => {
                this.initDrag();
            });
        },
        updatePOI () {
            let [x, y] = this.poi;

            this.poi[1] = y + UI.RECT.HEIGHT + 20;

            if (this.poi[1] + 62 > d3.select('#canvas').node().offsetHeight) {
                this.poi[0] = x + UI.RECT.WIDTH + 20;
                this.poi[1] = 20
            }
        }
    },
    destroyed () {
        document.body.onmousemove = null;
        document.body.onmouseup = null;
    }
}
</script>

<style lang="sass" rel="stylesheet/scss">
.etl-toolbox {
    height: 100%;
    background-color: #F4F4F4;
    border: 1px solid transparent;
    box-sizing: border-box;
    width: 230px;
    &__search {
        margin: 10px;

        & .pt-ui-search__input {
            background-color: transparent;
        }
    }
    &__elements {
        height: calc(100% - 46px);
        text-align: center;
        
        &-element {
            height: 48px;
            line-height: 48px;
            display: flex;
            align-items: center;
            position: relative;
            background-color: #666666;
            margin: 6px 20px;
            border-radius: 4px;
            &:hover {
                cursor: pointer;

                .element-icon {
                    fill: #666666;
                }
                .element-label {
                    color: #ffffff;
                }
            }
            .element-icon {
                height: 20px;
                width: 20px;
                fill: #666666;
                margin: 0 6px 0 14px;
                position: relative;
            }
            .element-label {
                font-size: 13px;
                color: #cccccc;
            }
            .element-cover {
                position: absolute;
                height: 100%;
                width: 100%;
                top: 0;
                left: 0;
            }
        }
    }
}

.etl-element.dragging {
    height: 48px;
    width: 188px;
    position: absolute;
    line-height: 48px;
    display: flex;
    align-items: center;
    pointer-events: none;
    left: 0;
    top: 0;
    z-index: 9999;
    background-color: #666666;
    opacity: .8;
    border-radius: 4px;
    .element-icon {
        height: 20px;
        width: 20px;
        fill: #FFFFFF;
        margin: 0 6px 0 14px;
    }
    .element-label {
        font-size: 13px;
        color: #FFFFFF;
    }
}
</style>
