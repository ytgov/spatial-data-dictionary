<template>
  <div class="">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[{ text: 'Dashboard', href: '/dashboard' }, { text: 'Search' }]"
    ></v-breadcrumbs>

    <h1>Search</h1>

    <hr class="mb-3" />

    <div class="row mt-5" style="clear: both">
      <div class="col-md-10">
        <v-text-field
          v-model="search"
          outlined
          dense
          hide-details
          label="Search term"
          @keydown="searchKeyUp"
        ></v-text-field>
      </div>
      <!--<div class="col-md-5">
         <v-select
          v-model="resultType"
          outlined
          dense
          hide-details
          multiple
          label="Result types"
          :items="['Entity', 'Attribute', 'Changes']"
        ></v-select> 
      </div>-->
      <div class="col-md-2">
        <v-btn
          class="my-0"
          style="width: 100%"
          color="primary"
          @click="doSearch"
          :loading="isLoading"
          >Search</v-btn
        >
      </div>

      <div class="col-md-12">
        <v-card class="" color="#fff2d5">
          <v-data-table
            :items="entityResults"
            :loading="isLoading"
            :headers="[
              { text: 'Entity', value: 'name' },
              { text: 'Reason', value: 'search_reason' },
            ]"
          >
          </v-data-table>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ENTITY_URL } from "../urls";

export default {
  name: "Locations",
  data: () => ({
    isLoading: null,
    search: "",
    resultType: ["Entity"],
    entityResults: [],
  }),
  watch: {
    "$route.query.term": {
      handler: function (term) {
        this.search = term;
        this.doSearch();
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    //let parameters = this.$route.query;
    //this.search = parameters.term;
    //this.doSearch();
  },
  methods: {
    doSearch() {
      this.isLoading = true;
      axios
        .post(`${ENTITY_URL}/search`, {
          term: this.search,
          types: this.resultType,
        })
        .then((result) => {
          this.entityResults = result.data.data.entities;
          this.isLoading = null;
        })
        .catch((error) => {
          console.error(error);
          this.isLoading = null;
        });
    },
    searchKeyUp(event) {
      if (event.code == "Enter") {
        this.doSearch();
      }
    },
  },
};
</script>
