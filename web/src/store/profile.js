import axios from "axios";
import { PROFILE_URL } from "../urls";

const state = {
    firstName: "",
    lastName: "",
    email: "",
    id: "",
    username: "",
    teams: [],
};
const getters = {
    firstName: state => state.first_name,
    lastName: state => state.lastName,
    email: state => state.email,
    id: state => state.id,
    username: state => state.username,
    teams: state => state.teams,
};
const actions = {
    async loadProfile({ commit }) {
        await axios.get(PROFILE_URL)
            .then(resp => {
                commit("setProfile", resp.data.data);
            }).catch(() => {
                commit("clearUser");
            });
    },
};
const mutations = {
    setProfile(state, profile) {
        state.firstName = profile.first_name;
        state.lastName = profile.last_name;
        state.email = profile.email;
        state.id = profile.id;
        state.username = profile.username;
        state.teams = profile.teams;
    },
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};