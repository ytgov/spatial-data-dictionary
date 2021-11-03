<template>
  <div class="">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[
        { text: 'Dashboard', href: '/dashboard' },
        { text: 'People & Roles' },
      ]"
    ></v-breadcrumbs>

    <v-btn color="primary" class="float-right mt-0" @click="createClick"
      ><v-icon>mdi-plus</v-icon> Create</v-btn
    >
    <h1>People & Roles</h1>

    <v-tabs v-model="tab">
      <v-tab key="0">People</v-tab>
      <v-tab key="1">Roles</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item key="0">
        <hr class="mb-3" />
        <p>
          People are tied to programs and entities and may or may not have an
          account in this system.
        </p>

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
                :footer-props="{ 'items-per-page-options': items_per_page }"
              ></v-data-table>
            </v-card>
          </div>
          <div class="col-md-4">
            <v-card v-if="showPeopleForm" color="#fff2d5">
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
                    label="Roles"
                    v-model="editRoles"
                    clearable
                    multiple
                    :items="['Writer', 'Admin']"
                    outlined
                    dense
                    background-color="white"
                  ></v-select>
                  <v-select
                    label="Additional roles"
                    v-model="editAdditionalRoles"
                    clearable
                    multiple
                    :items="roleItems"
                    item-value="_id"
                    item-text="name"
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
                  @click="showPeopleForm = false"
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
      </v-tab-item>
      <v-tab-item key="1">
        <hr class="mb-3" />
        <p>
          Roles grant people access to areas and features within the
          application.
        </p>

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
                :headers="roleHeaders"
                :items="roleItems"
                @click:row="roleRowClick"
              ></v-data-table>
            </v-card>
          </div>
          <div class="col-md-4">
            <v-card v-if="showRoleForm" color="#fff2d5">
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
                    v-model="editFirstName"
                    dense
                    background-color="white"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" @click="saveRoleClick()">Save</v-btn>
                <v-btn
                  color="secondary"
                  class="float-right"
                  @click="showRoleForm = false"
                  >Cancel</v-btn
                >
                <v-btn
                  v-if="!isCreate"
                  color="error"
                  class="float-right"
                  @click="removeRoleClick()"
                  >Remove</v-btn
                >
              </v-card-actions>
            </v-card>
          </div>
        </div>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import axios from "axios";
import store from "../store";
import { PERSON_URL, ROLE_URL } from "../urls";

export default {
  name: "People",
  computed: {
    roles: function() {
      return store.getters.roles;
    }
  },
  data: () => ({
    isCreate: true,
    showPeopleForm: false,
    showRoleForm: false,
    editId: "",
    editFirstName: "",
    editLastName: "",
    editEmail: "",
    editStatus: "Active",
    editRoles: [],
    editAdditionalRoles: [],
    peopleOptions: [],
    items: [],
    roleItems: [],
    itemHeaders: [
      { text: "First name", value: "first_name" },
      { text: "Last name", value: "last_name" },
      { text: "Email", value: "email" },
      { text: "Status", value: "status" },
      { text: "Roles", value: "roles" },
    ],
    items_per_page: [20, 50, 100, -1],
    roleHeaders: [{ text: "Name", value: "name" }],
    search: "",

    tab: 0,
  }),
  created() {
    if (this.roles.indexOf("Admin") == -1) {
      this.$router.push("/dashboard");
      return;
    }

    axios
      .get(PERSON_URL)
      .then((result) => {
        this.items = result.data.data;
      })
      .catch((error) => {
        console.error(error);
      });

    axios
      .get(ROLE_URL)
      .then((result) => {
        this.roleItems = result.data.data;
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
      this.editAdditionalRoles = [];
      this.isCreate = true;

      if (this.tab == 0) this.showPeopleForm = true;
      else this.showRoleForm = true;
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
      this.editAdditionalRoles = item.additional_roles;
      this.showPeopleForm = true;
      this.showRoleForm = false;
    },
    roleRowClick(item) {
      this.isCreate = false;
      this.editFirstName = item.name;
      this.editId = item._id;
      this.showPeopleForm = false;
      this.showRoleForm = true;
      console.log(item);
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
            additional_roles: this.editAdditionalRoles,
          })
          .then((result) => {
            if (result && result.data.data) {
              this.items = result.data.data;
              this.showPeopleForm = false;
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
            additional_roles: this.editAdditionalRoles,
          })
          .then((result) => {
            if (result && result.data.data) {
              this.items = result.data.data;
              this.showPeopleForm = false;
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
              this.showPeopleForm = false;
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
    saveRoleClick() {
      if (this.isCreate) {
        axios
          .post(ROLE_URL, {
            name: this.editFirstName,
          })
          .then((result) => {
            if (result && result.data.data) {
              this.roleItems = result.data.data;
              this.showPeopleForm = false;
            }
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        axios
          .put(`${ROLE_URL}/${this.editId}`, {
            name: this.editFirstName,
          })
          .then((result) => {
            if (result && result.data.data) {
              this.roleItems = result.data.data;
              this.showRoleForm = false;
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
    removeRoleClick() {
      if (this.editId && this.editId.length > 2) {
        axios
          .delete(`${ROLE_URL}/${this.editId}`)
          .then((result) => {
            if (result && result.data.data) {
              this.roleItems = result.data.data;
              this.showRoleForm = false;
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
