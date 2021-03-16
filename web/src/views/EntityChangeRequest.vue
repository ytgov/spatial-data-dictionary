<template>
  <div class="" :key="entity_id">
    <div style="clear: both">
      <div style="float: left">
        <h1>
          {{ entity.name }}
          <br />

          <status-chip :status="entity.status"></status-chip>
          <location-chip :location="entity.location.type"></location-chip>

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
          <v-card-title>Request Change to Entity</v-card-title>
          <v-card-text>
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

            <v-select
              :items="[
                'Error in Entity',
                'Enhancement',
                'Remove entity',
                'Duplicate or replicate',
              ]"
              v-model="changeReason"
              outlined
              dense
              label="Reason for change"
              background-color="white"
            ></v-select>

            <v-text-field
              label="Change title"
              v-model="changeTitle"
              dense
              outlined
              background-color="white"
            ></v-text-field>

            <v-textarea
              label="Change description"
              v-model="changeDescription"
              dense
              outlined
              background-color="white"
            ></v-textarea>

            <v-btn color="primary" @click="save">Save</v-btn>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-md-6">
        <v-data-table
          :items="changeRequests"
          :headers="[
            { text: 'Create', value: 'create_date' },
            { text: 'Title', value: 'title' },
            { text: 'Status', value: 'status' },
          ]"
          @click:row="changeClick"
        >
          <template v-slot:item.create_date="{ item }">
            {{ formatDate(item.create_date) }}
          </template>
        </v-data-table>
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

export default {
  name: "Form",
  data: () => ({
    tab: 0,
    showError: null,
    snackbar: null,
    apiSuccess: "",

    entity_id: "",
    entity: { links: {}, location: {}, properties: [] },

    changeHeaders: [
      { text: "Date", value: "id" },
      { text: "Name", value: "id" },
      { text: "Description", value: "id" },
    ],

    changeDateMin: moment().format("YYYY-MM-DD"),
    changeDate: moment().add(7, "days").format("YYYY-MM-DD"),
    changeDateMenu: null,

    changeReason: "",
    changeTitle: "",
    changeDescription: "",

    changeRequests: [],
  }),
  computed: {},
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    "$route.params.id": {
      handler: function (id) {
        this.entity_id = id;
        this.loadEntity(this.entity_id);
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.entity_id = this.$route.params.id;
    this.loadEntity(this.entity_id);
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

      axios
        .get(`${ENTITY_URL}/${id}/request-change`)
        .then((result) => {
          this.changeRequests = result.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    updateEntity() {
      axios
        .put(`${ENTITY_URL}/${this.entity._id}`, this.entity)
        .then((result) => {
          this.entity = result.data.data.value;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    save() {
      let body = {
        title: this.changeTitle,
        description: this.changeDescription,
        date: this.changeDate,
        reason: this.changeReason,
      };

      axios
        .post(`${ENTITY_URL}/${this.entity._id}/request-change`, body)
        .then((result) => {
          console.log(result.data.data.value);
        })
        .catch((err) => {
          console.log(err);
        });
    },

    formatDate(date) {
      return moment(date).format("YYYY-MM-DD");
    },
    changeClick(item) {
      console.log("CICK", item)
    },
  },
};
</script>
