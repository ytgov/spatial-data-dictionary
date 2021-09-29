<template>
  <div class="">
    <v-btn color="primary" class="float-right mt-0" @click="createClick"
      ><v-icon>mdi-plus</v-icon> Create</v-btn
    >
    <h1>Domains</h1>
    <hr class="mb-3" />

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
            :headers="itemHeaders"
            :items="items"
            @click:row="rowClick"
          ></v-data-table>
        </v-card>

        <v-card class="mt-5" v-if="showForm" color="#fff2d5">
          <v-card-title>Values for {{editName}}</v-card-title>
          <v-data-table
            :search="search"
            dense
            :headers="valueHeaders"
            :items="editValues"
          ></v-data-table>
          <v-card-actions>
            <v-btn color="info">Add</v-btn>
          </v-card-actions>
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
              <v-text-field
                label="Field type"
                outlined
                required
                v-model="editType"
                dense
                background-color="white"
              ></v-text-field>
              <v-textarea
                label="Description"
                outlined
                required
                v-model="editDescription"
                dense
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
import { DOMAIN_URL } from "../urls";

export default {
  name: "Domains",
  data: () => ({
    isCreate: true,
    showForm: false,
    editId: "",
    editName: "",
    editDescription: "",
    editValues: [],
    editType: "s",
    items: [],
    itemHeaders: [
      { text: "Name", value: "name" },
      { text: "Field type", value: "type" },
      { text: "Description", value: "description" },
      { text: "Value Count", value: "values.length" },
    ],
    valueHeaders: [
      { text: "Value", value: "value" },
      { text: "Description", value: "description" },
    ],
    search: "",
  }),
  created() {
    axios
      .get(DOMAIN_URL)
      .then((result) => {
        this.items = result.data.data;
      })
      .catch((error) => {
        console.error(error);
      });
  },
  methods: {
    createClick() {
      this.editId = "";
      this.editName = "";
      this.editDescription = "";
      this.editType = "";
      this.editValues = [];
      this.isCreate = true;
      this.showForm = true;
    },
    updateLocation() {},
    removeLocation() {},
    rowClick(item) {
      this.isCreate = false;
      this.editName = item.name;
      this.editDescription = item.description;
      this.editValues = item.values;
      this.editType = item.type;
      this.editId = item._id;
      this.showForm = true;
    },
    saveClick() {
      if (this.isCreate) {
        axios
          .post(DOMAIN_URL, {
            name: this.editName,
            description: this.editDescription,
            values: this.editValues,
            type: this.editType,
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
          .put(`${DOMAIN_URL}/${this.editId}`, {
            name: this.editName,
            description: this.editDescription,
            values: this.editValues,
            type: this.editType,
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
          .delete(`${DOMAIN_URL}/${this.editId}`)
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
