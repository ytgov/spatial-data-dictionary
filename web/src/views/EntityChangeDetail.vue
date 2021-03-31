<template>
  <div class="" :key="entity_id">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[
        { text: 'Dashboard', href: '/dashboard' },
        { text: 'Entities', href: '/entity' },
        { text: entity.name, href: '/entity/' + entity._id },
        { text: 'Changes', href: '/entity/' + entity._id + '/changes' },
        { text: change.title },
      ]"
    ></v-breadcrumbs>

    <div style="clear: both">
      <div style="float: left">
        <h1>
          {{ entity.name }}
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
            <v-icon left> mdi-tag </v-icon>{{ tag }}
          </v-chip>
        </h1>
      </div>
      <div style="float: right; text-align: right">
        <h2 class="mb-1">
          {{ entity.location.name }}<br />
          <span
            class="program-link"
            v-for="program of entity.links.programs"
            v-bind:key="program.id"
            >{{ program.name }}</span
          >
        </h2>
      </div>
    </div>

    <p class="lead" style="clear: both">
      {{ entity.description }}
    </p>
    <hr class="mb-1" />

    <div class="row">
      <div class="col-md-6">
        <v-card color="#fff2d5">
          <v-card-text>
            <h3>Change details</h3>
            <v-text-field
              label="Change title"
              v-model="change.title"
              dense
              readonly
              outlined
              append-icon="mdi-lock"
              background-color="white"
            ></v-text-field>

            <v-text-field
              label="Status"
              v-model="change.status"
              dense
              readonly
              outlined
              append-icon="mdi-lock"
              background-color="white"
            ></v-text-field>

            <v-text-field
              label="Initiator"
              v-model="change.create_user"
              dense
              readonly
              outlined
              append-icon="mdi-lock"
              background-color="white"
            ></v-text-field>

            <v-text-field
              v-model="change.reason"
              outlined
              dense
              readonly
              label="Reason for change"
              append-icon="mdi-lock"
              background-color="white"
            ></v-text-field>

            <v-menu
              v-model="changeDateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              left
              nudge-top="26"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="changeDate"
                  label="Change date"
                  append-icon="mdi-calendar"
                  readonly
                  outlined
                  dense
                  background-color="white"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="changeDate"
                :min="changeDateMin"
                @input="changeDateMenu = false"
              ></v-date-picker>
            </v-menu>

            <v-textarea
              label="Change description"
              v-model="change.description"
              dense
              outlined
              background-color="white"
            ></v-textarea>

            <v-btn color="primary" @click="save">Save</v-btn>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-md-6">
        <v-card color="#fff2d5">
          <v-card-text>
            <h3>Add a Comment</h3>
            <v-textarea
              label="Text"
              v-model="newComment"
              outlined
              rows="3"
              dense
              background-color="white"
            ></v-textarea>

            <v-select
              :items="['Open', 'In progress', 'Wont\'t fix', 'Complete']"
              v-model="newStatus"
              label="Status"
              dense
              outlined
              background-color="white"
            >
            </v-select>
            <v-select
              :items="assignOptions"
              v-model="newAssign"
              item-text="display_name"
              item-value="display_name"
              label="Assigned to"
              dense
              outlined
              background-color="white"
            >
            </v-select>

            <v-btn color="primary" @click="addComment">Add comment</v-btn>
          </v-card-text>
        </v-card>

        <v-card class="mt-5" color="#fff2d5">
          <v-card-title>History</v-card-title>
          <v-card-text>
            <div
              v-for="item of change.comments"
              v-bind:key="item.create_date"
              class="mb-3 py-3 px-3"
              style="
                background-color: #fff;
                border: 1px #999 solid;
                border-radius: 4px;
                color: #323232;
              "
            >
              <div class="float-left">
                <strong>{{ item.user }}</strong>
              </div>
              <div class="float-right">
                <strong>{{ item.date }}</strong>
              </div>
              <p class="pt-3 mb-0" style="clear: both">
                <strong>{{ item.action }}</strong> {{ item.description }}
              </p>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <v-snackbar v-model="snackbar" right color="success">
      <v-icon class="mr-3">mdi-thumb-up-outline</v-icon>
      {{ apiSuccess }}
    </v-snackbar>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import { ENTITY_URL, PERSON_URL } from "../urls";
import _ from "lodash";
import store from "../store";

export default {
  name: "Form",
  data: () => ({
    tab: 0,
    showError: null,
    snackbar: null,
    apiSuccess: "",

    entity_id: "",
    entity: { links: {}, location: {}, properties: [] },
    changeId: "",
    change: {},

    reasonOptions: [
      "Error in Entity",
      "Enhancement",
      "Remove entity",
      "Duplicate or replicate",
    ],

    changeDateMin: moment().format("YYYY-MM-DD"),
    changeDate: "",
    changeDateMenu: null,

    changeDialogOpen: null,
    changeItem: {},

    newComment: "",
    newStatus: "",
    newAssign: "",
    currentUser: "",

    assignOptions: [],
  }),
  created() {
    this.entity_id = this.$route.params.id;
    this.changeId = this.$route.params.changeId;
    this.loadEntity(this.entity_id);
    this.loadChange(this.changeId);
    this.currentUser = store.getters.fullName;
  },
  methods: {
    initialize() {},
    loadEntity(id) {
      axios
        .get(`${ENTITY_URL}/${id}`)
        .then((result) => {
          this.entity = result.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    loadChange(id) {
      axios
        .get(`${ENTITY_URL}/changes/${id}`)
        .then((result) => {
          this.change = result.data.data;
          this.changeDate = this.change.complete_date;

          this.newComment = "";
          this.newStatus = this.change.status;
          this.newAssign = this.change.assigned_user;

          this.loadImplementers();

          if (!this.change.comments) this.change.comments = new Array();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    loadImplementers() {
      axios
        .get(`${PERSON_URL}/implementer`)
        .then((result) => {
          this.assignOptions = result.data.data;

          if (this.assignOptions.indexOf(this.newAssign) == -1)
            this.assignOptions.push({ display_name: this.newAssign });
        })
        .catch((err) => {
          console.log(err);
        });
    },
    save() {
      let body = _.clone(this.change);
      body.complete_date = this.changeDate;

      axios
        .put(`${ENTITY_URL}/${this.entity._id}/changes/${body._id}`, body)
        .then(() => {
          this.loadChange(body._id);
        })
        .catch((err) => {
          console.log(err);
        });
    },

    addComment() {
      let assignChanged = this.change.assigned_user != this.newAssign;
      let statusChanged = this.change.status != this.newStatus;
      let actionText = "Commented:";

      if (assignChanged && statusChanged)
        actionText = `Assigned change to ${this.newAssign} and changed status to ${this.newStatus}:`;
      else if (assignChanged)
        actionText = `Assigned change to ${this.newAssign}:`;
      else if (statusChanged)
        actionText = `Changed status to ${this.newStatus}:`;

      this.change.comments.push({
        description: this.newComment,
        status: this.newStatus,
        date: moment().format("YYYY-MM-DD @ h:mm a"),
        user: this.currentUser,
        action: actionText,
      });

      this.change.newStatus = this.newStatus;
      this.change.assigned_user = this.newAssign;
      this.save();
    },
  },
};
</script>
