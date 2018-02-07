/**
 * ETL元素的配置文件
 */

export const UI = {
    RECT: {
        HEIGHT      : 72, // 矩形高
        WIDTH       : 72, // 矩形宽
        RX          : 4,  // 矩形圆角
        RY          : 4,  // 矩形圆角
        DEFAULT_STROKE: '#BBBBBB',  // 矩形边框颜色
        DEFAULT_FILL: '#F4F4F4',  // 矩形默认填充色
        DEFAULT_STROKE_WIDTH: 1,  // 默认矩形边框宽
    },
    ICON: {
        HEIGHT      : 36, // icon的高
        WIDTH       : 36, // icon的宽
        DEFAULT_FILL: '#cccccc', // icon的默认填充色
        ACTIVED_FILL: '#666666', // icon添加数据后的填充色
    },
    TEXT: {
        FONT_SIZE   : 14, // 矩形的name文字大小
        DEFAULT_FILL: '#444444', // 矩形的name文字颜色
    },
    HOOK: {
        INPUT: {                        // 矩形上输入三角形
            DEFAULT_STROKE: '#ffffff',  // 默认边框颜色
            DEFAULT_FILL: '#BBBBBB',    // 默认填充色
            DEFAULT_STROKE_WIDTH: 1,    // 默认边框宽
            HEIGHT: 14,
            WIDTH: 10
        },
        OUTPUT: {                       // 矩形上输出圆形
            RADIUS: 6,                  // 圆形半径
            DEFAULT_STROKE: '#ffffff',  // 默认边框颜色
            DEFAULT_FILL: '#BBBBBB',    // 默认填充色
            DEFAULT_STROKE_WIDTH: 1,    // 默认边框宽
        }
    },
    WARNING: {
        HEIGHT: 26,
        WIDTH: 26,
        FILL: '#F0C800',
        SHADOW_FILL: 'rgba(0, 0, 0, 0.1)',
        FONT_COLOR: '#444444'
    },
    ERROR: {
        FILL: '#FF6E64',
        SHADOW_FILL: 'rgba(0, 0, 0, 0.1)',
        FONT_COLOR: '#FFFFFF'
    },
    CLOSE: {
        HEIGHT: 18,
        WIDTH: 18,
        RELA_TOP: 6,
        RELA_LEFT: 12,
        DEFAULT_FILL: '#BBBBBB',
        HOVER_FILL: '#FF6E64'
    },
    LINE: {
        STORKE_DASH: '4,5'
    }
}

export const KEY_MAP = {
    Mac: {
        Command     : 'MetaLeft',
        Shift       : 'ShiftLeft',
        Equal       : 'Equal',
        Minus       : 'Minus',
        Digit0      : 'Digit0',
        Backspace   : 'Backspace',
        Space       : 'Space',
        ArrowUp     : 'ArrowUp',
        ArrowDown   : 'ArrowDown',
        ArrowRight  : 'ArrowRight',
        ArrowLeft   : 'ArrowLeft',
        Delete      : 'Delete',
        KeyA        : 'KeyA',
        KeyC        : 'KeyC',
        KeyV        : 'KeyV',
        FFCommand   : 'OSLeft'
    },
    Win: {
        Command     : 'ControlLeft',
        Shift       : 'ShiftLeft',
        Equal       : 'Equal',
        Minus       : 'Minus',
        Digit0      : 'Digit0',
        Backspace   : 'Backspace',
        Space       : 'Space',
        ArrowUp     : 'ArrowUp',
        ArrowDown   : 'ArrowDown',
        ArrowRight  : 'ArrowRight',
        ArrowLeft   : 'ArrowLeft',
        Delete      : 'Delete',
        KeyA        : 'KeyA',
        KeyC        : 'KeyC',
        KeyV        : 'KeyV',
        FFCommand   : 'OSLeft'
    }
}
