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
        </h1>
      </div>
      <div style="float: right; text-align: right">
        <h2 class="mb-1">
          {{ entity.location.name }} <br /><span
            class="program-link"
            v-for="program of entity.links.programs"
            v-bind:key="program.id"
          >
            {{ program.name }}</span
          >
        </h2>
      </div>
      <div style="clear: both"></div>
    </div>

    <v-card>
      <v-tabs v-model="tab" background-color="#fff2d5" color="primary">
        <v-tab key="0">Properties</v-tab>
        <v-tab key="1">Attributes</v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab" style="padding: 20px">
        <v-tab-item key="0">
          <v-form>
            <div class="row">
              <div class="col-md-6">
                <v-text-field
                  label="Name (required)"
                  required
                  dense
                  hide-details
                  outlined
                  v-model="entity.name"
                ></v-text-field>
              </div>
              <div class="col-md-6">
                <v-combobox
                  dense
                  outlined
                  label="Location"
                  hide-details
                  item-text="name"
                  item-value="_id"
                  :items="locationOptions"
                  v-model="editLocation"
                ></v-combobox>
              </div>
              <div class="col-md-12">
                <v-select
                  dense
                  outlined
                  multiple
                  label="Program"
                  :items="programOptions"
                  item-text="name"
                  item-value="_id"
                  hide-details
                  v-model="editPrograms"
                ></v-select>
              </div>

              <div class="col-md-12">
                <v-textarea
                  label="Description"
                  rows="3"
                  outlined
                  hide-details
                  dense
                  v-model="entity.description"
                ></v-textarea>
              </div>

              <!-- <div class="col-md-6">
                <v-card color="#fff2d5">
                  <v-card-subtitle>Location</v-card-subtitle>
                  <v-card-text>
                    <v-select
                      class="mb-5"
                      label="Storage"
                      outlined
                      hide-details
                      dense
                      v-model="entity.location.storage"
                      background-color="white"
                      :items="locationTypes"
                    ></v-select>

                    <div :hidden="entity.location.storage != 'Database'">
                      <v-text-field
                        label="Host"
                        outlined
                        hide-details
                        dense
                        v-model="entity.location.database_host"
                        background-color="white"
                        class="mb-5"
                      ></v-text-field>
                      <v-text-field
                        label="Schema"
                        outlined
                        hide-details
                        dense
                        v-model="entity.location.database_schema"
                        background-color="white"
                        class="mb-5"
                      ></v-text-field>
                      <v-text-field
                        label="Table"
                        outlined
                        hide-details
                        dense
                        v-model="entity.location.database_table"
                        background-color="white"
                      ></v-text-field>
                    </div>

                    <div :hidden="entity.location.storage != 'Web service'">
                      <v-text-field
                        label="URL Endpoint"
                        outlined
                        hide-details
                        dense
                        v-model="entity.location.web_service_url"
                        background-color="white"
                        class="mb-5"
                      ></v-text-field>
                      <v-text-field
                        label="Server"
                        outlined
                        hide-details
                        dense
                        v-model="entity.location.web_service_host"
                        background-color="white"
                      ></v-text-field>
                      <v-switch
                        v-model="entity.location.web_service_public"
                        label="Is public?"
                      ></v-switch>
                    </div>

                    <div :hidden="entity.location.storage != 'File'">
                      <v-text-field
                        label="File path"
                        outlined
                        hide-details
                        dense
                        v-model="entity.location.file_path"
                        background-color="white"
                        class="mb-5"
                      ></v-text-field>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
 -->
              <div class="col-md-6">
                <v-select
                  label="Status"
                  v-model="entity.status"
                  dense
                  hide-details
                  outlined
                  :items="statusOptions"
                ></v-select>

                <v-switch
                  label="Is Domain Table?"
                  v-model="entity.is_domain"
                  dense
                  outlined
                ></v-switch>

                <v-combobox
                  dense
                  outlined
                  label="Tags"
                  :items="tagOptions"
                  hide-selected
                  multiple
                  small-chips
                  v-model="entity.tags"
                ></v-combobox>
              </div>
            </div>

            <v-btn @click="saveProperties()" color="primary" class="mr-5"
              >Save</v-btn
            >
            <v-btn :to="'/entity/' + entity._id" color="secondary">Done</v-btn>
          </v-form>
        </v-tab-item>

        <v-tab-item key="1">
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
              <div>
                <v-btn
                  :color="
                    sideAction == 'Add new Attribute' ? 'primary' : 'secondary'
                  "
                  @click="addNewAttribute"
                  active
                  >Add</v-btn
                >
                <v-btn
                  class="float-right"
                  :color="
                    sideAction == 'Add source Attribute'
                      ? 'primary'
                      : 'secondary'
                  "
                  @click="addSourceAttribute"
                  >Add from Source</v-btn
                >
                <div style="clear: both"></div>
              </div>
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
                      label="Data type"
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
                    <v-select
                      dense
                      v-model="editDomain"
                      outlined
                      label="Domain"
                      :items="domainOptions"
                      item-text="name"
                      item-value="_id"
                      clearable
                      background-color="white"
                    ></v-select>
                  </div>
                  
                  <v-autocomplete
                    dense
                    outlined
                    v-model="editSourceAttrId"
                    label="Source"
                    :items="sourceOptions"
                    item-text="name"
                    item-value="id"
                    clearable
                    background-color="white"
                  ></v-autocomplete>

                  <v-btn color="primary" @click="sideSave">{{
                    sideActionButton
                  }}</v-btn>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
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
import { ENTITY_URL, LOCATION_URL, PROGRAM_URL, DOMAIN_URL } from "../urls";

export default {
  name: "Form",
  data: () => ({
    tab: 0,
    showError: null,
    snackbar: null,
    apiSuccess: "",

    entity: { location: {}, links: { programs: [], entities: [], people: [] } },
    attributes: [],
    sources: [],
    sourceAttributes: [],
    locationTypes: ["Database", "File", "Web service"],
    statusOptions: ["Draft", "Complete", "Archived"],
    tagOptions: ["Important", "This will be dynamic"],
    locationOptions: [],
    programOptions: [],
    domainOptions: [],
    sourceOptions: [],

    sideAction: "Add new Attribute",
    sideActionButton: "Add Attribute",

    editItem: {},
    editName: "",
    editDescription: "",
    editType: "",
    editRequired: false,
    editAlias: "",
    editDomain: {},
    editPrograms: [],
    editLocation: {},
    editSourceAttrId: "",

    attributeHeaders: [
      //{ text: "Id", value: "_id" },
      { text: "Field", value: "name" },
      { text: "Data type", value: "type" },
      { text: "Required", value: "required" },
      { text: "Notes", value: "description" },
      { text: "Alias", value: "alias" },
      { text: "Domain", value: "domain.name" },
      { text: "Source", value: "source.name" },
    ],
  }),

  computed: {},
  watch: {
    editPrograms: function (val) {
      this.entity.links.programs = this.programOptions.filter(
        (p) => val.indexOf(p._id) >= 0
      );
    },
  },

  created() {
    let id = this.$route.params.id;

    axios
      .get(`${ENTITY_URL}/${id}`)
      .then((result) => {
        this.entity = result.data.data;
        this.attributes = this.entity.attributes;
        this.sources = this.entity.links.entities;
        this.editLocation = this.entity.location;

        if (this.entity.links.programs) {
          this.editPrograms = this.entity.links.programs.map((p) => p.id);
        }

        if (!this.entity.location)
          this.entity.location = { storage: "Database", name: "" };

        if (this.sources) {
          for (let e of this.sources) {
            for (let a of e.attributes) {
              this.sourceOptions.push({
                id: a._id,
                name: `${e.name}.${a.name}`,
              });
            }
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get(LOCATION_URL)
      .then((result) => {
        this.locationOptions = result.data.data;
      })
      .catch((error) => {
        console.error(error);
      });

    axios
      .get(PROGRAM_URL)
      .then((result) => {
        this.programOptions = result.data.data;
      })
      .catch((error) => {
        console.error(error);
      });

    axios
      .get(DOMAIN_URL)
      .then((result) => {
        this.domainOptions = result.data.data;
      })
      .catch((error) => {
        console.error(error);
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
      this.editAttrId = selected._id;
      this.editItem = selected;
      this.editItem.oldName = "";
      this.editName = selected.name;
      this.editDescription = selected.description;
      this.editType = selected.type;
      this.editRequired = selected.required;
      this.editAlias = selected.alias;
      this.editDomain = selected.domain.id;
      this.editSourceAttrId = selected.source.id;
    },
    sideSave() {
      if (this.sideAction == "Edit Attribute") {
        let body = {
          _id: this.editAttrId,
          oldName: this.editItem.oldName,
          name: this.editName,
          description: this.editDescription,
          type: this.editType,
          alias: this.editAlias,
          domain: { id: this.editDomain },
          required: this.editRequired,
          source: { id: this.editSourceAttrId },
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
          domain: { id: this.editDomain },
          required: this.editRequired,
          source: { id: this.editSourceAttrId },
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
          source: { id: this.editSourceAttrId },
          oldName: this.editItem.oldName,
          name: this.editName,
          description: this.editDescription,
          type: this.editType,
          alias: this.editAlias,
          domain: { id: this.editDomain },
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

      this.editAttrId = item._id;
      this.editItem = item;
      this.editItem.oldName = item.name;
      this.editName = item.name;
      this.editDescription = item.description;
      this.editType = item.type;
      this.editRequired = item.required;
      this.editAlias = item.alias;
      this.editDomain = item.domain ? item.domain.id : "";
      this.editSourceAttrId = item.source ? item.source.id : "";
    },

    clearEdits() {
      this.editAttrId = "";
      this.editItem = null;
      this.editName = "";
      this.editDescription = "";
      this.editType = "";
      this.editRequired = false;
      this.editAlias = "";
      this.editDomain = "";
      this.editSourceAttrId = "";
    },

    findSourceAttribute(id) {
      if (!id) return "No Source Selected";

      let entityName = "";

      for (let e of this.entity.links.entities) {
        entityName = e.name;
        let attrMatches = e.attributes.filter((a) => a._id == id);

        if (attrMatches.length > 0) {
          let attr = attrMatches[0];

          return `${entityName}:${attr.name}`;
        }
      }

      return "NAME OF " + id;
    },

    saveProperties() {
      let body = this.entity;

      body.location = {
        id: this.editLocation._id || this.editLocation.id,
      };
      body.links.programs = [];

      if (this.editPrograms) {
        let pList = [];
        for (let p of this.editPrograms) {
          if (p) pList.push({ id: p });
        }
        body.links.programs = pList;
      }

      axios.put(`${ENTITY_URL}/${this.entity._id}`, body).then((result) => {
        this.entity = result.data.data.value;
        this.clearEdits();

        this.snackbar = true;
        this.apiSuccess = "Changes saved";
      });
    },
  },
};
</script>
