<template>
  <div class="" :key="entity_id">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[
        { text: 'Dashboard', to: '/dashboard' },
        { text: 'Entities', to: '/entity', exact: true },
        { text: entity.name, to: '/entity/' + entity._id, exact: true },
        { text: 'Change Requests' },
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
        <div style="float: right; text-align: right">
          <h2 class="mb-1">
            <router-link :to="'/entity?location=' + entity.location.id">{{
              entity.location.name
            }}</router-link
            ><br />
            <span
              class="program-link"
              v-for="program of entity.links.programs"
              v-bind:key="program.id"
            >
              <router-link :to="'/entity?program=' + program.id">{{
                program.name
              }}</router-link></span
            >
          </h2>
        </div>
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
            <v-select
              label="Change type"
              v-model="changeType"
              :items="['Normal', 'Standard']"
              outlined
              dense
              background-color="white"
              @change="typeChange"
            >
            </v-select>

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
              :items="reasonOptions"
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

            <v-btn color="primary" @click="save">Create Request</v-btn>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-md-6">
        <v-card color="#fff2d5" class="mb-5">
          <v-card-title>Required Approvals</v-card-title>
          <v-card-text v-if="showApprovals">
            <h3 class="mb-0">Location:  <span style="font-weight: 400">{{ entity.location.name }}</span></h3>

            <ul class="mb-3">
              <li
                style="font-weight: 400"
                v-for="(ca, idx) of entity.location.change_approvers"
                :key="idx"
              >
                {{ ca.name }} (
                <span v-for="mem of ca.members" :key="mem._id">
                  {{ mem.first_name }} {{ mem.last_name }}
                </span>
                )
              </li>
            </ul>

            <div
              v-for="program of entity.links.programs"
              v-bind:key="program.id"
            >
              <h3 class="mb-0">Program: <span style="font-weight: 400">{{ program.name }}</span></h3>

              <ul class="mb-3">
                <li
                  
                  v-for="(ca, idx) of program.change_approvers"
                  :key="idx"
                >
                  {{ ca.name }} (
                  <span v-for="mem of ca.members" :key="mem._id" class="person-list">
                    {{ mem.first_name }} {{ mem.last_name }}<span class="person-sep"> or</span>
                  </span>
                  )
                </li>
              </ul>
            </div>
          </v-card-text>
          <v-card-text v-if="!showApprovals">
            <h3>
              Approvals are not required for Standard Changes, but the change
              must still be logged.
            </h3>
          </v-card-text>
        </v-card>
      </div>
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
    </v-dialog> -->

    <v-snackbar v-model="snackbar" right color="success">
      <v-icon class="mr-3">mdi-thumb-up-outline</v-icon>
      {{ apiSuccess }}
    </v-snackbar>

    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import { ENTITY_URL } from "../urls";
//import _ from "lodash";
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
    changeDate: moment().format("YYYY-MM-DD"),
    changeDateMenu: null,
    changeDate1Menu: null,

    changeType: "Normal",
    changeReason: "",
    changeTitle: "",
    changeDescription: "",

    showApprovals: true,

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
    save() {
      this.changeTitle = this.changeTitle.trim();
      this.changeDescription = this.changeDescription.trim();

      if (!this.changeTitle || !this.changeReason || !this.changeDescription) {
        this.$refs.notifier.showError(
          "Change title, Reason for change and Change description are all required."
        );
        return;
      }

      let body = {
        title: this.changeTitle,
        description: this.changeDescription,
        date: this.changeDate,
        reason: this.changeReason,
        change_type: this.changeType,
      };

      axios
        .post(`${ENTITY_URL}/${this.entity._id}/request-change`, body)
        .then((result) => {
          let newId = result.data.data.ops[0]._id;

          if (this.changeType == "Standard") {
            router.push(`/entity/${this.entity_id}/changes/${newId}`);
          } else {
            router.push(`/entity/${this.entity_id}/change-request/${newId}`);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    update() {
      let body = this.changeItem;

      axios
        .put(
          `${ENTITY_URL}/${this.entity._id}/request-change/${body._id}`,
          body
        )
        .then((result) => {
          console.log(result.data.data.value);
          this.loadChangeRequests(this.entity_id);
          this.changeDialogOpen = null;
          this.changeItem = {};
        })
        .catch((err) => {
          console.log(err);
        });
    },

    typeChange() {
      if (this.changeType == "Normal") this.showApprovals = true;
      else this.showApprovals = false;
    },
  },
};
</script>
