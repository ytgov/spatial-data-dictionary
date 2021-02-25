import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import vuetify from "./plugins/vuetify";
import StatusChip from "./components/StatusChip";
import LocationChip from "./components/LocationChip";
import ConnectionDialog from "./components/ConnectionDialog";

Vue.config.productionTip = false;

axios.defaults.withCredentials = true

Vue.component('status-chip', StatusChip);
Vue.component('location-chip', LocationChip);
Vue.component('connection-dialog', ConnectionDialog)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
