<template>
  <div class="">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[{ text: 'Dashboard', href: '/dashboard' }, { text: 'People' }]"
    ></v-breadcrumbs>

    <v-btn color="primary" class="float-right mt-0" @click="createClick"
      ><v-icon>mdi-plus</v-icon> Create</v-btn
    >
    <h1>People</h1>
    <hr class="mb-3" />
    <p>
      People are tied to programs and entities and may or may not have an
      account in this system.
    </p>

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
                label="First name"
                outlined
                required
                v-model="editFirstName"
                dense
                background-color="white"
              ></v-text-field>

              <v-text-field
                label="Last name"
                outlined
                required
                v-model="editLastName"
                dense
                background-color="white"
              ></v-text-field>

              <v-text-field
                label="Email"
                outlined
                v-model="editEmail"
                dense
                background-color="white"
              ></v-text-field>

              <v-select
                label="Status"
                v-model="editStatus"
                :items="['Active', 'Inactive']"
                outlined
                dense
                background-color="white"
              ></v-select>
              <v-select
                label="Additional roles"
                v-model="editRoles"
                clearable
                multiple
                :items="['Implementer', 'Admin']"
                outlined
                dense
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
import { PERSON_URL } from "../urls";

export default {
  name: "People",
  data: () => ({
    isCreate: true,
    showForm: false,
    editId: "",
    editFirstName: "",
    editLastName: "",
    editEmail: "",
    editStatus: "Active",
    editRoles: [],
    peopleOptions: [],
    items: [],
    itemHeaders: [
      { text: "First name", value: "first_name" },
      { text: "Last name", value: "last_name" },
      { text: "Email", value: "email" },
      { text: "Status", value: "status" },
      { text: "Roles", value: "roles" },
    ],
  }),
  created() {
    axios
      .get(PERSON_URL)
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
      this.editFirstName = "";
      this.editLastName = "";
      this.editEmail = "";
      this.editStatus = "Active";
      this.editRoles = [];
      this.isCreate = true;
      this.showForm = true;
    },
    updateLocation() {},
    removeLocation() {},
    rowClick(item) {
      this.isCreate = false;
      this.editId = item._id;
      this.editFirstName = item.first_name;
      this.editLastName = item.last_name;
      this.editEmail = item.email;
      this.editStatus = item.status;
      this.editRoles = item.roles;
      this.showForm = true;
    },
    saveClick() {
      if (this.isCreate) {
        axios
          .post(PERSON_URL, {
            first_name: this.editFirstName,
            last_name: this.editLastName,
            email: this.editEmail,
            status: this.editStatus,
            roles: this.editRoles,
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
          .put(`${PERSON_URL}/${this.editId}`, {
            first_name: this.editFirstName,
            last_name: this.editLastName,
            email: this.editEmail,
            status: this.editStatus,
            roles: this.editRoles,
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
          .delete(`${PERSON_URL}/${this.editId}`)
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
