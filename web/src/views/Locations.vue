<template>
  <div class="">
    <v-btn color="primary" class="float-right mt-0" @click="createClick"
      ><v-icon>mdi-plus</v-icon> Create</v-btn
    >
    <h1>Locations</h1>
    <hr class="mb-3" />
    <p>Locations are the physical or digital homes of entities.</p>

    <div class="row mt-5" style="clear: both">
      <div class="col-md-8">
        <v-card class="" color="#fff2d5">
          <v-data-table
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
import { LOCATION_URL } from "../urls";

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
    typeOptions: ["Database", "Geodatabase", "Web", "Directory"],
    items: [],
    itemHeaders: [
      { text: "Name", value: "name" },
      { text: "Type", value: "type" },
      { text: "Details", value: "details" },
      { text: "Description", value: "description" },
    ],
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
    },
    saveClick() {
      if (this.isCreate) {
        axios
          .post(LOCATION_URL, {
            name: this.editName,
            type: this.editType,
            description: this.editDescription,
            details: this.editDetails
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
            details: this.editDetails
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
