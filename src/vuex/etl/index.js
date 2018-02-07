// import etlApi from '../../apis/dataset.etl.js';
import _ from 'lodash';
const types = {
    SET_ETL_PIPELINE    : 'SET_ETL_PIPELINE',
    ADD_ETL_PIPELINE    : 'ADD_ETL_PIPELINE',
    DELETE_ETL_PIPELINE : 'DELETE_ETL_PIPELINE',
    UPDATE_ETL_PIPELINE : 'UPDATE_ETL_PIPELINE',

    SET_ETL_DOM_MAP     : 'SET_ETL_DOM_MAP',
    SET_ETL_LINE_MAP    : 'SET_ETL_LINE_MAP',
    ADD_ETL_LINE        : 'ADD_ETL_LINE',
    UPDATE_ETL_DOM_MAP  : 'UPDATE_ETL_DOM_MAP',
    DELETE_ETL_DOM      : 'DELETE_ETL_DOM',
    DELETE_ETL_LINE     : 'DELETE_ETL_LINE',
    ADD_ETL_IDS         : 'ADD_ETL_IDS',
    FREE_ETL_ID         : 'USED_ETL_ID',
    SET_ETL_IDS_FREE    : 'SET_ETL_IDS_FREE',
    // 添加table数据
    ADD_ETL_TABLE       : 'ADD_ETL_TABLE',
    // 删除table数据
    DEL_ETL_TABLE       : 'DEL_ETL_TABLE',
    UPDATE_ETL_TABLE    : 'UPDATE_ETL_TABLE',
    // 删除指定的table数据
    DELETE_ETL_TABLE    : 'DELETE_ETL_TABLE',
    // 设置ETLActiveUid
    SET_ETL_ACTIVE_UID  : 'SET_ETL_ACTIVE_UID',
    // 添加整个table数据
    ADD_ALL_ETL_TABLE   : 'ADD_ALL_ETL_TABLE'
}

const state = {
    // 存放pipeline数据的 Map
    ETLPipeline: {},
    // 存放元素绘制数据（包括选择的数据）Map
    ETLDOMMap: {},
    // 存放元素连线的数据 Map
    ETLLineMap: {},
    // 存放所有未使用的ids
    ETLIds: [],
    // 存放所有已经使用过的ids
    ETLUsedIds: [],
    // 存放所有的tabledata数据
    ETLTable: {},
    // etl active uid
    ETLActiveUid: ''
}

const getters = {
    ETLPipeline: state => state.ETLPipeline,
    ETLDOMMap: state => state.ETLDOMMap,
    ETLLineMap: state => state.ETLLineMap,
    ETLIds: state => state.ETLIds,
    ETLUsedIds: state => state.ETLUsedIds,
    ETLTable: state => state.ETLTable,
    ETLActiveUid: state => state.ETLActiveUid
}

const actions = {
    setETLPipeline ({ commit }, pipeline) {
        // 设置ui数据
        commit(types.SET_ETL_PIPELINE, pipeline);
    },
    addETLPipeline ({ commit }, pipeline) {
        commit(types.ADD_ETL_PIPELINE, pipeline);
    },
    deleteETLPipeline ({ commit }, id) {
        commit(types.DELETE_ETL_PIPELINE, id);
    },
    updateETLPipeline ({ commit }, pipeline) {
        commit(types.UPDATE_ETL_PIPELINE, pipeline);
    },
    setETLDomMap ({ commit }, map) {
        commit(types.SET_ETL_DOM_MAP, map);
    },
    setETLLineMap ({ commit }, map) {
        commit(types.SET_ETL_LINE_MAP, map);
    },
    updateETLDomMap ({ commit }, data) {
        commit(types.UPDATE_ETL_DOM_MAP, data);
    },
    deleteETLDom ({ commit }, dom) {
        commit(types.DELETE_ETL_DOM, dom);
    },
    addETLLine ({ commit }, line) {
        commit(types.ADD_ETL_LINE, line);
    },
    deleteETLLine ({ commit }, id) {
        commit(types.DELETE_ETL_LINE, id);
    },
    // 获取etl的ids的接口请求
    async getETLIds ({ commit }) {
        // try {
        //     const ids = await etlApi.getEtlIds(null, {});
        //     if (ids && ids.length) {
        //         commit(types.ADD_ETL_IDS, ids);
        //     }
        // } catch (err) {
        //     console.error(err);
        // }

    },
    // 获取闲置的id
    getFreeId ({ commit }) {
        commit(types.FREE_ETL_ID);
        return state.ETLUsedIds[state.ETLUsedIds.length-1];
    },
    /** used的id恢复到free状态
     * @param {Array} ids 要恢复free状态的ids
     */
    setIdsFree ({ commit, state }, ids) {
        commit(types.SET_ETL_IDS_FREE, ids);
    },

    /**
     * @description 设置激活rect的uid
     * @param {object} rect
     */
    setActiveUid ({ commit, state }, rect) {
        commit(types.SET_ETL_ACTIVE_UID, rect ? rect.uid : '');
    },
    /**
     * 增加table数据
     * @param {[type]} commit [description]
     * @param {[type]} state  [description]
     * @param {[type]} table  [description]
     */
    addETLTable ({ commit, state }, {uid, table}) {
        commit(types.ADD_ETL_TABLE, {uid, table});
    },
    deleteETLTable ({ commit, state }, id) {
        commit(types.DELETE_ETL_TABLE, id);
    },
    updateETLTable ({ commit, state }, {uid, table}) {
        commit(types.UPDATE_ETL_TABLE, {uid, table});
    },
    /**
     * @description 添加所有table数据
     * @param {object} map 所有table数据
     */
    addAllETLTable ({ commit, state }, map) {
        // 设置ui数据
        commit(types.ADD_ALL_ETL_TABLE, map);
    }
}

const mutations = {
    [types.SET_ETL_PIPELINE] (state, pipeline) {
        state.ETLPipeline = {...pipeline};
    },
    [types.ADD_ETL_PIPELINE] (state, pipeline) {
        state.ETLPipeline = {...state.ETLPipeline, ...pipeline};
    },
    [types.DELETE_ETL_PIPELINE] (state, id) {
        delete state.ETLPipeline[id];
        state.ETLPipeline = {...state.ETLPipeline};
    },
    [types.UPDATE_ETL_PIPELINE] (state, pipeline) {
        state.ETLPipeline = {...state.ETLPipeline, ...pipeline};
    },
    [types.SET_ETL_DOM_MAP] (state, map) {
        state.ETLDOMMap = {...map};
    },
    [types.SET_ETL_LINE_MAP] (state, map) {
        state.ETLLineMap = {...map};
    },
    [types.UPDATE_ETL_DOM_MAP] (state, data) {
        state.ETLDOMMap = {...state.ETLDOMMap, [data.uid]: data};
    },
    [types.DELETE_ETL_DOM] (state, dom) {
        delete state.ETLDOMMap[dom.uid];
        state.ETLDOMMap = {...state.ETLDOMMap};
    },
    [types.ADD_ETL_LINE] (state, line) {
        state.ETLLineMap = {...state.ETLLineMap, [line.inUID]: line};
    },
    [types.DELETE_ETL_LINE] (state, id) {
        delete state.ETLLineMap[id];
        state.ETLLineMap = {...state.ETLLineMap};
    },
    // 设置所有etl的ids
    [types.ADD_ETL_IDS] (state, ids) {
        state.ETLIds = ids;
    },
    // 获取闲置的id
    [types.FREE_ETL_ID] (state) {
        const freeId = state.ETLIds.pop();
        state.ETLUsedIds.push(freeId);
    },
    // 恢复使用的ids到free状态
    [types.SET_ETL_IDS_FREE] (state, ids) {
        // 删除所有ETLUsedIds的所有ids 并且 添加到 ETLIds中
        let usedIndex = -1;
        ids.forEach(id => {
            usedIndex = _.indexOf(state.ETLUsedIds, id);
            if (usedIndex !== -1) {
                state.ETLUsedIds.splice(usedIndex, 1);
                // 为了避免id出现重复的概率，获取是后部读取，添加是头部插入
                state.ETLIds.unshift(id);
            }
        });
    },

    // 设置激活rect的uid
    [types.SET_ETL_ACTIVE_UID] (state, val) {
        state.ETLActiveUid = val;
    },
    // 新增table数据
    [types.ADD_ETL_TABLE] (state, {uid, table}) {
        state.ETLTable = { ...state.ETLTable, [uid]: table }
    },
    [types.DELETE_ETL_TABLE] (state, id) {
        delete state.ETLTable[id];
        state.ETLTable = {...state.ETLTable};
    },
    [types.UPDATE_ETL_TABLE] (state, {uid, table}) {
        state.ETLTable = {...state.ETLTable, [uid]: table};
    },
    [types.ADD_ALL_ETL_TABLE] (state, map) {
        state.ETLTable = {...map};
    }
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};
