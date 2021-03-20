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

            <v-btn color="primary" @click="addComment">Add comment</v-btn>
          </v-card-text>
        </v-card>

        <v-card class="mt-5" color="#fff2d5">
          <v-card-text>
            <h3>Comments</h3>
            <v-data-table
              :items="change.comments"
              :headers="[
                { text: 'Date', value: 'date' },
                { text: 'Status', value: 'status' },
                { text: 'Comment', value: 'text' },
              ]"
              @click:row="changeClick"
              :sort-by="['create_date']"
              :sort-desc="['true']"
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
            </v-data-table>
          </v-card-text></v-card
        >
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
import { ENTITY_URL } from "../urls";
import _ from "lodash";
import router from "../router";

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
  }),
  created() {
    this.entity_id = this.$route.params.id;
    this.changeId = this.$route.params.changeId;
    this.loadEntity(this.entity_id);
    this.loadChange(this.changeId);
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

          if (!this.change.comments) this.change.comments = new Array();
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
        .then((result) => {
          console.log(result.data);
          this.loadChange(body._id);
        })
        .catch((err) => {
          console.log(err);
        });
    },

    addComment() {
      this.change.comments.push({
        text: this.newComment,
        status: this.newStatus,
        create_date: new Date(),
      });

      this.change.newStatus = this.newStatus;

      this.save();
    },

    formatDate(date) {
      return moment(date).format("YYYY-MM-DD");
    },
    changeClick(item) {
      this.changeItem = _.clone(item);
      this.changeDialogOpen = true;
    },
    approve() {
      let body = this.changeItem;
      axios
        .post(
          `${ENTITY_URL}/${this.entity._id}/request-change/${body._id}/approve`,
          body
        )
        .then((result) => {
          console.log(result.data.data.ops[0]);
          //this.loadChangeRequests(this.entity_id);

          router.push(
            `/entity/${this.entity_id}/changes/${result.data.data.ops[0]._id}`
          );
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>
