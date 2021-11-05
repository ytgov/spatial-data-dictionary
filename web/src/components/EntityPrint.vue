<template>
  <div class="" :key="entity_id" style="font-size: ">
    <div style="clear: both">
      <div style="float: left">
        <h1>
          {{ entity.name }}

          <br />

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
            <v-icon left>mdi-tag</v-icon>{{ tag }}
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
        <!-- <v-btn class="mr-5" color="info" :to="'/entity/' + entity._id + '/edit'"
          >Edit</v-btn
        > -->
        <!-- <v-btn
          color="secondary"
          :to="'/entity/' + entity._id + '/change-request'"
          >Request Change</v-btn
        > -->
      </div>
    </div>

    <p class="lead" style="clear: left">
      {{ entity.description }}
    </p>
    <hr class="mb-1" style="clear: both" />

    <div class="row">
      <div class="col-md-12">
        <h2>Attributes</h2>
        <v-data-table
          :items="attributes"
          :sort-by="['order']"
          :headers="attributeHeaders"
          disable-pagination
          hide-default-footer
        >
          <template v-slot:item.domain="{ item }">
            <span>{{ getDomainName(item) }}</span>
          </template>
          <template v-slot:item.source="{ item }"
            ><span>{{ getSourceName(item) }}</span>
          </template>
        </v-data-table>

        <h2 class="mt-5">Properties</h2>
        <v-data-table
          :headers="propertyHeaders"
          :items="properties"
          :sort-by="['name']"
          disable-pagination
          hide-default-footer
        >
        </v-data-table>

        <h2 class="mt-5">Values</h2>
        <v-data-table
          :headers="valuesHeaders"
          :items="values"
          :sort-by="['name']"
          disable-pagination
          hide-default-footer
        >
        </v-data-table>
        <h2 class="mb-4">Connections</h2>

        <div v-for="item in entity.links.people" v-bind:key="item.id">
          <v-card color="#fff2d5" class="mb-2">
            <v-card-text
              ><v-icon>mdi-account-circle</v-icon> &nbsp;
              <strong
                ><a>{{ item.name }}</a></strong
              >
              <br />
              {{ item.role }}</v-card-text
            >
          </v-card>
        </div>



    <div id="graph"></div>



      </div>
    </div>
  </div>
</template>

<style>
.program-link {
  font-weight: 400;
}
.program-link:after {
  content: ", ";
}
.program-link:last-child:after {
  content: "";
}
#graph {
  width: 100%;
  min-height: 500px;
  border: 1px #bbb solid;
  padding: 10px 20px;
}
</style>
<script>
import axios from "axios";
import { ENTITY_URL } from "../urls";
import router from "../router";
import store from "../store";

import cytoscape from "cytoscape";

export default {
  name: "Form",
  data: () => ({
    showEntityDeleteDialog: false,

    tab: 0,
    showError: null,
    snackbar: null,
    apiSuccess: "",
    connectionDialogVisible: null,
    editConnectionDialogVisible: null,
    properties: [],

    entity_id: "",
    entity: { links: {}, location: {}, properties: [] },
    attributes: [],
    values: [],

    valuesHeaders: [
      { text: "Name", value: "name" },
      { text: "Value", value: "value" },
      { text: "Description", value: "description" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    propertyHeaders: [
      { text: "Name", value: "name" },
      { text: "Value", value: "value" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    attributeHeaders: [
      { text: "Field", value: "name" },
      { text: "Data type", value: "type" },
      { text: "Required", value: "required" },
      { text: "Description", value: "description" },
      { text: "Notes", value: "notes" },
      { text: "Alias", value: "alias" },
      { text: "Domain", value: "domain" },
      { text: "Source", value: "source" },
    ],

    dialog: false,
    dialogDelete: false,

    valDialog: false,
    valDialogDelete: false,

    editedIndex: -1,
    editedItem: {
      name: "",
      value: "",
      description: "",
    },
    defaultItem: {
      name: "",
      value: "",
      description: "",
    },
    connectionEntity: {},
    downEntity: {},
    personIndex: -1,

    changes: [],

    changeRequests: [],

    duplicateName: "",
    duplicationDialogVisible: false,
    duplicateIsValid: true,
    duplicateRequiredRule: [(v) => !!v || "New entity name is required"],

    isWatched: false,
    canEdit: false,
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Add Property" : "Edit Property";
    },
    valFormTitle() {
      return this.editedIndex === -1 ? "Add Domain Value" : "Edit Domain Value";
    },
    roles: function () {
      return store.getters.roles;
    },
  },
  watch: {
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
    //this.loadEntity(this.entity_id);
    this.canEdit =
      this.roles.indexOf("Writer") >= 0 || this.roles.indexOf("Admin") >= 0;
  },
  methods: {
    loadEntity(id) {
      axios
        .get(`${ENTITY_URL}/${id}`)
        .then(async (result) => {
          this.entity = result.data.data;
          this.attributes = this.entity.attributes;

          if (!this.entity.properties) this.entity.properties = new Array();
          this.properties = this.entity.properties;

          if (!this.entity.values) this.entity.values = new Array();
          this.values = this.entity.values;

          this.isWatched = await store.dispatch("profile/isWatched", id);
          this.buildMap();
        })
        .catch((err) => {
          console.log(err);
          router.push("/entity");
        });
    },

    getDomainName(item) {
      if (item.domain && item.domain.name) return item.domain.name;
      return "";
    },

    getSourceName(item) {
      if (item.source && item.source.name) return item.source.name;
      return "";
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeVal() {
      this.valDialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    closeValDelete() {
      this.valDialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    showEntityDelete() {
      this.showEntityDeleteDialog = true;
    },


buildMap() {
      axios
        .get(`${ENTITY_URL}/${this.entity_id}/graph-data`)
        .then((result) => {
          let elements = result.data.data;
          let dataLayout = result.data.layout;

           cytoscape({
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
            userZoomingEnabled: false,
            panningEnabled: false,
            layout: {
              name: dataLayout,
              //fit: true,
               nodeDimensionsIncludeLabels: true,
            },
          });
        })
        .catch((err) => {
          console.log(err);
        });
    },

  },
};
</script>
<style type="text/css" media="print">
.v-data-table td {
  font-size: 0.75rem !important;
}
</style>