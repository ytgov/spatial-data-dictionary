<template>
  <v-app>
    <v-navigation-drawer
      v-bind:app="hasSidebar"
      permanent
      :expand-on-hover="hasSidebarClosable"
      clipped
      color="#f1f1f1"
      v-bind:class="{ 'd-none': !hasSidebar }"
      v-if="showPrint"
    >
      <v-list dense nav style="" class="mt-4">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          background-color="#fff"
          label="Search"
          outlined
          dense
          hint="Press enter to search"
          @keydown="searchKeyUp"
          @click:append="doSearch"
        ></v-text-field>
        <v-divider class="mt-0 mb-2"></v-divider>

        <v-list-item
          link
          nav
          v-bind:title="section.name"
          v-bind:to="section.url"
          v-for="section in mySections"
          v-bind:key="section.name"
        >
          <v-list-item-icon>
            <v-icon>{{ section.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ section.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>
        <v-subheader>
          My watchlist<v-spacer></v-spacer>
          <v-icon size="" class="mr-5">mdi-star</v-icon>
        </v-subheader>
        <v-list-item
          link
          nav
          v-for="(item, i) of watchlist"
          :key="i"
          :to="'/entity/' + item.id"
        >
          <v-list-item-icon
            ><v-icon>mdi-database-marker</v-icon></v-list-item-icon
          >
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ item.location }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      v-if="showPrint"
      app
      color="#fff"
      flat
      height="70"
      style="left: 0; border-bottom: 3px #f3b228 solid"
    >
      <!-- <v-icon color="#f3b228" class="mr-5">{{ applicationIcon }}</v-icon> -->
      <img src="/yukon.svg" style="margin: -8px 155px 0 0" height="44" />
      <v-toolbar-title>
        <span style="font-weight: 700">{{ applicationName }}</span>

        <v-progress-circular
          :class="loadingClass"
          indeterminate
          color="#f3b228"
          size="20"
          width="2"
          class="ml-4"
        ></v-progress-circular>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <div v-if="isAuthenticated">
        <span>{{ username }}</span>
        <v-menu offset-y class="ml-0">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon color="primary" v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list dense style="min-width: 200px">
            <v-list-item to="/profile">
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-title>My profile</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="signOut">
              <v-list-item-icon>
                <v-icon>mdi-exit-run</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Sign out</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <div v-else>
        <router-link to="/sign-in">Sign in</router-link>
      </div>

      <!-- <v-app-bar-nav-icon @click.stop="drawerRight = !drawerRight"></v-app-bar-nav-icon> -->
    </v-app-bar>

    <v-main v-bind:style="{ 'padding-left: 33px !important': !hasSidebar }">
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <v-row>
          <v-col>
            <router-view></router-view>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import router from "./router";
import { mapState } from "vuex";
import store from "./store";
import * as config from "./config";

export default {
  name: "App",
  components: {},
  computed: {
    ...mapState(["isAuthenticated"]),
    ...mapState("profile", ["watchlist"]),
    username() {
      return store.getters.fullName;
    },
    isAuthenticated() {
      return store.getters.isAuthenticated;
    },
    watchlist() {
      return store.getters["profile/watchlist"];
    },
    mySections: function () {
      return config.sections.filter(
        (s) => s.role == "" || this.roles.indexOf(s.role) >= 0
      );
    },
    roles: function () {
      return store.getters.roles;
    },
  },
  data: () => ({
    dialog: false,
    drawer: null,
    drawerRight: null,
    headerShow: false,
    menuShow: false,
    loadingClass: "d-none",
    applicationName: config.applicationName,
    applicationIcon: config.applicationIcon,
    hasSidebar: false, //config.hasSidebar,
    hasSidebarClosable: config.hasSidebarClosable,
    search: "",
    showPrint: false,
  }),
  created: async function () {
    //await store.dispatch("checkAuthentication");

    if (!this.isAuthenticated) this.hasSidebar = false;
    else this.hasSidebar = config.hasSidebar;

    //this.hasSidebar = true;

    store.dispatch("profile/loadWatchlist");
  },
  watch: {
    isAuthenticated: function (val) {
      if (!val) this.hasSidebar = false;
      else this.hasSidebar = config.hasSidebar;

      //this.hasSidebar = true;
    },
    $route: function (val) {
      if (val.path.indexOf("/print") > 0) this.showPrint = false;
      else this.showPrint = true;
    },
  },
  methods: {
    nav(location) {
      router.push(location);
    },
    toggleHeader() {
      this.headerShow = !this.headerShow;
    },
    toggleMenu() {
      this.menuShow = !this.menuShow;
    },
    signOut() {
      store.dispatch("signOut");
      window.setTimeout(() => {
        router.push("/");
      }, 250);
    },
    searchKeyUp(event) {
      if (event.code == "Enter") {
        this.doSearch();
      }
    },
    doSearch() {
      router.push("/search?term=" + this.search);
      this.search = "";
    },
  },
};
</script>
