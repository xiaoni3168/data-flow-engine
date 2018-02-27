<template>
    <div class="diagram-content">
        <div class="diagram-content-canvas" id="flow"></div>
        <tool></tool>
    </div>
</template>
<script>
import Tool from '../components/etl/tool.vue';
export default {
    data () {
        return {}
    },
    mounted () {
        /** 初始化画布 */
        this.D3Diagram.init({
            dom: '#flow',
            config: {
                'height': '100%',
                'width': '100%'
            }
        });
        this.D3Diagram.on('line_click', function ({data, event}) {
            this.deleteLine(data);
        });
    },
    components: {
        Tool
    }
}
</script>
<style lang="sass">
.diagram-content {
    user-select: none;
    height: 100%;
    display: flex;

    &-canvas {
        height: 100%;
        width: 100%;
        margin: auto;
        overflow: hidden;
        position: relative;
        flex: 1;
    }

    svg {
        background-color: #FFFFFF;
        position: absolute;
        &:focus {
            outline: none;
        }
        &.drag {
            cursor: grab;
            cursor: -webkit-grab;
        }
        &.dragging {
            cursor: grabbing;
            cursor: -webkit-grabbing;
        }
        rect[data-uid] {
            transition: stroke, stroke-width .17s;
            cursor: grab;
            cursor: -webkit-grab;
            &:hover {
                stroke: #999999;
                stroke-width: 2;
            }
            &.dragging {
                cursor: grabbing;
                cursor: -webkit-grabbing;
            }
            &.focused {
                stroke: #AAC814;
                stroke-width: 2;
            }
            &.connecting-unabled {
                stroke: #FF6E64;
                stroke-width: 2;
            }
            &.connecting-abled {
                stroke: #5ABEFF;
                stroke-width: 2;
            }
            &.cliped {
                stroke: #2888e5;
                fill: #808080;
                stroke-width: 2;
                stroke-dasharray: 5;
                animation: marchingants .8s forwards infinite linear;
            }
            &.warning {
                stroke: #f0c801;
                stroke-width: 2;
            }
        }

        circle {
            cursor: pointer;
            transition: fill .17s;
            &:hover {
                fill: #5ABEFF;
            }
            &.connecting {
                fill: #5ABEFF;
            }
            &.unabled {
                fill: #FF6E64;
            }
        }

        path {
            cursor: pointer;
            transition: fill .17s;
            &:hover {
                fill: #5ABEFF;
            }
            &[data-type]:hover {
                fill: none;
            }
            &[data-type="connector"] {
                pointer-events: none;
            }
            &.connecting-unabled {
                fill: #FF6E64;
            }
        }
    }

    #icon-etl-delete {
        fill: #bbbbbb;
        &:hover {
            fill: #FF6E64;
        }
    }
    .icon-close {
        fill: #ccc;
        cursor: pointer;
        transition: fill 0.17s;
        &:hover {
            fill: #FF6E64;
        }
    }
    .icon-dataset {
        pointer-events: none;
    }
    .diagram-content-canvas {
        .resize-wrapper {
            position: absolute;
            bottom: 10%;
            right: 50px;
            display: flex;
            height: 28px;
            line-height: 28px;
            text-align: center;
            border-radius: 3px;
            font-size: 12px;
            box-shadow: 0 -1px 1px 0 rgba(0,0,0,.05), 0 1px 2px 0 rgba(0,0,0,.2);
            background-color: #FFFFFF;
            &_increase {
                width: 28px;
                border-left: 1px solid #e2e5eb;
                cursor: pointer;
                &.clicked,
                &:hover {
                    background-color: #eeeeee;
                }
            }
            &_decrease {
                width: 28px;
                border-right: 1px solid #e2e5eb;
                cursor: pointer;
                &.clicked,
                &:hover {
                    background-color: #eeeeee;
                }
            }
            &_reset {
                width: 50px;
            }
        }
        .resize-tip {
            position: absolute;
            pointer-events: none;
            width: 100px;
            left: 50%;
            top: 50%;
            font-size: 36px;
            background-color: rgba(0,0,0,0.8);
            color: #f0f0f0;
            text-align: center;
            padding: 10px 20px;
            transform: translate(-50%, -50%);
            border-radius: 36px;
            box-shadow: 0px 1px 1px 1px rgba(0,0,0,0.3);
        }
        .etl-empty {
            position: absolute;
            width: 100%;
            top: 50%;
            transform: translateY(-100%);
            font-size: 48px;
            text-align: center;
            color: #f0f0f0;
            pointer-events: none;
        }
    }
}

/** animation */
.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}

@keyframes jelly {
    0% {
          -webkit-transform: matrix3d(0.2, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.2, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      3.4% {
          -webkit-transform: matrix3d(0.452, 0, 0, 0, 0, 0.526, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.452, 0, 0, 0, 0, 0.526, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      4.7% {
          -webkit-transform: matrix3d(0.56, 0, 0, 0, 0, 0.679, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.56, 0, 0, 0, 0, 0.679, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      6.81% {
          -webkit-transform: matrix3d(0.727, 0, 0, 0, 0, 0.914, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.727, 0, 0, 0, 0, 0.914, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      9.41% {
          -webkit-transform: matrix3d(0.907, 0, 0, 0, 0, 1.134, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.907, 0, 0, 0, 0, 1.134, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      10.21% {
          -webkit-transform: matrix3d(0.953, 0, 0, 0, 0, 1.181, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.953, 0, 0, 0, 0, 1.181, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      13.61% {
          -webkit-transform: matrix3d(1.098, 0, 0, 0, 0, 1.266, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.098, 0, 0, 0, 0, 1.266, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      14.11% {
          -webkit-transform: matrix3d(1.113, 0, 0, 0, 0, 1.265, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.113, 0, 0, 0, 0, 1.265, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      17.52% {
          -webkit-transform: matrix3d(1.166, 0, 0, 0, 0, 1.192, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.166, 0, 0, 0, 0, 1.192, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      18.72% {
          -webkit-transform: matrix3d(1.17, 0, 0, 0, 0, 1.15, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.17, 0, 0, 0, 0, 1.15, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      21.32% {
          -webkit-transform: matrix3d(1.157, 0, 0, 0, 0, 1.056, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.157, 0, 0, 0, 0, 1.056, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      24.32% {
          -webkit-transform: matrix3d(1.12, 0, 0, 0, 0, 0.968, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.12, 0, 0, 0, 0, 0.968, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      25.23% {
          -webkit-transform: matrix3d(1.107, 0, 0, 0, 0, 0.95, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.107, 0, 0, 0, 0, 0.95, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      29.03% {
          -webkit-transform: matrix3d(1.05, 0, 0, 0, 0, 0.917, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.05, 0, 0, 0, 0, 0.917, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      29.93% {
          -webkit-transform: matrix3d(1.038, 0, 0, 0, 0, 0.919, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.038, 0, 0, 0, 0, 0.919, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      35.54% {
          -webkit-transform: matrix3d(0.984, 0, 0, 0, 0, 0.97, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.984, 0, 0, 0, 0, 0.97, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      36.74% {
          -webkit-transform: matrix3d(0.977, 0, 0, 0, 0, 0.983, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.977, 0, 0, 0, 0, 0.983, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      41.04% {
          -webkit-transform: matrix3d(0.969, 0, 0, 0, 0, 1.018, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.969, 0, 0, 0, 0, 1.018, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      44.44% {
          -webkit-transform: matrix3d(0.973, 0, 0, 0, 0, 1.026, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.973, 0, 0, 0, 0, 1.026, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      52.15% {
          -webkit-transform: matrix3d(0.993, 0, 0, 0, 0, 1.005, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.993, 0, 0, 0, 0, 1.005, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      59.86% {
          -webkit-transform: matrix3d(1.005, 0, 0, 0, 0, 0.992, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.005, 0, 0, 0, 0, 0.992, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      63.26% {
          -webkit-transform: matrix3d(1.006, 0, 0, 0, 0, 0.994, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.006, 0, 0, 0, 0, 0.994, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      75.28% {
          -webkit-transform: matrix3d(1.001, 0, 0, 0, 0, 1.002, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1.001, 0, 0, 0, 0, 1.002, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      85.49% {
          -webkit-transform: matrix3d(0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      90.69% {
          -webkit-transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
      100% {
          -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
          transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
      }
}

@keyframes marchingants {
    to {
        stroke-dashoffset: 9;
    }
}

.jelly {
  animation-name: jelly;
}
</style>
