<template>
  <div class="">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[{ text: 'Dashboard', href: '/dashboard' }, { text: 'Programs' }]"
    ></v-breadcrumbs>

    <v-btn
      color="primary"
      class="float-right mt-0"
      @click="createClick"
      v-if="canEdit"
      ><v-icon>mdi-plus</v-icon> Create</v-btn
    >
    <h1>Programs</h1>
    <hr class="mb-3" />

    <p>
      Programs represent business areas of management sectors. Entities are
      assigned to one or more programs.
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
          >
            <template v-slot:item.action="{ item }">
              <v-btn
                color="primary"
                icon
                small
                class="mx-0 my-0"
                @click.stop="toggleSubscribe(item)"
              >
                <v-icon v-if="!item.is_subscribed" title="Subscribe"
                  >mdi-email-plus-outline</v-icon
                >
                <v-icon v-if="item.is_subscribed" title="Unsubscribe"
                  >mdi-email-minus</v-icon
                >
              </v-btn>
            </template>
          </v-data-table>
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
                label="Program manager"
                :items="peopleOptions"
                v-model="editManager"
                item-text="display_name"
                item-value="_id"
                dense
                outlined
                background-color="white"
              ></v-select>

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
    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import axios from "axios";
import store from "../store";
import { PERSON_URL, PROGRAM_URL, ROLE_URL, SUBSCRIPTION_URL } from "../urls";

export default {
  name: "Programs",
  computed: {
    roles: function () {
      return store.getters.roles;
    },
  },
  data: () => ({
    isCreate: true,
    showForm: false,
    editId: "",
    editName: "",
    editManager: {},
    editChangeApprover: [],
    peopleOptions: [],
    items: [],
    itemHeaders: [
      { text: "Subscribe", value: "action" },
      { text: "Name", value: "name" },
      { text: "Program Manager", value: "approver_name" },
    ],
    roleOptions: [],
    search: "",

    canEdit: false,
  }),
  created() {
    this.loadPrograms();
    this.canEdit = this.roles.indexOf("Admin") >= 0;

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
    loadPrograms() {
      axios
        .get(PROGRAM_URL)
        .then((result) => {
          this.items = result.data.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },

    createClick() {
      if (!this.canEdit) return;

      this.editId = "";
      this.editName = "";
      this.editManager = {};
      this.editChangeApprover = [];
      this.isCreate = true;
      this.showForm = true;
    },

    updateLocation() {},

    removeLocation() {},

    rowClick(item) {
      if (!this.canEdit) return;

      this.isCreate = false;
      this.editName = item.name;
      this.editManager = item.approver_id;
      this.editChangeApprover = item.change_approver;
      this.editId = item._id;
      this.showForm = true;
    },

    saveClick() {
      if (!this.canEdit) return;

      if (this.isCreate) {
        axios
          .post(PROGRAM_URL, {
            name: this.editName,
            approver_id: this.editManager,
            change_approver: this.editChangeApprover,
          })
          .then((result) => {
            if (result && result.data.data) {
              this.loadPrograms();
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
            approver_id: this.editManager,
            change_approver: this.editChangeApprover,
          })
          .then((result) => {
            if (result && result.data.data) {
              this.loadPrograms();
              this.showForm = false;
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },

    removeClick() {
      if (!this.canEdit) return;

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

    toggleSubscribe(item) {
      let body = {
        type: "Program",
        id: item._id,
      };

      axios.put(`${SUBSCRIPTION_URL}`, body).then((resp) => {
        this.$refs.notifier.showAPIMessages(resp.data);
        this.loadPrograms();
      });
    },
  },
};
</script>
