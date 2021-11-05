<template>
  <div class="" :key="entity_id">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[
        { text: 'Dashboard', to: '/dashboard' },
        { text: 'Entities', to: '/entity', exact: true },
        { text: entity.name, to: '/entity/' + entity._id, exact: true },
        { text: 'Changes' },
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
      <div class="col-md-8">
        <v-card color="#fff2d5">
          <v-card-title>Changes</v-card-title>
          <v-card-text>
            <v-data-table
              :items="changes"
              :headers="[
                { text: 'Change date', value: 'date' },
                { text: 'Change title', value: 'title' },
                { text: 'Reason', value: 'reason' },
                { text: 'Status', value: 'status' },
              ]"
              @click:row="changeClick"
              :sort-by="['date']"
              :sort-desc="['true']"
            >
              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-md-6"></div>
    </div>
    <!-- 
    <v-dialog v-model="changeDialogOpen" persistent max-width="600px">
      <v-container class="pb-3" style="background-color: white">
        <h2>
          Change Request Details
          <v-btn
            class="float-right my-0"
            x-small
            fab
            color="secondary"
            @click="changeDialogOpen = null"
            ><v-icon>mdi-close</v-icon></v-btn
          >
        </h2>
        <hr class="mb-4" />

        <v-menu
          v-model="changeDate1Menu"
          :close-on-content-click="false"
          transition="scale-transition"
          left
          nudge-top="26"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="changeItem.date"
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
            v-model="changeItem.date"
            :min="changeDateMin"
            @input="changeDate1Menu = false"
          ></v-date-picker>
        </v-menu>

        <v-text-field
          label="Change title"
          dense
          outlined
          background-color="white"
          v-model="changeItem.title"
        ></v-text-field>

        <v-select
          :items="reasonOptions"
          v-model="changeItem.reason"
          outlined
          dense
          label="Reason for change"
          background-color="white"
        ></v-select>

        <v-select
          label="Status"
          dense
          :items="['Open', 'In progress', 'Rejected']"
          outlined
          background-color="white"
          v-model="changeItem.status"
        ></v-select>
        <v-textarea
          label="Chagne description"
          dense
          outlined
          background-color="white"
          v-model="changeItem.description"
        ></v-textarea>

        <v-btn color="primary" @click="update"> Save </v-btn>
        <v-btn color="info" class="float-right" @click="approve"
          ><v-icon class="mr-3">mdi-hammer-wrench</v-icon> Approve
        </v-btn>
      </v-container>
    </v-dialog>
 -->
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

    reasonOptions: [
      "Error in Entity",
      "Enhancement",
      "Remove entity",
      "Duplicate or replicate",
    ],

    changeDateMin: moment().format("YYYY-MM-DD"),
    changeDate: moment().add(7, "days").format("YYYY-MM-DD"),
    changeDateMenu: null,
    changeDate1Menu: null,

    changeReason: "",
    changeTitle: "",
    changeDescription: "",

    changes: [],

    changeDialogOpen: null,
    changeItem: {},
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
    this.loadChanges(this.entity_id);
  },
  methods: {
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
    loadChanges(id) {
      axios
        .get(`${ENTITY_URL}/${id}/changes`)
        .then((result) => {
          this.changes = result.data.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    formatDate(date) {
      return moment(date).format("YYYY-MM-DD");
    },
    changeClick(item) {
      /* this.changeItem = _.clone(item);
      this.changeDialogOpen = true; */
      router.push(`/entity/${item.entity_id}/changes/${item._id}`);
    },
  },
};
</script>
