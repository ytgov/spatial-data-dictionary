<template>
  <div>
    <h1>My Profile</h1>
    <p>** This information is all read-only</p>

    <div class="row">
      <div class="col-md-6 mb-3">
        <v-text-field
          v-model="firstName"
          outlined
          label="First name"
          readonly
          hide-details
        ></v-text-field>
      </div>
      <div class="col-md-6 mb-3">
        <v-text-field
          v-model="lastName"
          outlined
          label="Last name"
          readonly
          hide-details
        ></v-text-field>
      </div>

      <div class="col-md-6 mb-3">
        <v-text-field
          v-model="email"
          outlined
          label="Email"
          readonly
          hide-details
        ></v-text-field>
      </div>
      <div class="col-md-6 mb-3">
        <v-text-field
          v-model="roles"
          outlined
          label="Roles"
          readonly
          hide-details
        ></v-text-field>
      </div>
      <div class="col-md-12 mb-3">
        <h3>Subscriptions</h3>

        <ul>
          <li v-for="(item, i) of subscriptions" :key="i">
            <router-link
              v-if="item.type == 'Program'"
              :to="`/entity?program=${item.id}`"
            >
              {{ item.type }}: {{ item.name }}</router-link
            >
            <router-link
              v-if="item.type == 'Entity'"
              :to="`/entity/${item.id}`"
            >
              {{ item.type }}: {{ item.name }}</router-link
            >
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import store from "../store";
import { SUBSCRIPTION_URL } from "../urls";

export default {
  name: "Profile",
  computed: {
    ...mapState("profile", [
      "firstName",
      "lastName",
      "username",
      "email",
      "teams",
      "roles",
    ]),
  },
  data: () => ({
    subscriptions: [],
  }),
  async created() {
    await store.dispatch("profile/loadProfile");

    this.loadSubscritions();
  },
  methods: {
    loadSubscritions() {
      axios
        .get(`${SUBSCRIPTION_URL}`)
        .then((resp) => (this.subscriptions = resp.data.data));
    },
  },
};
</script>
