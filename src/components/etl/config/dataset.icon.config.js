// import datasetIco from '../../../configs/dsCodeIcon';
// 获取dataset列表设置icon
// const etlDatasetIcon = {};
// Object.keys(datasetIco).forEach(i => {
//     etlDatasetIcon[i] = '#' + datasetIco[i];
// });

// etl datasesource tableType和icon映射
export const datasetSource = {
    // ...etlDatasetIcon,
    'dataset': '#icon-etl-dataset',
    'join': '#icon-etl-joindata',
    'appendrow': '#icon-etl-appendrows',
    'groupby': '#icon-etl-groupby',
    'calculatedfield': '#icon-etl-calculatedfield',
    'selectcolumn': '#icon-etl-selectcolumn',
    'collapsecolumn': '#icon-etl-collapsecolumn',
    'code': '#icon-edit',
    'dataflow': '#icon-logo-ds-dataflow',
    'etl-export': '#icon_export'
};
// etl dataset column字段类型值 icon映射
export const fieldsTypes = {
    'STRING': 'icon-ds-string',
    'NUMBER': 'icon-ds-number',
    'DATE': 'icon-ds-date',
    // 'BOOLEAN': 'icon-ds-boolean',
    'TIMESTAMP': 'icon-ds-timestamp',
    'PERCENTAGE': 'icon-ds-percentage',
    'TIME': 'icon-ds-time',
    // 'DURATION': 'icon-ds-duration',
    'DATETIME': 'icon-ds-datetime'
    // 添加为定义的columntype
    // 'DOUBLE': 'icon-ds-number',
    // 'FLOAT': 'icon-ds-number',
    // 'INTEGER': 'icon-ds-number',
    // 'LONG': 'icon-ds-number',
    // "CURRENCY": 'icon-ds-number'
};
