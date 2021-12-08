<template>
  <div class="">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[
        { text: 'Dashboard', to: '/dashboard' },
        { text: 'Entities', to: '/entity', exact: true },
        { text: entity.name, to: '/entity/' + entity._id, exact: true },
        { text: 'Edit' },
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
      </div>
      <div style="clear: both"></div>
    </div>

    <div class="float-right mb-3">
      <v-btn @click="saveEntity()" color="primary" class="mr-5 my-0"
        >Save</v-btn
      >
      <v-btn @click="doneClick" color="secondary" class="my-0">Done</v-btn>
    </div>
    <h3
      class="error-text"
      v-if="savedStatus != 'Draft'"
      style="line-height: 36px; float: left"
    >
      * Changes are not allowed unless the Entity status is set to Draft
    </h3>

    <v-card style="clear: both">
      <v-tabs v-model="tab" background-color="#fff2d5" color="primary">
        <v-tab key="0">Entity Details</v-tab>
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
                  :disabled="savedStatus != 'Draft'"
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
                  :disabled="savedStatus != 'Draft'"
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
                  :disabled="savedStatus != 'Draft'"
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
                  :disabled="savedStatus != 'Draft'"
                  v-model="entity.description"
                ></v-textarea>
              </div>

              <div class="col-md-6">
                <v-select
                  label="Status"
                  v-model="entity.status"
                  dense
                  hide-details
                  outlined
                  :items="statusOptions"
                ></v-select>
              </div>

              <div class="col-md-6">
                <v-select
                  label="Entity type"
                  v-model="entity.entity_type"
                  dense
                  hide-details
                  outlined
                  :disabled="savedStatus != 'Draft'"
                  :items="[
                    'Feature class',
                    'Domain table',
                    'Table',
                    'View',
                    'Web service',
                  ]"
                ></v-select>
              </div>

              <div class="col-md-6">
                <v-combobox
                  dense
                  outlined
                  label="Tags"
                  hide-selected
                  multiple
                  small-chips
                  v-model="entity.tags"
                  :disabled="savedStatus != 'Draft'"
                  hint="Enter a tag and hit tab to add"
                ></v-combobox>
              </div>
            </div>
          </v-form>
        </v-tab-item>

        <v-tab-item key="1">
          <div class="row">
            <div class="col-md-12">
              <div v-if="savedStatus == 'Draft'">
                <v-btn color="primary" class="mr-5" @click="addNewAttribute"
                  >Add</v-btn
                >
                <v-btn color="secondary" @click="importAttributes"
                  >Import CSV</v-btn
                >
              </div>

              <v-data-table
                :items="attributes"
                :headers="attributeHeaders"
                disable-sort
                :sort-by="['order']"
                @click:row="clickRow"
              >
                <template v-slot:item.order="{ item }">
                  {{ item.order }}

                  <div v-if="savedStatus == 'Draft'">
                    <v-btn
                      color="primary"
                      v-if="item.order != 1"
                      icon
                      outlined
                      x-small
                      class="mx-0 my-0 mr-1"
                      @click.stop="moveAttrUp(item)"
                      ><v-icon>mdi-chevron-up</v-icon>
                    </v-btn>
                    <v-btn
                      color="primary"
                      v-if="item.order < attributes.length"
                      icon
                      outlined
                      x-small
                      class="mx-0 my-0"
                      @click.stop="moveAttrDown(item)"
                      ><v-icon>mdi-chevron-down</v-icon></v-btn
                    >
                  </div>
                </template>
              </v-data-table>
            </div>
            <div class="col-md-4" v-if="savedStatus == 'Draft'"></div>
          </div>
        </v-tab-item>
      </v-tabs-items>
    </v-card>

    <v-dialog v-model="showAttributeEditor" persistent max-width="600px">
      <v-container class="pb-3" style="background-color: white">
        <h2>{{ sideAction }}</h2>

        <div style="clear: both"></div>

        <v-card color="#fff2d5">
          <v-card-text>
            <v-text-field
              dense
              v-model="selectedAttribute.name"
              outlined
              label="Name (required)"
              required
              background-color="white"
            ></v-text-field>

            <v-textarea
              dense
              v-model="selectedAttribute.description"
              outlined
              label="Description"
              rows="3"
              background-color="white"
            ></v-textarea>

            <v-textarea
              dense
              v-model="selectedAttribute.notes"
              outlined
              label="Notes"
              rows="3"
              background-color="white"
            ></v-textarea>

            <div class="row">
              <div class="col-md-6">
                <v-text-field
                  dense
                  v-model="selectedAttribute.type"
                  outlined
                  label="Data type"
                  required
                  background-color="white"
                ></v-text-field>
              </div>
              <div class="col-md-6">
                <v-switch
                  class="mt-1"
                  v-model="selectedAttribute.required"
                  flat
                  label="Required field"
                ></v-switch>
              </div>
            </div>

            <v-text-field
              dense
              v-model="selectedAttribute.alias"
              outlined
              label="Alias"
              required
              background-color="white"
            ></v-text-field>

            <v-autocomplete
              dense
              v-model="editDomain"
              outlined
              label="Domain"
              :items="domainOptions"
              item-text="name"
              item-value="_id"
              clearable
              background-color="white"
              @change="domainChanged"
            ></v-autocomplete>

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
              hide-details
              @change="sourceChanged"
            ></v-autocomplete>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="doneAttributeEditor()"> Done </v-btn>
            <v-spacer></v-spacer>

            <v-btn color="secondary" @click="removeAttribute()"
              ><v-icon>mdi-delete</v-icon> Remove
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-dialog>

    <v-dialog v-model="showImporter" persistent max-width="800px">
      <v-container class="pb-3" style="background-color: white">
        <h2>Import Attributes from CSV</h2>

        <v-file-input
          dense
          outlined
          prepend-icon="mdi-file-delimited"
          accept="text/csv"
          v-model="importFile"
          @change="loadImport"
          label="CSV file to import"
        ></v-file-input>

        <p>
          Do not include the field headers in the file. Columns will be imported
          as:
        </p>
        <pre style="background-color: #ccc; padding: 8px">
AttrName,AttrType,Required,Description,Notes,Alias
Attribute 1,NVARCHAR(255),true,This field is important,,Attr1</pre
        >

        <v-textarea
          label="Imported content"
          outlined
          dense
          class="mt-5"
          readonly
          background-color="white"
          v-model="importSource"
          :hint="importHint"
          persistent-hint
        ></v-textarea>

        <p v-if="importError" class="error-text">
          ** {{ importError }}, please correct the CSV file and try again.
        </p>

        <v-btn
          @click="parseImport"
          color="primary"
          :disabled="importSource.length == 0"
          >Import</v-btn
        >
        <v-btn
          @click="showImporter = false"
          color="secondary"
          class="float-right"
          >Close</v-btn
        >
      </v-container>
    </v-dialog>
    <v-snackbar v-model="snackbar" right color="success">
      <v-icon class="mr-3">mdi-thumb-up-outline</v-icon>
      {{ apiSuccess }}
    </v-snackbar>

    <confirm-dialog ref="confirm"></confirm-dialog>
  </div>
</template>

<script>
import axios from "axios";
import store from "../store";
import { ENTITY_URL, LOCATION_URL, PROGRAM_URL, DOMAIN_URL } from "../urls";
import ConfirmDialog from "./ConfirmDialog.vue";

export default {
  components: { ConfirmDialog },
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
    savedStatus: "",
    editSourceAttrId: "",
    editDomain: {},
    editPrograms: [],
    editLocation: {},

    attributeHeaders: [
      { text: "Order", value: "order", width: "100px" },
      { text: "Field", value: "name" },
      { text: "Data type", value: "type" },
      { text: "Required", value: "required" },
      { text: "Description", value: "description" },
      { text: "Notes", value: "notes" },
      { text: "Alias", value: "alias" },
      { text: "Domain", value: "domain.name" },
      { text: "Source", value: "source.name" },
    ],

    isWatched: false,
    showAttributeEditor: null,
    selectedAttribute: {},

    showImporter: null,
    importSource: "",
    importFile: null,
    importHint: "",
    importError: "",
  }),
  computed: {
    roles: function () {
      return store.getters.roles;
    },
  },

  created() {
    let id = this.$route.params.id;

    let canEdit =
      this.roles.indexOf("Writer") >= 0 || this.roles.indexOf("Admin") >= 0;

    if (!canEdit) return this.$router.push("/dashboard");

    axios
      .get(`${ENTITY_URL}/${id}`)
      .then((result) => {
        this.entity = result.data.data;
        this.attributes = this.entity.attributes;
        this.fixAttributeOrder();

        this.sources = this.entity.links.entities;
        this.editLocation = this.entity.location;

        this.savedStatus = this.entity.status;

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
  },

  methods: {
    addNewAttribute() {
      this.sideAction = "Add new Attribute";

      this.attributes.push({
        name: "Attribute " + (this.attributes.length + 1),
        required: false,
      });
      this.fixAttributeOrder();
      this.selectedAttribute = this.attributes[this.attributes.length - 1];
      this.showAttributeEditor = true;
    },
    removeAttribute() {
      this.attributes.splice(this.selectedAttribute.order - 1, 1);
      this.showAttributeEditor = false;
      this.fixAttributeOrder();
    },

    doneAttributeEditor() {
      if (this.selectedAttribute.name.trim().length == 0) return;

      this.showAttributeEditor = false;
      this.fixAttributeOrder();
    },

    domainChanged() {
      if (!this.editDomain) {
        this.selectedAttribute.domain = null;
        return;
      }

      let d = this.domainOptions.filter((d) => d._id == this.editDomain)[0];
      this.selectedAttribute.domain = d;
    },

    sourceChanged() {
      if (!this.editSourceAttrId) {
        this.selectedAttribute.source = null;
        return;
      }

      let d = this.sourceOptions.filter(
        (d) => d.id == this.editSourceAttrId
      )[0];
      this.selectedAttribute.source = d;
    },

    clickRow(item) {
      if (this.savedStatus != "Draft") return;

      this.selectedAttribute = item;
      this.editDomain = this.editSourceAttrId = "";
      this.sideAction = "Edit attribute";

      if (this.selectedAttribute.domain && this.selectedAttribute.domain._id)
        this.editDomain = this.selectedAttribute.domain._id;
      if (this.selectedAttribute.source && this.selectedAttribute.source.id)
        this.editSourceAttrId = this.selectedAttribute.source.id;

      this.showAttributeEditor = true;
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

    moveAttrUp(item) {
      let cur = this.attributes.filter((i) => i.order == item.order)[0];

      this.attributes.splice(
        cur.order - 2,
        0,
        this.attributes.splice(cur.order - 1, 1)[0]
      );

      this.fixAttributeOrder();
    },

    moveAttrDown(item) {
      let next = this.attributes.filter((i) => i.order == item.order + 1)[0];
      this.attributes.splice(
        next.order - 2,
        0,
        this.attributes.splice(next.order - 1, 1)[0]
      );

      this.fixAttributeOrder();
    },

    fixAttributeOrder() {
      let idx = 1;
      for (let attr of this.attributes) {
        attr.order = idx;
        idx++;
      }
    },

    saveEntity() {
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

      body.attributes = this.attributes;

      axios.put(`${ENTITY_URL}/${this.entity._id}`, body).then((result) => {
        this.entity = result.data.data.value;
        this.savedStatus = this.entity.status;
        this.snackbar = true;
        this.apiSuccess = "Changes saved";
      });
    },

    importAttributes() {
      this.importSource = "";
      this.importFile = null;
      this.showImporter = true;
    },

    loadImport() {
      if (!this.importFile) {
        this.importSource = "";
        return;
      }

      const file = this.importFile;
      const reader = new FileReader();

      reader.onload = (e) => this.loadImportCompleted(e.target.result);
      reader.readAsText(file);
    },

    loadImportCompleted(result) {
      this.importSource = result.trim();
      let lines = result.split("\n");
      this.importHint = `${lines.length - 1} lines detected`;
    },

    parseImport() {
      let source = this.importSource.trim();
      let lines = source.split("\n");
      let toImport = [];
      this.importError = "";
      let currentLine = 1;

      for (let line of lines) {
        let parts = line.split(",");

        if (parts.length != 6) {
          this.importError = `Line ${currentLine} has the wrong number of fields`;
          break;
        }

        if (parts[0] == "AttrName") continue;

        toImport.push({
          name: parts[0],
          type: parts[1],
          required: parts[2],
          description: parts[3],
          notes: parts[4],
          alias: parts[5],
        });

        currentLine++;
      }

      if (this.importError == "") {
        for (let load of toImport) {
          this.attributes.push(load);
        }
        this.fixAttributeOrder();
        this.showImporter = false;
      }
    },

    doneClick() {
      console.log("DONE");

      this.$refs.confirm.show(
        "Leave without saving?",
        "You may have unsaved changes. Do you want to leave without saving?",
        () => {
          this.$router.push(`/entity/${this.entity._id}`);
        },
        () => {
          //this.saveEntity();
        }
      );
    },
  },
};
</script>
