import 'babel-polyfill';
import Vue from 'vue';
import VueRouter from 'vue-router';

import Index from './pages/index.vue';

import store from './vuex';

import VueD3 from './plugins/vue-d3';

Vue.use(VueRouter);
Vue.use(VueD3);

const routes = [{
    name: 'index',
    path: '/index',
    component: Index
}, {
    path: '*',
    redirect: '/index'
}];

const router = new VueRouter({
    routes
});

new Vue({
    router,
    store
}).$mount('#app');
