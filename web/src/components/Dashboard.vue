<template>
  <div class="home">
    <h1>Dashboard</h1>

<!--     <v-card class="mt-5" color="#fff2d5">
      <v-card-title>Upcoming Changes</v-card-title>
      <v-card-text>This is the body of the text</v-card-text>
    </v-card> -->

    <div class="row">
      <div class="col-md-6">
        <v-card class="mt-5" color="#fff2d5">
          <v-card-title>Open Change Requests</v-card-title>
          <v-card-text>
            <v-progress-linear
              v-if="loadingChanges"
              color="primary"
              indeterminate
              rounded
              height="6"
            ></v-progress-linear>
            <h3>
              You currently have {{ myOpenChanges.length }} assigned to you.
            </h3>

            <v-list style="border: 1px #bbb solid" v-if="myOpenChanges.length > 0">
              <v-list-item
                v-for="(change, index) of myOpenChanges"
                v-bind:key="index"
                @click="goToChange(change)"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ change.title }}</v-list-item-title>
                  <v-list-item-subtitle
                    >{{ change.entity.name }} ({{
                      change.entity.location.name
                    }})</v-list-item-subtitle
                  >
                  <hr
                    class="mt-2"
                    v-if="index < myOpenChanges.length - 1"
                    :key="index"
                  />
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-md-6">
        <v-card class="mt-5" color="#fff2d5">
          <v-card-title>Awaiting Change Requests</v-card-title>
          <v-card-text>
            <v-progress-linear
              v-if="loadingRequests"
              color="primary"
              indeterminate
              rounded
              height="6"
            ></v-progress-linear>
            <h3>
              You currently have {{ myApprovals.length }} awaiting your
              approval.
            </h3>
            <v-list style="border: 1px #bbb solid" v-if="myApprovals.length > 0">
              <v-list-item
                v-for="(change, index) of myApprovals"
                v-bind:key="change._id"
                @click="goToRequest(change)"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ change.title }}</v-list-item-title>
                  <v-list-item-subtitle
                    >{{ change.entity.name }} ({{
                      change.entity.location.name
                    }})</v-list-item-subtitle
                  >
                  <hr
                    class="mt-2"
                    v-if="index < myApprovals.length - 1"
                    :key="index"
                  />
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ENTITY_URL } from "../urls";
import router from "../router";

export default {
  name: "Home",
  data: () => ({
    loadingChanges: null,
    loadingRequests: null,

    myOpenChanges: [],
    myApprovals: [],
  }),
  created() {
    this.loadOpenChanges();
    this.loadApprovals();
  },
  methods: {
    loadOpenChanges() {
      this.loadingChanges = true;
      axios
        .get(`${ENTITY_URL}/changes/open`)
        .then((results) => {
          this.myOpenChanges = results.data.data;
          this.loadingChanges = null;
        })
        .catch((error) => {
          console.log(error);
          this.loadingChanges = null;
        });
    },
    loadApprovals() {
      this.loadingRequests = true;
      axios
        .get(`${ENTITY_URL}/request-change/open`)
        .then((results) => {
          this.myApprovals = results.data.data;
          this.loadingRequests = null;
        })
        .catch((error) => {
          console.log(error);
          this.loadingRequests = null;
        });
    },
    goToRequest(item) {
      router.push(`/entity/${item.entity_id}/change-request/${item._id}`);
    },
    goToChange(item) {
      router.push(`/entity/${item.entity_id}/changes/${item._id}`);
    }
  },
};
</script>
