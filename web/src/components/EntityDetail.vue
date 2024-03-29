<template>
  <div class="" :key="entity_id">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[
        { text: 'Dashboard', to: '/dashboard' },
        { text: 'Entities', to: '/entity', exact: true },
        { text: entity.name },
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
          >

          <v-btn
            color="primary"
            icon
            small
            style="margin: 4px 0 12px 8px"
            @click.stop="toggleSubscribe(entity)"
          >
            <v-icon v-if="!entity.is_subscribed" title="Subscribe"
              >mdi-email-plus-outline</v-icon
            >
            <v-icon v-if="entity.is_subscribed" title="Unsubscribe"
              >mdi-email-minus</v-icon
            >
          </v-btn>

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

        <v-menu bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" color="secondary" class="pl-1">
              <v-icon class="mr-2">mdi-menu-down</v-icon> Actions
            </v-btn>
          </template>

          <v-list dense>
            <v-list-item :to="`/entity/${entity._id}/print`">
              <v-list-item-icon><v-icon>mdi-printer</v-icon></v-list-item-icon>
              <v-list-item-title>Print</v-list-item-title>
            </v-list-item>

            <v-list-item :to="'/entity/' + entity._id + '/change-request'">
              <v-list-item-icon
                ><v-icon>mdi-hammer-wrench</v-icon></v-list-item-icon
              >
              <v-list-item-title>Request Change</v-list-item-title>
            </v-list-item>
            <v-list-item :to="'/entity/' + entity._id + '/edit'" v-if="canEdit">
              <v-list-item-icon><v-icon>mdi-pencil</v-icon></v-list-item-icon>
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item>
            <v-list-item @click="showDuplicateDialog()" v-if="canEdit">
              <v-list-item-icon>
                <v-icon>mdi-content-copy</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Duplicate</v-list-item-title>
            </v-list-item>

            <v-list-item @click="addConnection()" v-if="canEdit">
              <v-list-item-icon>
                <v-icon>mdi-link-variant-plus</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Add Connection</v-list-item-title>
            </v-list-item>

            <v-divider v-if="canEdit"></v-divider>
            <v-list-item @click="showEntityDelete()" v-if="canEdit">
              <v-list-item-icon
                ><v-icon color="error">mdi-delete</v-icon></v-list-item-icon
              >
              <v-list-item-title
                ><span style="color: #ff5252">Delete</span></v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <p class="lead" style="clear: left">
      {{ entity.description }}
    </p>
    <hr class="mb-1" style="clear: both" />

    <div class="row">
      <div class="col-md-8">
        <v-card>
          <v-tabs v-model="tab" background-color="#fff2d5" color="primary">
            <v-tab key="0">Attributes</v-tab>
            <v-tab key="1">Properties</v-tab>
            <v-tab key="2">Values</v-tab>
            <v-tab key="3">Changes</v-tab>
            <v-tab key="4">Change Requests</v-tab>
          </v-tabs>

          <v-tabs-items v-model="tab" style="padding: 20px">
            <v-tab-item key="0">
              <v-data-table
                :items="attributes"
                :sort-by="['order']"
                :headers="attributeHeaders"
              >
                <template v-slot:item.domain="{ item }">
                  <span
                    @click="openDomainLink(item)"
                    style="
                      text-decoration: underline;
                      color: #00818f;
                      cursor: pointer;
                    "
                    >{{ getDomainName(item) }}</span
                  >
                </template>
                <template v-slot:item.source="{ item }"
                  ><span>{{ getSourceName(item) }}</span>
                </template>
              </v-data-table>
            </v-tab-item>
            <v-tab-item key="1">
              <v-data-table
                :headers="propertyHeaders"
                :items="properties"
                :sort-by="['name']"
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
                  <v-icon
                    small
                    class="mr-2"
                    @click="editItem(item)"
                    v-if="lockedProperties.indexOf(item.name) == -1"
                  >
                    mdi-pencil
                  </v-icon>
                  <v-icon
                    small
                    @click="deleteItem(item)"
                    v-if="lockedProperties.indexOf(item.name) == -1"
                  >
                    mdi-delete
                  </v-icon>
                  <v-icon small v-if="lockedProperties.indexOf(item.name) > -1">
                    mdi-lock
                  </v-icon>
                </template>
              </v-data-table>
            </v-tab-item>
            <v-tab-item key="2">
              <v-data-table
                :headers="valuesHeaders"
                :items="values"
                :sort-by="['name']"
              >
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="valDialog" max-width="500px">
                      <v-toolbar color="info" dark>{{
                        valFormTitle
                      }}</v-toolbar>

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
                            label="Code (required)"
                            dense
                            outlined
                            class="mb-2"
                          ></v-text-field>
                          <v-textarea
                            v-model="editedItem.value"
                            label="Value"
                            dense
                            outlined
                          ></v-textarea>
                          <v-textarea
                            v-model="editedItem.description"
                            label="Description"
                            dense
                            outlined
                          ></v-textarea>
                        </v-card-text>

                        <v-card-actions class="mt-0">
                          <v-spacer></v-spacer>
                          <v-btn color="secondary" @click="closeVal">
                            Cancel
                          </v-btn>
                          <v-btn color="primary" @click="saveValue">
                            Save
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    <v-dialog v-model="valDialogDelete" max-width="500px">
                      <v-toolbar color="info" dark>Delete Value</v-toolbar>

                      <v-card>
                        <v-card-text
                          ><h3 class="mt-4">
                            Are you sure you want to delete this value?
                          </h3></v-card-text
                        >
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn color="secondary" @click="closeDelete"
                            >No</v-btn
                          >
                          <v-btn color="primary" @click="deleteValItemConfirm"
                            >Yes</v-btn
                          >
                          <v-spacer></v-spacer>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-toolbar>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-icon small class="mr-2" @click="editValItem(item)">
                    mdi-pencil
                  </v-icon>
                  <v-icon small @click="deleteValItem(item)">
                    mdi-delete
                  </v-icon>
                </template>
              </v-data-table>
            </v-tab-item>
            <v-tab-item key="3">
              <v-data-table
                :items="changes"
                :headers="changeHeaders"
                @click:row="changeClick"
              >
              </v-data-table
            ></v-tab-item>
            <v-tab-item key="4">
              <v-data-table
                :items="changeRequests"
                :headers="[
                  { text: 'Date', value: 'date' },
                  { text: 'Title', value: 'title' },
                  { text: 'Status', value: 'status' },
                  { text: 'Initiator', value: 'create_user' },
                ]"
                @click:row="changeRequestClick"
              >
              </v-data-table
            ></v-tab-item>
          </v-tabs-items>
        </v-card>
      </div>
      <div class="col-md-4">
        <h3 class="mb-4">
          <span class="float-left"
            ><v-icon color="#323232">mdi-link-variant</v-icon> Connections</span
          >
          <div style="clear: both"></div>
        </h3>

        <v-btn
          color="secondary"
          :to="'/entity/' + entity._id + '/map'"
          style="width: 100%"
        >
          <v-icon class="mr-4">mdi-graph</v-icon> View Graph</v-btn
        >

        <div
          v-for="item in entity.links.entities"
          v-bind:key="item.id"
          style="clear: both"
        >
          <v-card
            color="#fff2d5"
            class="mb-2"
            @click="openConnectionDialog(item)"
          >
            <v-card-text>
              <v-icon>mdi-database-marker</v-icon> &nbsp;
              <strong
                ><a>{{ item.name }}</a></strong
              >
              <br />Location: {{ item.location.name }} <br />Type:
              {{ item.role }}</v-card-text
            >
          </v-card>
        </div>

        <div
          v-for="item in entity.links.downstream"
          v-bind:key="item.id"
          style="clear: both"
        >
          <v-card
            color="#fff2d5"
            class="mb-2"
            @click="openDownConnectionDialog(item)"
          >
            <v-card-text>
              <v-icon>mdi-database-marker</v-icon> &nbsp;
              <strong
                ><a>{{ item.name }}</a></strong
              >
              <br />Location: {{ item.location.name }} <br />Type:
              Destination</v-card-text
            >
          </v-card>
        </div>

        <div v-for="(item, index) in entity.links.people" v-bind:key="item.id">
          <v-card
            color="#fff2d5"
            class="mb-2"
            @click="openPersonConnectionDialog(index)"
          >
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
        <!--
        <hr class="my-5" />
        <h3 class="mb-4 mt-5">
          <v-icon color="#323232">mdi-hammer-wrench</v-icon> Change Requests
        </h3>

         <v-btn
          color="secondary"
          :to="'/entity/' + entity._id + '/change-request'"
          style="width: 100%"
        >
          <v-icon class="mr-4">mdi-hammer-wrench</v-icon> Request Change</v-btn
        > -->
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
      ref="conn"
      :existing="entity.links.entities"
      :self="entity"
      @doSave="saveConnection"
    ></connection-dialog>

    <entityconnection-dialog
      ref="upConn"
      :selectedEntity="connectionEntity"
      :entity="entity"
      @removeConnection="removeConnection"
    ></entityconnection-dialog>

    <downentityconnection-dialog
      ref="downConn"
      :selectedEntity="downEntity"
      :entity="entity"
    ></downentityconnection-dialog>

    <personconnection-dialog
      ref="personDialog"
      @updatePersonConnection="updatePersonConnection"
      @removePersonConnection="removePersonConnection"
    ></personconnection-dialog>

    <domain-dialog
      ref="domainDialog"
      @updatePersonConnection="updatePersonConnection"
      @removePersonConnection="removePersonConnection"
    ></domain-dialog>

    <v-dialog
      ref="entityDeleteDialog"
      v-model="showEntityDeleteDialog"
      max-width="600px"
    >
      <v-container class="pb-3" style="background-color: white">
        <h2>Delete '{{ entity.name }}'?</h2>
        <hr class="mb-4" />
        <p>This action cannot be undone.</p>
        <h3 class="error-text">
          <strong>Are you sure you want to do this? </strong>
        </h3>
        <v-btn color="error" @click="doEntityDelete()"
          ><v-icon class="mr-2">mdi-delete</v-icon> YES
        </v-btn>
        <v-btn
          color="secondary"
          class="float-right"
          @click="showEntityDeleteDialog = false"
          >No
        </v-btn>
      </v-container>
    </v-dialog>
    <v-dialog v-model="duplicationDialogVisible" max-width="600px">
      <v-container class="pb-3" style="background-color: white">
        <v-form v-model="duplicateIsValid">
          <h2>Duplicate Entity</h2>
          <p>
            This will duplicate the entire entity including all attributes and
            connections.
          </p>
          <hr class="mb-4" />
          <v-text-field
            v-model="duplicateName"
            dense
            outlined
            label="New entity name"
            :rules="duplicateRequiredRule"
          ></v-text-field>

          <v-btn
            color="primary"
            @click="doDuplicate()"
            :disabled="!duplicateIsValid"
            ><v-icon class="mr-2">mdi-content-copy</v-icon> Duplicate
          </v-btn>
          <v-btn
            color="secondary"
            class="float-right"
            @click="duplicationDialogVisible = false"
            >Cancel
          </v-btn>
        </v-form>
      </v-container>
    </v-dialog>

    <notifications ref="notifier"></notifications>
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
import { ENTITY_URL, SUBSCRIPTION_URL } from "../urls";
import router from "../router";
import store from "../store";

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
    changeHeaders: [
      { text: "Status", value: "status" },
      { text: "Date", value: "complete_date" },
      { text: "Title", value: "title" },
      { text: "Assigned to", value: "assigned_user" },
    ],
    lockedProperties: ["Create date", "Created by"],

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

          this.loadChanges(id);
          this.loadChangeRequests(id);
        })
        .catch((err) => {
          console.log(err);
          router.push("/entity");
        });
    },

    loadChanges(id) {
      axios
        .get(`${ENTITY_URL}/${id}/changes`)
        .then((resp) => {
          this.changes = resp.data.data;
        })
        .catch((error) => console.log(error));
    },

    loadChangeRequests(id) {
      axios
        .get(`${ENTITY_URL}/${id}/request-change`)
        .then((result) => {
          this.changeRequests = result.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    updateEntity() {
      axios
        .put(`${ENTITY_URL}/${this.entity._id}`, this.entity)
        .then((result) => {
          this.entity = result.data.data.value;
          this.attributes = this.entity.attributes;
          this.values = this.entity.values || new Array();
          this.properties = this.entity.properties || new Array();
        })
        .catch((err) => {
          console.log(err);
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

    editItem(item) {
      this.editedIndex = this.properties.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    editValItem(item) {
      this.editedIndex = this.values.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.valDialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.properties.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.entity.properties.splice(this.editedIndex, 1);
      this.updateEntity();
      this.closeDelete();
    },

    deleteValItem(item) {
      this.editedIndex = this.values.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.valDialogDelete = true;
    },

    deleteValItemConfirm() {
      this.entity.values.splice(this.editedIndex, 1);
      this.updateEntity();
      this.closeValDelete();
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

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.properties[this.editedIndex], this.editedItem);
      } else {
        this.entity.properties.push(this.editedItem);
      }
      this.updateEntity();
      this.close();
    },

    saveValue() {
      if (this.editedIndex > -1) {
        Object.assign(this.values[this.editedIndex], this.editedItem);
      } else {
        this.entity.values.push(this.editedItem);
      }
      this.updateEntity();
      this.closeVal();
    },

    addConnection() {
      this.$refs.conn.openDialog();
    },

    saveConnection(args) {
      axios
        .post(`${ENTITY_URL}/${this.entity_id}/connection`, args)
        .then((results) => {
          console.log(results);
          this.entity = results.data.data;
          //this.closeConnection();
          this.$refs.conn.closeDialog();
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
      this.connectionEntity = connection;
      this.$refs.upConn.openDialog(this.canEdit);
    },

    openDownConnectionDialog(connection) {
      this.downEntity = connection;
      this.$refs.downConn.openDialog(this.canEdit);
    },

    removeConnection(item) {
      axios
        .delete(
          `${ENTITY_URL}/${this.entity_id}/connection/${item._id || item.id}`
        )
        .then((results) => {
          this.entity = results.data.data;
          this.$refs.upConn.closeDialog();
        })
        .catch((error) => {
          console.error(error);
        });
    },

    openDomainLink(item) {
      this.$refs.domainDialog.openDialog(item.domain, this.canEdit);
    },

    openPersonConnectionDialog(index) {
      this.personIndex = index;
      this.$refs.personDialog.openDialog(
        this.entity.links.people[index],
        this.canEdit
      );
    },
    updatePersonConnection(role) {
      this.entity.links.people[this.personIndex].role = role;
      this.updateEntity();
    },
    removePersonConnection() {
      this.entity.links.people.splice(this.personIndex, 1);
      this.updateEntity();
    },

    changeClick(item) {
      router.push(`/entity/${this.entity_id}/changes/${item._id}`);
    },

    changeRequestClick(item) {
      router.push(`/entity/${this.entity_id}/change-request/${item._id}`);
    },

    showEntityDelete() {
      this.showEntityDeleteDialog = true;
    },

    doEntityDelete() {
      axios
        .delete(`${ENTITY_URL}/${this.entity_id}`)
        .then(() => {
          router.push(`/entity`);
        })
        .catch((error) => {
          console.error(error);
        });
    },

    showDuplicateDialog() {
      this.duplicateName = "";
      this.duplicationDialogVisible = true;
    },
    doDuplicate() {
      axios
        .post(`${ENTITY_URL}/${this.entity_id}/duplicate`, {
          name: this.duplicateName,
        })
        .then((results) => {
          router.push(`/entity/${results.data.data.insertedId}`);
          this.duplicationDialogVisible = false;
          this.notifier;
        })
        .catch((error) => {
          console.error(error);
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
    toggleSubscribe() {
      let body = {
        type: "Entity",
        id: this.entity_id,
      };

      axios.put(`${SUBSCRIPTION_URL}`, body).then((resp) => {
        this.$refs.notifier.showAPIMessages(resp.data);
        this.loadEntity(this.entity_id);
      });
    },
  },
};
</script>
