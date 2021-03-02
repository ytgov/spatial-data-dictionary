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
          ><br />

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
        <v-btn color="info" :to="'/entity/' + entity._id + '/edit'">Edit</v-btn>
      </div>
    </div>

    <p class="lead" style="clear: both">
      {{ entity.description }}
    </p>
    <hr class="mb-1" />

    <div class="row">
      <div class="col-md-8">
        <v-card>
          <v-tabs v-model="tab" background-color="#fff2d5" color="primary">
            <v-tab key="0">Attributes</v-tab>
            <v-tab key="1">Properties</v-tab>
            <v-tab key="2">Changes</v-tab>
          </v-tabs>

          <v-tabs-items v-model="tab" style="padding: 20px">
            <v-tab-item key="0">
              <v-data-table
                :items="entity.attributes"
                :headers="attributeHeaders"
              >
              </v-data-table>
            </v-tab-item>
            <v-tab-item key="1">
              <v-data-table
                :headers="propertiesHeaders"
                :items="desserts"
                sort-by="calories"
              >
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="dialog" max-width="500px">
                      <v-toolbar color="info" dark>{{ formTitle }}</v-toolbar>

                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="primary"
                          dark
                          class="mb-2"
                          v-bind="attrs"
                          v-on="on"
                        >
                          Add
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-text class="mt-3 mb-0">
                          <v-text-field
                            v-model="editedItem.name"
                            label="Name"
                            dense
                            outlined
                            hint="* Required"
                            persistent-hint
                            class="mb-2"
                          ></v-text-field>
                          <v-textarea
                            v-model="editedItem.value"
                            label="Value"
                            dense
                            outlined
                            hint="* Required"
                            persistent-hint
                          ></v-textarea>
                        </v-card-text>

                        <v-card-actions class="mt-0">
                          <v-spacer></v-spacer>
                          <v-btn color="secondary" @click="close">
                            Cancel
                          </v-btn>
                          <v-btn color="primary" @click="save"> Save </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    <v-dialog v-model="dialogDelete" max-width="500px">
                      <v-toolbar color="info" dark>Delete Property</v-toolbar>

                      <v-card>
                        <v-card-text
                          ><h3 class="mt-4">
                            Are you sure you want to delete this property?
                          </h3></v-card-text
                        >
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="secondary" @click="closeDelete"
                            >No</v-btn
                          >
                          <v-btn color="primary" @click="deleteItemConfirm"
                            >Yes</v-btn
                          >
                          <v-spacer></v-spacer>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-toolbar>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-icon small class="mr-2" @click="editItem(item)">
                    mdi-pencil
                  </v-icon>
                  <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
                </template>
                <template v-slot:no-data>
                  <v-btn color="primary" @click="initialize"> Reset </v-btn>
                </template>
              </v-data-table>
            </v-tab-item>
            <v-tab-item key="2">
              <v-data-table :headers="changeHeaders"> </v-data-table
            ></v-tab-item>
          </v-tabs-items>
        </v-card>
      </div>
      <div class="col-md-4">
        <h3 class="mb-4">
          <span class="float-left"
            ><v-icon color="#323232">mdi-link-variant</v-icon> Connections</span
          >
          <v-btn
            icon
            class="float-right my-0"
            title="Add Connection"
            color="primary"
            @click="addConnection()"
            style="height: auto; width: auto"
            ><v-icon>mdi-link-variant-plus</v-icon></v-btn
          >
          <div style="clear: both"></div>
        </h3>

        <div
          v-for="item in entity.links.entities"
          v-bind:key="item.id"
          style="clear: both"
        >
          <v-card
            color="#fff2d5"
            class="mb-2"
            @click="openConnectionDialog(item)"
            :to="'/entity/' + item.id"
          >
            <v-card-text>
              <v-icon>mdi-database-marker</v-icon> &nbsp;
              <strong
                ><a>{{ item.name }}</a></strong
              >
              <br />{{ item.role }}</v-card-text
            >
          </v-card>
        </div>

        <div v-for="item in entity.links.people" v-bind:key="item.id">
          <v-card color="#fff2d5" class="mb-2">
            <v-card-text
              ><v-icon>mdi-account-circle</v-icon> &nbsp;
              <strong>{{ item.name }}</strong> <br />
              {{ item.role }}</v-card-text
            >
          </v-card>
        </div>
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

    <connection-dialog
      :dialog="connectionDialogVisible"
      :existing="entity.links.entities"
      :self="entity"
      @doClose="closeConnection()"
      @doSave="saveConnection"

    ></connection-dialog>

    <entityconnection-dialog
      :entity="connectionEntity"
    ></entityconnection-dialog>
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
</style>
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
    connectionDialogVisible: null,

    entity_id: "",
    entity: { links: {}, location: {} },

    propertiesHeaders: [
      { text: "Name", value: "name" },
      { text: "Value", value: "value" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    attributeHeaders: [
      { text: "Field", value: "name" },
      { text: "Data type", value: "type" },
      { text: "Required", value: "required" },
      { text: "Notes", value: "description" },
      { text: "Alias", value: "alias" },
      { text: "Domain", value: "domain" },
    ],
    changeHeaders: [
      { text: "Date", value: "id" },
      { text: "Name", value: "id" },
      { text: "Description", value: "id" },
    ],

    dialog: false,
    dialogDelete: false,

    desserts: [],
    editedIndex: -1,
    editedItem: {
      name: "",
      value: 0,
    },
    defaultItem: {
      name: "",
      value: "",
    },
    connectionEntity: {},
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Add Property" : "Edit Property";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  created() {
    this.entity_id = this.$route.params.id;

    this.loadEntity(this.entity_id);
  },

  methods: {
    initialize() {
      this.desserts = [
        {
          name: "In ALRS",
          value: true,
        },
        {
          name: "In OPR",
          value: false,
        },
      ];
    },

    loadEntity(id) {
      axios
        .get(`${ENTITY_URL}/${id}`)
        .then((result) => {
          this.entity = result.data.data;
          this.initialize();
        })
        .catch((err) => {
          console.log(err);
        });
    },

    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.desserts.splice(this.editedIndex, 1);
      this.closeDelete();
    },

    close() {
      this.dialog = false;
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

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
      } else {
        this.desserts.push(this.editedItem);
      }
      this.close();
    },

    addConnection() {
      this.connectionDialogVisible = true;
    },

    closeConnection() {
      this.connectionDialogVisible = null;
    },

    saveConnection(args) {
      axios
        .post(`${ENTITY_URL}/${this.entity_id}/connection`, args)
        .then((results) => {
          console.log(results);
          this.entity = results.data.data;
          this.closeConnection();
        })
        .catch((error) => {
          console.error(error);
        });

      /* let connection = {
        connectionType: this.connectionType,
        selectedEntity: this.selectedEntity,
        selectedPerson: this.selectedPerson,
        newPersonName: this.newPersonName,
        newPersonEmail: this.newPersonEmail,
      }; */
    },

    openConnectionDialog(connection) {
      console.log("OPEBNING", connection);
      this.connectionEntity = connection;
    },
  },
};
</script>
