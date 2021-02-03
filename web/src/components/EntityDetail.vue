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
            <v-icon size="medium" style="mr-2" color="#323232">mdi-file-cabinet</v-icon>
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

    

    <h1 class="mb-1">
      Surface Management : <span style="font-weight: 400">Rehabilitation</span><v-btn color="primary" icon style="margin: 4px 0 12px 8px" small><v-icon>mdi-star</v-icon></v-btn>
    </h1>
    <p class="lead">
      Event feature class that contains surface management rehab information,
      consumed by the dTims pavement management system.
    </p>

    <hr class="mb-1" />

    <div class="row">
      <div class="col">
        <strong>Project Custodian(s)</strong> <br />
        Gjermund Roesholt/Colin Schut
      </div>
      <div class="col">
        <strong>Program Manager(s)</strong><br />
        Ken Jeffrey
      </div>
      <div class="col">
        <strong>Feature Class Name</strong><br />TDYLRS_PRI_SM_REHAB
      </div>
    </div>

    <hr class="mb-4 mt-2" />

    <!--   <v-banner icon="mdi-cash-register">
      <h2>Form help</h2>
      Help text can go in here to make the form more</v-banner
    > -->

    <v-card>
      <v-tabs v-model="tab" background-color="#fff2d5" color="primary">
        <v-tab key="0">Properties</v-tab>
        <v-tab key="1">Attributes</v-tab>
        <v-tab key="2">Changes</v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab" style="height: 250px; padding: 20px">
        <v-tab-item key="0">
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
                      <v-btn color="secondary" @click="close"> Cancel </v-btn>
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
                      <v-btn color="secondary" @click="closeDelete">No</v-btn>
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
        <v-tab-item key="1">
          <v-data-table :headers="attributeHeaders"> </v-data-table>
        </v-tab-item>
        <v-tab-item key="2">
          <v-data-table :headers="changeHeaders"> </v-data-table
        ></v-tab-item>
      </v-tabs-items>
    </v-card>

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
export default {
  name: "Form",
  data: () => ({
    tab: 0,
    showError: null,
    snackbar: null,
    apiSuccess: "",

    propertiesHeaders: [
      { text: "Name", value: "name" },
      { text: "Value", value: "value" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    attributeHeaders: [
      { text: "Field", value: "id" },
      { text: "Data type", value: "id" },
      { text: "Required", value: "id" },
      { text: "Notes", value: "id" },
      { text: "Alias", value: "id" },
      { text: "Domain", value: "id" },
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
    this.initialize();
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
  },
};
</script>
