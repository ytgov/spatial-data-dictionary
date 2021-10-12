<template>
  <div class="">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[
        { text: 'Dashboard', href: '/dashboard' },
        { text: 'Locations' },
      ]"
    ></v-breadcrumbs>

    <v-btn color="primary" class="float-right mt-0" @click="createClick"
      ><v-icon>mdi-plus</v-icon> Create</v-btn
    >
    <h1>Locations</h1>
    <hr class="mb-3" />
    <p>Locations are the physical or digital homes of entities.</p>

    <div class="row mt-5" style="clear: both">
      <div class="col-md-8">
        <v-text-field
          v-model="search"
          label="Search"
          dense
          outlined
          clearable
        ></v-text-field>
        <v-card class="" color="#fff2d5">
          <v-data-table
            :search="search"
            :headers="itemHeaders"
            :items="items"
            @click:row="rowClick"
          ></v-data-table>
        </v-card>
      </div>
      <div class="col-md-4">
        <v-card v-if="showForm" color="#fff2d5">
          <v-card-title>
            <span v-if="isCreate">Create</span>
            <span v-if="!isCreate">Edit</span>
          </v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                label="Name"
                outlined
                required
                v-model="editName"
                dense
                background-color="white"
              ></v-text-field>

              <v-select
                label="Type"
                :items="typeOptions"
                v-model="editType"
                dense
                outlined
                background-color="white"
              ></v-select>

              <v-textarea
                label="Details"
                v-model="editDetails"
                dense
                outlined
                background-color="white"
              ></v-textarea>
              <v-textarea
                label="Description"
                v-model="editDescription"
                dense
                outlined
                background-color="white"
              ></v-textarea>

              <v-select
                label="Change approval role"
                :items="roleOptions"
                v-model="editChangeApprover"
                item-text="name"
                item-value="_id"
                multiple
                dense
                outlined
                background-color="white"
              ></v-select>
              <v-select
                label="Implementer role"
                :items="roleOptions"
                v-model="editImplementer"
                item-text="name"
                item-value="_id"
                multiple
                dense
                outlined
                background-color="white"
              ></v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="saveClick()">Save</v-btn>
            <v-btn
              color="secondary"
              class="float-right"
              @click="showForm = false"
              >Cancel</v-btn
            >
            <v-btn
              v-if="!isCreate"
              color="error"
              class="float-right"
              @click="removeClick()"
              >Remove</v-btn
            >
          </v-card-actions>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { LOCATION_URL, PERSON_URL, ROLE_URL } from "../urls";

export default {
  name: "Locations",
  data: () => ({
    isCreate: true,
    showForm: false,
    editId: "",
    editName: "",
    editType: "Database",
    editDescription: "",
    editDetails: "",
    editChangeApprover: [],
    editImplementer: [],
    typeOptions: ["Database", "Geodatabase", "Web", "Directory"],
    items: [],
    itemHeaders: [
      { text: "Name", value: "name" },
      { text: "Type", value: "type" },
      { text: "Details", value: "details" },
      { text: "Description", value: "description" },
    ],
    peopleOptions: [],
    search: "",
  }),
  created() {
    axios
      .get(LOCATION_URL)
      .then((result) => {
        this.items = result.data.data;
      })
      .catch((error) => {
        console.error(error);
      });
    axios
      .get(`${PERSON_URL}`)
      .then((result) => {
        this.peopleOptions = result.data.data;
      })
      .catch((error) => {
        console.error(error);
      });
    axios
      .get(`${ROLE_URL}`)
      .then((result) => {
        this.roleOptions = result.data.data;
      })
      .catch((error) => {
        console.error(error);
      });
  },
  methods: {
    createClick() {
      this.editName = "";
      this.editId = "";
      this.editType = "Database";
      this.editDescription = "";
      this.editDetails = "";
      this.isCreate = true;
      this.showForm = true;
      this.editChangeApprover = [];
      this.editImplementer = [];
    },
    updateLocation() {},
    removeLocation() {},
    rowClick(item) {
      this.isCreate = false;
      this.editName = item.name;
      this.editType = item.type;
      this.editId = item._id;
      this.editDescription = item.description;
      this.editDetails = item.details;
      this.showForm = true;
      this.editChangeApprover = item.change_approver;
      this.editImplementer = item.implementer_role;
    },
    saveClick() {
      if (this.isCreate) {
        axios
          .post(LOCATION_URL, {
            name: this.editName,
            type: this.editType,
            description: this.editDescription,
            details: this.editDetails,
            change_approver: this.editChangeApprover,
            implementer_role: this.editImplementer,
          })
          .then((result) => {
            if (result && result.data.data) {
              this.items = result.data.data;
              this.showForm = false;
            }
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        axios
          .put(`${LOCATION_URL}/${this.editId}`, {
            name: this.editName,
            type: this.editType,
            description: this.editDescription,
            details: this.editDetails,
            change_approver: this.editChangeApprover,
            implementer_role: this.editImplementer,
          })
          .then((result) => {
            if (result && result.data.data) {
              this.items = result.data.data;
              this.showForm = false;
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
    removeClick() {
      if (this.editId && this.editId.length > 2) {
        axios
          .delete(`${LOCATION_URL}/${this.editId}`)
          .then((result) => {
            if (result && result.data.data) {
              this.items = result.data.data;
              this.createClick();
              this.showForm = false;
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
  },
};
</script>
