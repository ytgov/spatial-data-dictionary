<template>
  <div class="">
    <v-toolbar flat dense color="#f3b228" class="mb-5" style="color: red">
      <v-btn text style="margin-left: -10px; color: #323232" to="/dashboard"
        >Dashboard</v-btn
      >

      <v-divider vertical class="ml-0 mr-3"></v-divider>

      <v-menu bottom offset-y class="ml-0">
        <template v-slot:activator="{ on, attrs }">
          <div>
            <v-icon size="medium" style="mr-2" color="#323232"
              >mdi-file-cabinet</v-icon
            >
            <v-btn
              v-bind="attrs"
              v-on="on"
              text
              style="color: #323232 !important"
            >
              Surface Management<v-icon>mdi-menu-down</v-icon>
            </v-btn>
          </div>
        </template>

        <v-list>
          <v-subheader>Category:</v-subheader>
          <v-list-item link to="TESgin">
            <v-list-item-title router-link="st"
              >Surface Management</v-list-item-title
            >
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Culverts</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Vegetation</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-divider vertical class="ml-0 mr-3"></v-divider>

      <v-menu bottom offset-y class="ml-0" title="Entities">
        <template v-slot:activator="{ on, attrs }">
          <div>
            <v-icon size="medium" style="mr-2" color="#323232"
              >mdi-database-marker</v-icon
            >
            <v-btn
              v-bind="attrs"
              v-on="on"
              text
              style="color: #323232 !important"
            >
              Rehabilitation<v-icon>mdi-menu-down</v-icon>
            </v-btn>
          </div>
        </template>

        <v-list>
          <v-subheader>Entities:</v-subheader>
          <v-list-item>
            <v-list-item-title>Rehabilitation</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Condition B</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Condition G</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Condition P</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Planning</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Structure</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-divider vertical class="ml-0 mr-3"></v-divider>
    </v-toolbar>

    <div style="clear: both">
      <div style="float: left">
        <h1>
          {{ entity.name }}
          <v-btn color="primary" icon style="margin: 4px 0 12px 8px" small
            ><v-icon>mdi-star</v-icon></v-btn
          >
        </h1>
      </div>
      <div style="float: right; text-align: right">
        <h2 class="mb-1">
          {{ entity.primary }} <br />
          <span style="font-weight: 400">{{ entity.secondary }}</span>
        </h2>
      </div>
    </div>

    <hr class="mb-1" style="clear: both" />
    <p class="lead">
      {{ entity.description }}
    </p>

    <hr class="mb-4 mt-2" />

    <div class="row">
      <div class="col-md-8">
        <v-data-table
          :items="attributes"
          :headers="attributeHeaders"
          @click:row="clickRow"
        >
        </v-data-table>
      </div>
      <div class="col-md-4">
        <v-btn
          :color="sideAction == 'Add new Attribute' ? 'primary' : 'secondary'"
          @click="addNewAttribute"
          active
          >Add Attribute</v-btn
        >
        <v-btn
          class="float-right"
          :color="
            sideAction == 'Add source Attribute' ? 'primary' : 'secondary'
          "
          @click="addSourceAttribute"
          >Add from Source</v-btn
        >

        <v-card color="#fff2d5">
          <v-card-title>{{ sideAction }}</v-card-title>
          <v-card-text>
            <div v-if="sideAction == 'Add source Attribute'">
              <v-select
                :items="sources"
                item-text="name"
                outlined
                dense
                background-color="#fff"
                item-value="id"
                @change="changeSource"
              ></v-select>
            </div>
            <div v-if="sideAction == 'Add source Attribute'">
              <v-select
                :items="sourceAttributes"
                item-text="name"
                outlined
                dense
                background-color="#fff"
                @change="changeSourceAttribute"
              ></v-select>
            </div>

            <div v-if="sideAction != 'Add source Attribute'">
              <v-text-field
                dense
                v-model="editName"
                outlined
                label="Name (required)"
                required
                background-color="white"
              ></v-text-field>
            </div>

            <div v-if="sideAction != 'Add source Attribute'">
              <v-textarea
                dense
                v-model="editDescription"
                outlined
                label="Notes"
                rows="3"
                background-color="white"
              ></v-textarea>
            </div>

            <div v-if="sideAction != 'Add source Attribute'">
              <v-text-field
                dense
                v-model="editType"
                outlined
                label="Data type (required)"
                required
                background-color="white"
              ></v-text-field>
            </div>

            <div v-if="sideAction != 'Add source Attribute'">
              <v-switch
                v-model="editRequired"
                flat
                label="Required field"
              ></v-switch>
            </div>
            <div v-if="sideAction != 'Add source Attribute'">
              <v-text-field
                dense
                v-model="editAlias"
                outlined
                label="Alias"
                required
                background-color="white"
              ></v-text-field>
            </div>

            <div v-if="sideAction != 'Add source Attribute'">
              <v-text-field
                dense
                v-model="editDomain"
                outlined
                label="Domain"
                required
                background-color="white"
              ></v-text-field>
            </div>

            <v-btn color="primary" @click="sideSave">{{
              sideActionButton
            }}</v-btn>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!--   <v-banner icon="mdi-cash-register">
      <h2>Form help</h2>
      Help text can go in here to make the form more</v-banner
    > -->

    <!--  <v-btn
      color="primary"
      class="mr-5"
      :disabled="!form1Valid"
      @click="saveForm"
      >Save</v-btn
    >
    <v-btn color="secondary">Cancel</v-btn> -->

    <v-snackbar v-model="snackbar" right color="success">
      <v-icon class="mr-3">mdi-thumb-up-outline</v-icon>
      {{ apiSuccess }}
    </v-snackbar>
  </div>
</template>

<script>
import axios from "axios";
import { ENTITY_URL } from "../urls";

export default {
  name: "Form",
  data: () => ({
    tab: 0,
    showError: null,
    snackbar: null,
    apiSuccess: "",

    entity: {},
    attributes: [],
    sources: [],
    sourceAttributes: [],

    sideAction: "Add new Attribute",
    sideActionButton: "Add Attribute",

    editItem: {},
    editName: "",
    editDescription: "",
    editType: "",
    editRequired: false,
    editAlias: "",
    editDomain: "",

    attributeHeaders: [
      { text: "Field", value: "name" },
      { text: "Data type", value: "type" },
      { text: "Required", value: "required" },
      { text: "Notes", value: "description" },
      { text: "Alias", value: "alias" },
      { text: "Domain", value: "domain" },
    ],
  }),

  computed: {},

  created() {
    let id = this.$route.params.id;

    axios
      .get(`${ENTITY_URL}/${id}`)
      .then((result) => {
        this.entity = result.data.data;
        this.attributes = this.entity.attributes;
        this.sources = this.entity.links.entities;
      })
      .catch((err) => {
        console.log(err);
      });

    this.addNewAttribute();
  },

  methods: {
    addNewAttribute() {
      this.sideAction = "Add new Attribute";
      this.sideActionButton = "Add";
      this.clearEdits();
    },
    addSourceAttribute() {
      this.sideAction = "Add source Attribute";
      this.sideActionButton = "Add";
      this.clearEdits();
    },
    changeSource(sourceId) {
      console.log("Source changed to:", sourceId);

      axios
        .get(`${ENTITY_URL}/${sourceId}/attribute`)
        .then((result) => {
          this.sourceAttributes = result.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    changeSourceAttribute(item) {
      let selected = this.sourceAttributes.filter(
        (attr) => attr.name == item
      )[0];
      this.editItem = selected;
      this.editItem.oldName = "";
      this.editName = selected.name;
      this.editDescription = selected.description;
      this.editType = selected.type;
      this.editRequired = selected.required;
      this.editAlias = selected.alias;
      this.editDomain = selected.domain;
    },
    sideSave() {
      console.log("SIDE SAVE");

      if (this.sideAction == "Edit Attribute") {
        let body = {
          oldName: this.editItem.oldName,
          name: this.editName,
          description: this.editDescription,
          type: this.editType,
          alias: this.editAlias,
          domain: this.editDomain,
          required: this.editRequired,
        };

        axios
          .post(`${ENTITY_URL}/${this.entity._id}/attribute`, body)
          .then((result) => {
            this.attributes = result.data.data.attributes;
            //this.clearEdits();

            this.snackbar = true;
            this.apiSuccess = "Attribute saved";
          });
      } else if (this.sideAction == "Add new Attribute") {
        let body = {
          //oldName: this.editItem.oldName,
          name: this.editName,
          description: this.editDescription,
          type: this.editType,
          alias: this.editAlias,
          domain: this.editDomain,
          required: this.editRequired,
        };

        axios
          .post(`${ENTITY_URL}/${this.entity._id}/attribute`, body)
          .then((result) => {
            this.attributes = result.data.data.attributes;
            this.clearEdits();

            this.snackbar = true;
            this.apiSuccess = "Attribute added";
          });
      } else if (this.sideAction == "Add source Attribute") {
        let body = {
          oldName: this.editItem.oldName,
          name: this.editName,
          description: this.editDescription,
          type: this.editType,
          alias: this.editAlias,
          domain: this.editDomain,
          required: this.editRequired,
        };

        axios
          .post(`${ENTITY_URL}/${this.entity._id}/attribute`, body)
          .then((result) => {
            this.attributes = result.data.data.attributes;
            this.clearEdits();

            this.snackbar = true;
            this.apiSuccess = "Attribute added";
          });
      }
    },
    clickRow(item, t) {
      console.log(item, t);
      this.sideAction = "Edit Attribute";
      this.sideActionButton = "Save Changes";

      this.editItem = item;
      this.editItem.oldName = item.name;
      this.editName = item.name;
      this.editDescription = item.description;
      this.editType = item.type;
      this.editRequired = item.required;
      this.editAlias = item.alias;
      this.editDomain = item.domain;
    },

    clearEdits() {
      this.editItem = null;
      this.editName = "";
      this.editDescription = "";
      this.editType = "";
      this.editRequired = false;
      this.editAlias = "";
      this.editDomain = "";
    },
  },
};
</script>
