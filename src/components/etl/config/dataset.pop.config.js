import { datasetSource } from './dataset.icon.config';
import Vue from 'vue';

/**
 * @description etl popBox所得数据类型和配置
 * name  显示名称
 * type 类型
 * icon 图标
 * maxInput 输入源资源数量限制map
 */
export const etlPopElements = {
    dataset: {
        id: 1,
        name: Vue.t('datasetEtl.dataset.display_name'),
        type: 'dataset',
        icon: datasetSource['dataset'],
        maxInput: 0
    },
    join: {
        id: 2,
        code: 0,
        name: Vue.t('datasetEtl.join.display_name'),
        type: 'join',
        icon: datasetSource['join'],
        maxInput: 2
    },
    appendrow: {
        id: 3,
        code: 4,
        name: Vue.t('datasetEtl.appendrow.display_name'),
        type: 'appendrow',
        icon: datasetSource['appendrow'],
        maxInput: 2
    },
    groupby: {
        id: 4,
        code: 2,
        name: Vue.t('datasetEtl.groupby.display_name'),
        type: 'groupby',
        icon: datasetSource['groupby'],
        maxInput: 1
    },
    // calculatedfield: {
    //     id: 5,
    //     code: 3,
    //     name: 'Calculated field',
    //     type: 'calculatedfield',
    //     icon: datasetSource['calculatedfield'],
    //     maxInput: 1
    // },
    selectcolumn: {
        id: 6,
        code: 7,
        name: Vue.t('datasetEtl.selectcolumn.display_name'),
        type: 'selectcolumn',
        icon: datasetSource['selectcolumn'],
        maxInput: 1
    },
    collapsecolumn: {
        id: 7,
        code: 1,
        name: Vue.t('datasetEtl.collapsecolumn.display_name'),
        type: 'collapsecolumn',
        icon: datasetSource['collapsecolumn'],
        maxInput: 1
    }
    // code: {
    //     id: 8,
    //     code: 6,
    //     name: Vue.t('datasetEtl.code.display_name'),
    //     type: 'code',
    //     icon: datasetSource['code'],
    //     maxInput: -1
    // }
};

/**
 * @description 设置所有etl中素有的pipelin的需要回收的ids,所匹配的正则规则
 * @example etltype => matchRegexp正则表达式
 */
export const matchNeedToFree = {
    'join': /(stepId|targetTableId|targetColumnId)['"]\:\s?['"](step_|table_|column_)(\w+)['"]/g,
    'groupby': /(stepId|targetTableId|targetColumnId)['"]\:\s?['"](step_|table_|column_)(\w+)['"]/g,
    'appendrow': /(stepId|targetTableId|targetColumnId)['"]\:\s?['"](step_|table_|column_)(\w+)['"]/g,
    'calculatedfield': /(stepId|targetTableId|targetColumnId)['"]\:\s?['"](step_|table_|column_)(\w+)['"]/g,
    'selectcolumn': /(stepId|targetTableId|targetColumnId)['"]\:\s?['"](step_|table_|column_)(\w+)['"]/g,
    'collapsecolumn': /(stepId|targetTableId|keyColumnId|valueColumnId|targetColumnId)['"]\:\s?['"](step_|table_|column_)(\w+)['"]/g,
    'calculatedfield': /(stepId|targetTableId|targetColumnId)['"]\:\s?['"](step_|table_|column_)(\w+)['"]/g,
    'code': /(stepId|targetTableId|targetColumnId)['"]\:\s?['"](step_|table_|column_)(\w+)['"]/g
};

/**
 * @description  设置etl groupby的值聚合得聚合方式展示类型, 数组第一项为默认值
 */
export const groupbyMetricType = {
    'NUMBER': [
        { code: 'sum', name: 'SUM', dataType: 5, columnType: 'NUMBER' },
        { code: 'avg', name: 'AVG', dataType: 5, columnType: 'NUMBER' },
        { code: 'max', name: 'MAX', dataType: 5, columnType: 'NUMBER' },
        { code: 'min', name: 'MIN', dataType: 5, columnType: 'NUMBER' },
        { code: 'count', name: 'COUNTA', dataType: 5, columnType: 'NUMBER' },
        { code: 'd_count', name: 'D_COUNT', dataType: 5, columnType: 'NUMBER' },
        { code: 'stdev', name: 'STDEV', dataType: 5, columnType: 'NUMBER' },
        { code: 'var', name: 'VAR', dataType: 5, columnType: 'NUMBER' }
    ],
    'PERCENTAGE': [
        { code: 'sum', name: 'SUM', dataType: 5, columnType: 'NUMBER' },
        { code: 'avg', name: 'AVG', dataType: 5, columnType: 'NUMBER' },
        { code: 'max', name: 'MAX', dataType: 5, columnType: 'NUMBER' },
        { code: 'min', name: 'MIN', dataType: 5, columnType: 'NUMBER' },
        { code: 'count', name: 'COUNTA', dataType: 5, columnType: 'NUMBER' },
        { code: 'd_count', name: 'D_COUNT', dataType: 5, columnType: 'NUMBER' },
        { code: 'stdev', name: 'STDEV', dataType: 5, columnType: 'NUMBER' },
        { code: 'var', name: 'VAR', dataType: 5, columnType: 'NUMBER' }
    ],
    'STRING': [
        { code: 'count', name: 'COUNTA', dataType: 5, columnType: 'NUMBER' },
        { code: 'd_count', name: 'D_COUNT', dataType: 5, columnType: 'NUMBER' }
    ],
    'DATE': [
        { code: 'count', name: 'COUNTA', dataType: 5, columnType: 'NUMBER' },
        { code: 'd_count', name: 'D_COUNT', dataType: 5, columnType: 'NUMBER' }
    ],
    'DATETIME': [
        { code: 'count', name: 'COUNTA', dataType: 5, columnType: 'NUMBER' },
        { code: 'd_count', name: 'D_COUNT', dataType: 5, columnType: 'NUMBER' }
    ],
    'TIME': [
        { code: 'count', name: 'COUNTA', dataType: 5, columnType: 'NUMBER' },
        { code: 'd_count', name: 'D_COUNT', dataType: 5, columnType: 'NUMBER' }
    ],
    'TIMESTAMP': [
        { code: 'count', name: 'COUNTA', dataType: 5, columnType: 'NUMBER' },
        { code: 'd_count', name: 'D_COUNT', dataType: 5, columnType: 'NUMBER' }
    ]
    // 'DURATION': [
    //     { code: 'count', name: 'COUNTA', dataType: 5, columnType: "NUMBER" },
    //     { code: 'd_count', name: 'D_COUNT', dataType: 5, columnType: "NUMBER" }
    // ],
};

/**
 * @description 设置etl groupby的分类聚合方式展示类型
 */
export const groupCatagoryType = {
    'DATE': [
        { code: 'year', name: 'yyyy', dataType: 1, columnType: 'DATE' },
        { code: 'month', name: 'yyyy-MM', dataType: 1, columnType: 'DATE' },
        { code: 'day', name: 'yyyy-MM-dd', dataType: 1, columnType: 'DATE' },
        { code: 'type1', name: 'quarter', dataType: 1, columnType: 'STRING' },
        { code: 'type2', name: 'week', dataType: 1, columnType: 'STRING' }
    ],
    'TIMESTAMP': [
        { code: 'year', name: 'yyyy', dataType: 1, columnType: 'TIMESTAMP' },
        { code: 'month', name: 'yyyy-MM', dataType: 1, columnType: 'TIMESTAMP' },
        { code: 'day', name: 'yyyy-MM-dd', dataType: 1, columnType: 'TIMESTAMP' },
        { code: 'hour', name: 'yyyy-MM-dd HH', dataType: 1, columnType: 'TIMESTAMP' },
        { code: 'minute', name: 'yyyy-MM-dd HH:mm', dataType: 1, columnType: 'TIMESTAMP' },
        { code: 'second', name: 'yyyy-MM-dd HH:mm:ss', dataType: 1, columnType: 'TIMESTAMP' },
        { code: 'hours', name: 'HH', dataType: 1, columnType: 'TIMESTAMP' },
        { code: 'minutes', name: 'HH:mm', dataType: 1, columnType: 'TIMESTAMP' },
        { code: 'seconds', name: 'HH:mm:ss', dataType: 1, columnType: 'TIMESTAMP' },
        { code: 'type1', name: 'quarter', dataType: 1, columnType: 'STRING' },
        { code: 'type2', name: 'week', dataType: 1, columnType: 'STRING' }
    ],
    'DATETIME': [
        { code: 'year', name: 'yyyy', dataType: 1, columnType: 'DATETIME' },
        { code: 'month', name: 'yyyy-MM', dataType: 1, columnType: 'DATETIME' },
        { code: 'day', name: 'yyyy-MM-dd', dataType: 1, columnType: 'DATETIME' },
        { code: 'hour', name: 'yyyy-MM-dd HH', dataType: 1, columnType: 'DATETIME' },
        { code: 'minute', name: 'yyyy-MM-dd HH:mm', dataType: 1, columnType: 'DATETIME' },
        { code: 'second', name: 'yyyy-MM-dd HH:mm:ss', dataType: 1, columnType: 'DATETIME' },
        { code: 'hours', name: 'HH', dataType: 1, columnType: 'DATETIME' },
        { code: 'minutes', name: 'HH:mm', dataType: 1, columnType: 'DATETIME' },
        { code: 'seconds', name: 'HH:mm:ss', dataType: 1, columnType: 'DATETIME' },
        { code: 'type1', name: 'quarter', dataType: 1, columnType: 'STRING' },
        { code: 'type2', name: 'week', dataType: 1, columnType: 'STRING' }
    ],
    'TIME': [
        { code: 'hours', name: 'HH', dataType: 1, columnType: 'TIME' },
        { code: 'minutes', name: 'HH:mm', dataType: 1, columnType: 'TIME' },
        { code: 'seconds', name: 'HH:mm:ss', dataType: 1, columnType: 'TIME' }
    ]
    // 'DURATION': [
    //     { code: 'year', name: 'yyyy' },
    //     { code: 'month', name: 'yyyy-MM' },
    //     { code: 'day', name: 'yyyy-MM-dd' },
    //     { code: 'hour', name: 'yyyy-MM-dd HH' },
    //     { code: 'minute', name: 'yyyy-MM-dd HH:mm' },
    //     { code: 'second', name: 'yyyy-MM-dd HH:mm:ss' },
    //     { code: 'hours', name: 'HH' },
    //     { code: 'minutes', name: 'HH:mm' },
    //     { code: 'seconds', name: 'HH:mm:ss' },
    //     { code: 'type1', name: 'quarter' },
    //     { code: 'type2', name: 'week' }
    // ]

};

/** 
 * @description 日期类型默认格式配置 
 * collapse column行列转置时，选择key和value的columntype为时间类型时的默认format类型
 */
export const dateFormat = {
    'DATE': 'yyyy-MM-dd',
    'TIMESTAMP': 'yyyy-MM-dd HH:mm:ss',
    'DATETIME': 'yyyy-MM-dd HH:mm:ss',
    'TIME': 'HH:mm:ss'
};

/**
 * @description etl join表的类型
 */
export const etlJoinType = [
    { name: Vue.t('datasetEtl.join.join_type.full_join'), code: 4 },
    { name: Vue.t('datasetEtl.join.join_type.inner_join'), code: 1 },
    // { name: 'outer join', code: 3 },
    { name: Vue.t('datasetEtl.join.join_type.left_join'), code: 6 },
    { name: Vue.t('datasetEtl.join.join_type.right_join'), code: 7 }
];

/**
 * @description etl popbox 弹框的大小设置（宽高）
 */
export const popBoxSize = {
    'dataset': { 'height': 400, 'width': 500 },
    'join': { 'height': 400, 'width': 500 },
    'groupby': { 'height': 400, 'width': 600 },
    'appendrow': { 'height': 400, 'width': 500 },
    'calculatedfield': { 'height': 550, 'width': 500 },
    'selectcolumn': { 'height': 425, 'width': 470 },
    'collapsecolumn': { 'height': 450, 'width': 500 },
    'code': { 'height': 550, 'width': 500 }
};

/**
 * @description etl table type 数据类型
 */
export const tableTypes = {
    'None': 0,
    'DataSet': 1,
    'DataModel': 2,
    'Temp': 3,
    'DataSyncTable': 4
};

/**
 * @description etl rect 错误类型
 * 奇数索引为rect自身错误状态
 * 偶数索引为被动控制的错误状态 （已弃用）
 * 奇数+1 的偶数对应的为相同的错误状态
 * 请后期添加的规则请满足该规则
 * notice：产品定义目前source_not_found都是no_data装
 */
export const etlErrorTypes = {
    '-3': 'interface_error',
    '-2': 'dataset_error',
    '-1': 'computed_error', // 接口返回的计算错误
    1: 'no_data', // 奇数，自身状态具备source丢失的状态 old: source_not_found
    3: 'field_not_match', // 4的主动状态
    5: 'maintable_not_found', // 6的主动状态 appendrow中主表丢失
    8: 'no_data', // 被动 no_data 8的状态
    9: 'maintable_data_not_match' // appendrow中 主表数据发生变化 暂时废弃不用
};


/** 
 * @description 计算字段 关键字配置 
 */
export const calculatedFieldKeywords = [
    // math 类型
    {
        name: 'ABS',
        tip: 'ABS(Column e) 计算绝对值',
        expression: 'ABS()',
        chIndex: 1,
        keywords: ['ABS']
    },
    {
        name: 'PMOD',
        tip: 'PMOD(Column dividend, Column divisor) 返回除法操作的余数',
        expression: 'PMOD()',
        chIndex: 1,
        keywords: ['PMOD']
    },
    {
        name: 'POW',
        tip: 'POW(Column dividend, int number) ：将第一个参数的值返回给第二个参数的幂',
        expression: 'POW()',
        chIndex: 1,
        keywords: ['POW']
    },
    {
        name: 'RAND',
        tip: 'RAND()返回0到1的随机数',
        expression: 'RAND()',
        chIndex: 1,
        keywords: ['RAND']
    },
    {
        name: 'ROUND',
        tip: 'ROUND(Column e)  对某个数值域进行指定小数位数的四舍五入',
        expression: 'ROUND()',
        chIndex: 1,
        keywords: ['ROUND']
    },
    {
        name: 'FLOOR',
        tip: 'FLOOR(Column e) 列值下限',
        expression: 'FLOOR()',
        chIndex: 1,
        keywords: ['FLOOR']
    },
    // date类型
    {
        name: 'ADDDATE',
        tip: 'ADDDATE(Column start, int days)返回开始后几天的日期。当前日期加多少天',
        expression: 'ADDDATE()',
        chIndex: 1,
        keywords: ['ADDDATE']
    }, 
    {
        name: 'CURRENT_DATE',
        tip: 'CURRENT_DATE() 当日日期',
        expression: 'CURRENT_DATE()',
        chIndex: 1,
        keywords: ['CURRENT_DATE']
    }, 
    {
        name: 'CURRENT_TIMESTAMP',
        tip: 'CURRENT_TIMESTAMP(Column e) 当前日期（yyyy-mm-dd）',
        expression: 'CURRENT_TIMESTAMP()',
        chIndex: 1,
        keywords: ['CURRENT_TIMESTAMP']
    }, 
    {
        name: 'DATEDIFF',
        tip: 'DATEDIFF(Column e)',
        expression: 'DATEDIFF()',
        chIndex: 1,
        keywords: ['DATEDIFF']
    }, 
    {
        name: 'DATE_FORMAT',
        tip: 'DATE_FORMAT(Column dateExpr, String format) 根据表达式格式化日期',
        expression: 'DATE_FORMAT()',
        chIndex: 1,
        keywords: ['DATE_FORMAT']
    }, 
    {
        name: 'DATE_SUB',
        tip: 'DATE_SUB(Column start, int days)',
        expression: 'DATE_SUB()',
        chIndex: 1,
        keywords: ['DATE_SUB']
    }, 
    {
        name: 'DAYOFMONTH',
        tip: 'DAYOFMONTH(Column e)',
        expression: 'DAYOFMONTH()',
        chIndex: 1,
        keywords: ['DAYOFMONTH']
    }, {
        name: 'DAYOFYEAR',
        tip: 'DAYOFYEAR(Column e)',
        expression: 'DAYOFYEAR()',
        chIndex: 1,
        keywords: ['DAYOFYEAR']
    }, 
    {
        name: 'FROM_UNIXTIME',
        tip: 'FROM_UNIXTIME(Column ut)  时间戳，格式化成 年月日是分秒',
        expression: 'FROM_UNIXTIME()',
        chIndex: 1,
        keywords: ['FROM_UNIXTIME']
    }, 
    {
        name: 'HOUR',
        tip: 'HOUR(Column e)',
        expression: 'HOUR()',
        chIndex: 1,
        keywords: ['HOUR']
    }, 
    {
        name: 'LAST_DAY',
        tip: 'LAST_DAY(Column e)',
        expression: 'LAST_DAY()',
        chIndex: 1,
        keywords: ['LAST_DAY']
    }, 
    {
        name: 'MINUTE',
        tip: 'MINUTE(Column e)',
        expression: 'MINUTE()',
        chIndex: 1,
        keywords: ['MINUTE']
    }, 
    {
        name: 'MONTH',
        tip: 'MONTH(Column e)',
        expression: 'MONTH()',
        chIndex: 1,
        keywords: ['MONTH']
    }, 
    {
        name: 'QUARTER',
        tip: 'QUARTER(Column e)：返回日期所在的第几季度',
        expression: 'QUARTER()',
        chIndex: 1,
        keywords: ['QUARTER']
    }, 
    {
        name: 'SECOND',
        tip: 'SECOND(Column e)',
        expression: 'SECOND()',
        chIndex: 1,
        keywords: ['SECOND']
    }, 
    {
        name: 'STR_TO_DATE',
        tip: 'STR_TO_DATE(Column e)：将列转换为DateType',
        expression: 'STR_TO_DATE()',
        chIndex: 1,
        keywords: ['STR_TO_DATE']
    }, 
    {
        name: 'UNIX_TIMESTAMP',
        tip: 'UNIX_TIMESTAMP() unix 时间戳：',
        expression: 'UNIX_TIMESTAMP()',
        chIndex: 1,
        keywords: ['UNIX_TIMESTAMP']
    }, 
    {
        name: 'WEEKOFYEAR',
        tip: 'WEEKOFYEAR(Column e)',
        expression: 'WEEKOFYEAR()',
        chIndex: 1,
        keywords: ['WEEKOFYEAR']
    }, 
    {
        name: 'YEAR',
        tip: 'YEAR(Column e)',
        expression: 'YEAR()',
        chIndex: 1,
        keywords: ['YEAR']
    },
    // string类型
    {
        name: 'CONCAT',
        tip: 'CONCAT(Column... exprs)  合并多个列:',
        expression: 'CONCAT()',
        chIndex: 1,
        keywords: ['CONCAT']
    },
    {
        name: 'INSTR',
        tip: 'INSTR(Column str, String substring):返回字符串str中第一个子字符串substr的位置',
        expression: 'INSTR()',
        chIndex: 1,
        keywords: ['INSTR']
    },
    {
        name: 'UPPER',
        tip: 'UPPER(Column e) 字符串列转大写：',
        expression: 'UPPER()',
        chIndex: 1,
        keywords: ['UPPER']
    },
    {
        name: 'LOWER',
        tip: 'LOWER(Column e) 字符串列转小写：',
        expression: 'LOWER()',
        chIndex: 1,
        keywords: ['LOWER']
    },
    {
        name: 'REGEXP_REPLACE',
        tip: 'REGEXP_REPLACE(Column e, String pattern, String replacement)：替换匹配regexp与rep的指定字符串值的所有子字符串。',
        expression: 'REGEXP_REPLACE()',
        chIndex: 1,
        keywords: ['REGEXP_REPLACE']
    },
    {
        name: 'SUBSTRING',
        tip: 'SUBSTRING(Column str, int pos, int len):SUBSTRING(Employee Name,1,3)',
        expression: 'SUBSTRING()',
        chIndex: 1,
        keywords: ['SUBSTRING']
    },
    {
        name: 'TRIM',
        tip: 'TRIM(Column e):去除字符串前后空格',
        expression: 'TRIM()',
        chIndex: 1,
        keywords: ['TRIM']
    },
    {
        name: 'LENGTH',
        tip: 'LENGTH(Column e) 返回某个文本域的长度',
        expression: 'LENGTH()',
        chIndex: 1,
        keywords: ['LENGTH']
    },

    {
        name: 'CONCAT_WS',
        tip: 'concat_ws(String sep, Column... exprs) 使用指定分隔符，将多个列合并',
        expression: 'CONCAT_WS()',
        chIndex: 1,
        keywords: ['CONCAT_WS']
    },
    {
        name: 'LOCATE',
        tip: 'locate(String substr, Column str)找到substr第一次出现的位置，无（0），1,2',
        expression: 'LOCATE()',
        chIndex: 1,
        keywords: ['LOCATE']
    },
    {
        name: 'SPLIT',
        tip: 'split(Column str, String pattern)',
        expression: 'SPLIT()',
        chIndex: 1,
        keywords: ['SPLIT']
    },
    {
        name: 'LTRIM',
        tip: 'ltrim(Column e)',
        expression: 'LTRIM()',
        chIndex: 1,
        keywords: ['LTRIM']
    },
    {
        name: 'RTRIM',
        tip: 'rtrim(Column e)',
        expression: 'RTRIM()',
        chIndex: 1,
        keywords: ['RTRIM']
    },
    {
        name: 'REVERSE',
        tip: 'reverse(Column str)：将字符串翻转',
        expression: 'REVERSE()',
        chIndex: 1,
        keywords: ['REVERSE']
    },
    // 表达式
    {
        name: 'CASE',
        tip: 'CASE when  then else EndCASE when  then else EndCASE when  then else EndCASE when  then else EndCASE when  then else EndCASE when  then else EndCASE when  then else EndCASE when  then else EndCASE when  then else End',
        expression: 'CASE when  then else End',
        chIndex: 14,
        keywords: ['CASE', 'WHEN', 'THEN', 'ELSE', 'END']
    },
    {
        name: '+',
        tip: '+',
        expression: ' + ',
        chIndex: 0,
        symbols: ['+']
    },
    {
        name: '-',
        tip: '-',
        expression: ' - ',
        chIndex: 0,
        symbols: ['-']
    },
    {
        name: '*',
        tip: '*',
        expression: ' * ',
        chIndex: 0,
        symbols: ['*']
    },
    {
        name: '/',
        tip: '/',
        expression: ' / ',
        chIndex: 0,
        symbols: ['/']
    },
    {
        name: '()',
        tip: '()',
        expression: '()',
        chIndex: 1,
        symbols: ['(', ',', ')']
    }
];

/** 
 * @description sql 自定义函数 
 */
export const sqlFunctionList = [
    {
        name: 'COUNTA',
        tip: 'COUNTA()',
        expression: 'COUNTA()',
        chIndex: 1
    },
    {
        name: 'D_COUNT',
        tip: 'D_COUNT()',
        expression: 'D_COUNT()',
        chIndex: 1
    },
    {
        name: 'MIN',
        tip: 'MIN()',
        expression: 'MIN()',
        chIndex: 1
    },
    {
        name: 'MAX',
        tip: 'MAX()',
        expression: 'MAX()',
        chIndex: 1
    },
    {
        name: 'SUM',
        tip: 'SUM()',
        expression: 'SUM()',
        chIndex: 1
    },
    {
        name: 'AVG',
        tip: 'AVG()',
        expression: 'AVG()',
        chIndex: 1
    }
];
