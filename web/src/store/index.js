import Vue from "vue";
import Vuex from "vuex";

import auth from "./auth";
import profile from "./profile";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    entityPreferences: { cardView: false },
  },
  mutations: {
    setEntityPreferences(state, value) {
      state.entityPreferences = value;
    },
  },
  actions: {
    setEntityPreferences({ commit }, value) {
      commit("setEntityPreferences", value);
    },
  },
  getters: {
    entityPreferences: state => state.entityPreferences,
  },
  modules: { auth, profile }
});
