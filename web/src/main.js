import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import vuetify from "./plugins/vuetify";
import StatusChip from "./components/StatusChip";
import LocationChip from "./components/LocationChip";
import EntityTypeChip from "./components/EntityTypeChip";
import ConnectionDialog from "./components/ConnectionDialog";
import EntityConnectionDialog from "./components/EntityConnectionDialog";
import DownEntityConnectionDialog from "./components/DownEntityConnectionDialog";
import PersonConnectionDialog from "./components/PersonConnectionDialog";
import DomainDialog from "./components/DomainDialog";
import Notifications from "./components/Notifications";

Vue.config.productionTip = false;

axios.defaults.withCredentials = true

Vue.component('status-chip', StatusChip);
Vue.component('location-chip', LocationChip);
Vue.component('entity-type-chip', EntityTypeChip);
Vue.component('connection-dialog', ConnectionDialog);
Vue.component('entityconnection-dialog', EntityConnectionDialog);
Vue.component('downentityconnection-dialog', DownEntityConnectionDialog);
Vue.component('personconnection-dialog', PersonConnectionDialog);
Vue.component('domain-dialog', DomainDialog);

Vue.component("notifications", Notifications)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
