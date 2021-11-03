<template>
  <div class="" :key="entity_id">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[
        { text: 'Dashboard', href: '/dashboard' },
        { text: 'Entities', href: '/entity' },
        { text: entity.name, href: '/entity/' + entity._id },
        { text: 'Graph' },
      ]"
    ></v-breadcrumbs>

    <div style="clear: both">
      <div style="float: left">
        <h1>
          {{ entity.name }}
          <v-btn
            color="primary"
            icon
            style="margin: 4px 0 12px 8px"
            small
            @click="toggleWatched()"
            ><v-icon v-if="isWatched" title="Remove from watchlist"
              >mdi-star</v-icon
            ><v-icon v-if="!isWatched" title="Add to watchlist"
              >mdi-star-outline</v-icon
            ></v-btn
          ><br />
          <status-chip :status="entity.status"></status-chip>
          <location-chip :location="entity.location.type"></location-chip>
          <entity-type-chip :type="entity.entity_type"></entity-type-chip>

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
          <router-link :to="'/entity?location=' + entity.location.id">{{
            entity.location.name
          }}</router-link
          ><br />
          <span
            class="program-link"
            v-for="program of entity.links.programs"
            v-bind:key="program.id"
          >
            <router-link :to="'/entity?program=' + program.id">{{
              program.name
            }}</router-link></span
          >
        </h2>
      </div>
    </div>

    <p class="lead" style="clear: both">
      {{ entity.description }}
    </p>

    <div id="graph"></div>

    <notifications ref="notifier"></notifications>

    <v-dialog v-model="showPopup" max-width="700px">
      <v-container class="pb-3" style="background-color: white">
        <h2>{{ selectedEntity.name }}</h2>
        <p class="lead">{{ selectedEntity.description }}</p>
        <v-card>
          <v-card-text>
            <status-chip :status="selectedEntity.status"></status-chip>
            <location-chip
              :location="selectedEntity.location.type"
            ></location-chip>
            <entity-type-chip
              :type="selectedEntity.entity_type"
            ></entity-type-chip>

            <br />
            <v-chip
              class="mr-2 mt-4"
              v-for="tag of selectedEntity.tags"
              v-bind:key="tag"
              link
              :to="'/tags/' + tag"
            >
              <v-icon left> mdi-tag </v-icon>{{ tag }}
            </v-chip>

            <div
              class="mt-5"
              style="max-height: 200px; overflow-y: scroll"
              v-if="selectedEntity.attributes"
            >
              <v-divider class="mb-4"></v-divider>
              <h3>Attributes</h3>

              <p
                v-for="(attr, i) of selectedEntity.attributes"
                :key="i"
                class="mb-1"
              >
                {{ attr.name }} : {{ attr.type }}
              </p>
            </div>
          </v-card-text>
        </v-card>
        <v-btn color="primary" class="mr-4" :to="`/entity/${selectedId}`">
          <v-icon class="mr-2">mdi-link-variant</v-icon> View Entity Details
        </v-btn>

        <v-btn color="primary" :to="`/entity/${selectedId}/map`">
          <v-icon class="mr-2">mdi-graph</v-icon> View Entity Graph
        </v-btn>
      </v-container>
    </v-dialog>
  </div>
</template>

<style>
#graph {
  width: 100%;
  min-height: 500px;
  border: 1px #bbb solid;
  background-color: #eee;
  padding: 10px 20px;
}
</style>
<script>
import axios from "axios";
import moment from "moment";
import { ENTITY_URL } from "../urls";
import store from "../store";

import cytoscape from "cytoscape";
//import cola from "cytoscape-cola";

//npm install cytoscape-sbgn-stylesheet
//var sbgnStylesheet = require('cytoscape-sbgn-stylesheet');
// https://github.com/PathwayCommons/cytoscape-sbgn-stylesheet

let monkey = null;

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

    isWatched: false,

    showPopup: null,
    selectedName: "",
    selectedId: "",
    selectedEntity: { location: {} },
    graphObj: null,
    testing: "htppy.om"
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
        this.loadEntity(id);
        this.showPopup = null;
        this.selectedName = "";
        this.selectedId = "";
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.entity_id = this.$route.params.id;
    this.loadEntity(this.entity_id);
  },
  methods: {
    initialize() {},
    loadEntity(id) {
      if (id == this.entity_id) return;

      this.entity_id = id;

      axios
        .get(`${ENTITY_URL}/${id}`)
        .then(async (result) => {
          this.entity = result.data.data;
          this.isWatched = await store.dispatch("profile/isWatched", id);
          this.buildMap();
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
          let dataLayout = result.data.layout;

          let cy = cytoscape({
            container: document.getElementById("graph"), // container to render in
            style: [
              {
                selector: "node.blue",
                style: {
                  "background-color": "#2196f3",
                  label: "data(label)",
                  shape: "round-rectangle",
                },
              },
              {
                selector: "node.domain",
                style: {
                  "background-color": "#dc4405",
                  label: "data(label)",
                  shape: "octagon",
                },
              },
              {
                selector: "node.webservice",
                style: {
                  "background-color": "#f3b228",
                  label: "data(label)",
                  shape: "tag",
                },
              },
              {
                selector: "node.location",
                style: {
                  "background-color": "#fff2d5",
                  "font-weight": "bold",
                  label: "data(label)",
                  shape: "rectangle",
                },
              },
              {
                selector: "node.web",
                style: {
                  "background-color": "#A6D5FA",
                  "font-weight": "bold",
                  label: "data(label)",
                  shape: "rectangle",
                },
              },
              {
                selector: "node.star.brown",
                style: {
                  label: "data(label)",
                  shape: "star",
                },
              },
              {
                selector: "node.brown",
                style: {
                  "background-color": "#4caf50",
                  label: "data(label)",
                  shape: "star",
                },
              },
              {
                selector: "edge",
                style: {
                  width: 2,
                  "curve-style": "straight",
                  "target-arrow-shape": "data(arrow)",
                  "target-arrow-color": "#323232",
                  "line-color": "#323232",
                },
              },

              {
                selector: "edge[arrow]",
                style: {
                  "target-arrow-shape": "data(arrow)",
                  "background-color": "#323232",
                },
              },
            ],
            elements: elements,
            //userZoomingEnabled: false,
            //panningEnabled: false,
            layout: {
              name: dataLayout,
              //fit: true,
               nodeDimensionsIncludeLabels: true,
            },
          });

          let self = this;

          cy.on("select", function (event) {
            let node = event.target[0];

            if (node.children().length > 0) return;
            if (node.group() == "edges") return

            let id = node.id();
            let group = node.group();

            self.selectedId = id;
            self.loadEntityInfo(id, group);
          });

          cy.on("dragfreeon", async function (event) {
            if (event.target[0].children().length > 0) {
              for (let child of event.target[0].children()) {
                console.log(child.position());

                await self.savePosition(
                  child.id(),
                  child.position().x,
                  child.position().y
                );
              }
            } else {
              await self.savePosition(
                event.target[0].id(),
                event.target[0].position().x,
                event.target[0].position().y
              );
            }
            cy.fit();
          });

         monkey = cy;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    toggleWatched() {
      if (this.isWatched) {
        store.dispatch("profile/removeWatchlist", this.entity);
        this.$refs.notifier.showSuccess(
          `${this.entity.name} has been removed from your watchlist`
        );
      } else {
        store.dispatch("profile/addWatchlist", this.entity);
        this.$refs.notifier.showSuccess(
          `${this.entity.name} has been added to your watchlist`
        );
      }

      this.isWatched = !this.isWatched;
    },

    loadEntityInfo(id) {
      axios.get(`${ENTITY_URL}/${id}`).then((resp) => {
        this.selectedEntity = resp.data.data;
        this.selectedName = resp.data.data.name;

        this.showPopup = true;
      });
    },

    savePosition(id, x, y) {
      axios
        .put(`${ENTITY_URL}/${this.entity_id}/graph-positions`, {
          child_id: id,
          x,
          y,
        })
        .then((resp) => {
          this.$refs.notifier.showAPIMessages(resp.data);
        });
    },

    doPrint() {
      let t= monkey.png();
      this.testing = t;
    },
  },
};
</script>
