<template>
  <div class="">
    <v-btn color="primary" class="float-right mt-0" to="/entity/create"><v-icon>mdi-plus</v-icon> Create Entity</v-btn>
    <h1>Entities</h1>
    <hr class="mb-3" />

    <h2 class="mb-1">
      <v-icon class="mr-3" color="#323232">mdi-file-cabinet</v-icon> Surface
      Management
    </h2>

    <div class="row">
      <div class="col-3" v-for="item of list" v-bind:key="item.id">
        <v-card class="mt-5" color="#fff2d5">
          <v-card-title>{{ item.name }}</v-card-title>

          <v-card-text> {{item.attributes.length}} Attributes<br />{{item.links.people.length}} People </v-card-text>
          <v-card-actions
            style="
              background-color: rgb(241, 241, 241);
              border-top: thin solid rgba(0, 0, 0, 0.12) !important;
            "
            dense
          >
            <v-btn small color="info" icon outlined :to="'/entity/' + item._id"
              ><v-icon>mdi-link-variant</v-icon></v-btn
            >
          </v-card-actions>
        </v-card>
      </div>
    </div>

    <h2 class="mt-3">
      <v-icon class="mr-3" color="#323232">mdi-file-cabinet</v-icon> Culverts
    </h2>
  </div>
</template>

<script>
import axios from "axios";
import { ENTITY_URL } from "../urls";

export default {
  name: "Grid",
  data: () => ({
    list: [],
  }),
  created() {
    axios
      .get(ENTITY_URL)
      .then((results) => {
        console.log(results.data.data);
        this.list = results.data.data;
      })
      .catch((err) => {
        console.err(err);
      });
  },
  methods: {},
};
</script>
