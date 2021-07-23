import Vue from 'vue';
import Vuex from 'vuex';

import detail from './detail';
import dimensions from './dimensions';
import _ from '../lodash-custom-bundle';

const navigationStateKeys = ['projects', 'area', 'metric', 'mainComponent', 'section'];
const complexStateAdapters = {'detail': detail.readFromURL};

Vue.use(Vuex);
export default new Vuex.Store({
    //strict: true,
    modules: {
        detail: detail.module,
        dimensions
    },
    state: {
        projects: [],
        area: '',
        metric: '',
        mainComponent: '',
        topicsMinimized: false,
        centralNotice: null,
        selectingTime: false,
        width: null
    },
    getters: {
        // Do not add mainComponent to mainState
        // to avoid infinite update loops.
        mainState: state => ({
            project: state.projects[0],
            area: state.area,
            metric: state.metric,
            section: state.section
        }),
        stateForURL: (state, getters) => {
            let forURL = Object.assign({}, getters.mainState);
            if(!_.isEmpty(state.detail)) {
                const dimensions = state.dimensions.dimensions;
                state.detail.dimensions = dimensions;
                forURL.detail = detail.writeToURL(state.detail);
            }
            return forURL;
        },
        getWidth: state => state.width,
        project: state => state.projects[0]
    },
    mutations: {
        navigate (state, arg) {
            state.mainComponent = arg.component;
        },
        // Sets all properties passed, and sets any remaining navigation properties to empty string.
        reload (state, arg) {
            navigationStateKeys.forEach(k => state[k] = '');
            this.commit('detail/reset');
            Object.keys(arg).forEach(k => {
                const readFromURL = complexStateAdapters[k] || (x => x);
                state[k] = readFromURL(arg[k], state);
            });
            if (state.detail.dimensions) {
                this.dispatch('dimensions/setDimensions', state.detail.dimensions);
            }
        },
        project (state, arg) {
            state.projects = [arg.project]; 
        },
        metric (state, arg) {
            state.section = '';
            state.area = arg.area;
            state.metric = arg.metric;
            this.commit('detail/reset');
        },
        topicExplorer (state, arg) {
            state.topicsMinimized = arg.minimize;
        },
        selectingTime (state, arg) {
            state.selectingTime = arg.selectingTime;
        }
    },
});
