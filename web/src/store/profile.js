import axios from "axios";
import { PROFILE_URL } from "../urls";

const state = {
    firstName: "",
    lastName: "",
    email: "",
    id: "",
    username: "",
    teams: [],
    watchlist: [],
    roles: [],
};
const getters = {
    firstName: state => state.first_name,
    lastName: state => state.lastName,
    email: state => state.email,
    id: state => state.id,
    username: state => state.username,
    teams: state => state.teams,
    watchlist: state => state.watchlist,
    roles: state => state.roles,
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
    addWatchlist(state, item) {
        state.commit('addWatchlist', item);
    },
    removeWatchlist(state, item) {
        state.commit('removeWatchlist', item);
    },
    loadWatchlist({ commit }) {
        axios.get(`${PROFILE_URL}/watchlist`)
            .then(resp => {
                commit('setWatchlist', resp.data.data)
            })
            .catch(() => {
                console.log("ERROR GETTING WATCHLIST")
            });
    },
    isWatched(state, id) {
        return state.getters.watchlist.filter(f => f.id == id).length > 0;
    }
};
const mutations = {
    setProfile(state, profile) {
        state.firstName = profile.first_name;
        state.lastName = profile.last_name;
        state.email = profile.email;
        state.id = profile.id;
        state.username = profile.username;
        state.teams = profile.teams;
        state.roles = profile.roles;
    },
    setWatchlist(state, list) {
        state.watchlist = list;
    },

    addWatchlist(state, item) {
        let idx = state.watchlist.map(w => w.id).indexOf(item._id);

        if (idx == -1) {
            state.watchlist.push({ name: item.name, id: item._id, location: item.location.name });

            axios.post(`${PROFILE_URL}/watchlist`, { watchlist: state.watchlist })
                .then(() => {
                })
                .catch(() => {
                    console.log("ERROR GETTING WATCHLIST")
                });
        }

    },
    removeWatchlist(state, item) {
        let idx = state.watchlist.map(w => w.id).indexOf(item._id);

        if (idx > -1) {
            state.watchlist.splice(idx, 1);

            axios.post(`${PROFILE_URL}/watchlist`, { watchlist: state.watchlist })
                .then(() => {
                })
                .catch(() => {
                    console.log("ERROR GETTING WATCHLIST")
                });
        }
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};