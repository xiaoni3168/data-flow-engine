import Vue from 'vue';
import Vuex from 'vuex';

import etl from './etl';

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		etl
	}
});