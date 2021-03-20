<template>
  <div>
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[{ text: 'Dashboard', href: '/dashboard' }, { text: 'Changes' }]"
    ></v-breadcrumbs>
    <h1>Changes</h1>

    <hr class="mb-1" />

    <div class="row">
      <div class="col-md-8">
        <v-card class="" color="#fff2d5">
          <v-data-table
            :items="changes"
            :headers="[
              { text: 'Entity', value: 'entity.name' },
              { text: 'Location', value: 'entity.location.name' },
              { text: 'Change title', value: 'title' },
              { text: 'Reason', value: 'reason' },
              { text: 'Status', value: 'status' },
            ]"
            @click:row="changeClick"
            :sort-by="['date']"
            :sort-desc="['true']"
          >
          </v-data-table>
        </v-card>
      </div>
      <div class="col-md-6"></div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ENTITY_URL } from "../urls";
import _ from "lodash";
import router from "../router";

export default {
  name: "Form",
  data: () => ({
    changes: [],
  }),
  computed: {},
  created() {
    this.loadChanges(this.entity_id);
  },
  methods: {
    loadChanges() {
      axios
        .get(`${ENTITY_URL}/changes`)
        .then((result) => {
          this.changes = result.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    changeClick(item) {
      this.changeItem = _.clone(item);
      this.changeDialogOpen = true;
      router.push(`/entity/${item.entity_id}/changes/${item._id}`);
    },
  },
};
</script>
