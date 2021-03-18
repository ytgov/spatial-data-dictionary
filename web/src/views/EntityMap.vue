<template>
  <div class="" :key="entity_id">
    <div style="clear: both">
      <div style="float: left">
        <h1>
          {{ entity.name }}
          <br />

          <status-chip :status="entity.status"></status-chip>
          <location-chip :location="entity.location.type"></location-chip>

          <br />
          <v-chip
            class="mr-2"
            v-for="tag of entity.tags"
            v-bind:key="tag"
            link
            :to="'/tags/' + tag"
          >
            <v-icon left> mdi-tag </v-icon>{{ tag }}
          </v-chip>
        </h1>
      </div>
      <div style="float: right; text-align: right">
        <h2 class="mb-1">
          {{ entity.location.name }}<br />
          <span
            class="program-link"
            v-for="program of entity.links.programs"
            v-bind:key="program.id"
            >{{ program.name }}</span
          >
        </h2>
      </div>
    </div>

    <p class="lead" style="clear: both">
      {{ entity.description }}
    </p>
    <hr class="mb-1" />

    <div id="graph"></div>
  </div>
</template>

<style>
#graph {
  width: 100%;
  min-height: 500px;
  border: 1px #bbb solid;
  background-color: #eee;
  padding: 10px 20px
}
</style>
<script>
import axios from "axios";
import moment from "moment";
import { ENTITY_URL } from "../urls";

import cytoscape from "cytoscape";

export default {
  name: "Form",
  data: () => ({
    tab: 0,
    showError: null,
    snackbar: null,
    apiSuccess: "",

    entity_id: "",
    entity: { links: {}, location: {}, properties: [] },

    changeHeaders: [
      { text: "Date", value: "id" },
      { text: "Name", value: "id" },
      { text: "Description", value: "id" },
    ],

    changeDateMin: moment().format("YYYY-MM-DD"),
    changeDate: moment().add(7, "days").format("YYYY-MM-DD"),
    changeDateMenu: null,
  }),
  computed: {},
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    "$route.params.id": {
      handler: function (id) {
        this.entity_id = id;
        this.loadEntity(this.entity_id);
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.entity_id = this.$route.params.id;
    this.loadEntity(this.entity_id);
    this.buildMap();
  },
  methods: {
    initialize() {},
    loadEntity(id) {
      axios
        .get(`${ENTITY_URL}/${id}`)
        .then((result) => {
          this.entity = result.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    buildMap() {
      axios
        .get(`${ENTITY_URL}/${this.entity_id}/graph-data`)
        .then((result) => {
          let elements = result.data.data;

          cytoscape({
            container: document.getElementById("graph"), // container to render in
            style: [
              {
                selector: "node",
                style: {
                  "background-color": "#2196f3",
                  label: "data(label)",
                },
              },
              {
                selector: "edge",
                style: {
                  width: 2,
                  "curve-style": "straight",
                },
              },

              {
                selector: "edge[arrow]",
                style: {
                  "target-arrow-shape": "data(arrow)",
                },
              },
            ],
            elements: elements,
            userZoomingEnabled: false,
            panningEnabled: false,
            layout: {
              name: "grid",
              directed: true,
            },
          });

          //cy.fit();
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>
