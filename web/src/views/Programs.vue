<template>
  <div class="">
    <v-btn color="primary" class="float-right mt-0" @click="createClick"
      ><v-icon>mdi-plus</v-icon> Create</v-btn
    >
    <h1>Programs</h1>
    <hr class="mb-3" />

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
                label="Managers"
                :items="peopleOptions"
                v-model="editPeople"
                item-text="display_name"
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
import { PERSON_URL, PROGRAM_URL } from "../urls";

export default {
  name: "Programs",
  data: () => ({
    isCreate: true,
    showForm: false,
    editId: "",
    editName: "",
    editPeople: [],
    peopleOptions: [],
    items: [],
    itemHeaders: [
      { text: "Name", value: "name" },
      { text: "People", value: "people.length" },
    ],
  }),
  created() {
    axios
      .get(PROGRAM_URL)
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
  },
  methods: {
    createClick() {
      this.editId = "";
      this.editName = "";
      this.editPeople = [];
      this.isCreate = true;
      this.showForm = true;
    },
    updateLocation() {},
    removeLocation() {},
    rowClick(item) {
      this.isCreate = false;
      this.editName = item.name;
      this.editPeople = item.people;
      this.editId = item._id;
      this.showForm = true;
    },
    saveClick() {
      if (this.isCreate) {
        axios
          .post(PROGRAM_URL, { name: this.editName, people: this.editPeople })
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
          .put(`${PROGRAM_URL}/${this.editId}`, {
            name: this.editName,
            people: this.editPeople,
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
          .delete(`${PROGRAM_URL}/${this.editId}`)
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
