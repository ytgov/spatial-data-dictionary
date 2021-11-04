<template>
  <div class="" :key="entity_id">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[
        { text: 'Dashboard', href: '/dashboard' },
        { text: 'Entities', href: '/entity' },
        { text: entity.name, href: '/entity/' + entity._id },
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
            <v-text-field
              label="Change type"
              v-model="changeType"
              outlined
              dense
              background-color="white"
              readonly
            >
            </v-text-field>

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

            <v-btn color="primary" @click="save" v-if="canSave">Save</v-btn>
          </v-card-text>
        </v-card>
        <v-card class="mt-5" color="#fff2d5">
          <v-card-title>Add comment</v-card-title>
          <v-card-text>
            <v-textarea
              label="Text"
              v-model="commentText"
              outlined
              dense
              background-color="white"
            ></v-textarea>
            <v-btn color="secondary" @click="addComment">Add Comment</v-btn>

            <v-btn
              class="float-right"
              color="warning"
              v-if="userCanApprove || isAdmin"
              @click="reject"
              >Reject</v-btn
            >
            <v-btn
              class="float-right mr-5"
              color="green"
              v-if="isAdmin"
              @click="approveFully"
              >Admin Approve</v-btn
            >
            <v-btn
              class="float-right mr-5"
              color="green"
              v-if="userCanApprove && !isAdmin"
              @click="approve"
              >Approve</v-btn
            >

            <div style="clear: both"></div>
          </v-card-text>
        </v-card>
      </div>
      <div class="col-md-6">
        <v-card color="#fff2d5" class="mb-5"
          ><v-card-title>Status: {{ changeRequest.status }}</v-card-title>
          <v-card-text v-if="showApprovals">
            <h3 class="mb-0">
              Location:
              <span style="font-weight: 400">{{ entity.location.name }}</span>
            </h3>

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
              <h3 class="mb-0">
                Program:
                <span style="font-weight: 400">{{ program.name }}</span>
              </h3>

              <ul class="mb-3">
                <li v-for="(ca, idx) of program.change_approvers" :key="idx">
                  {{ ca.name }} (
                  <span
                    v-for="mem of ca.members"
                    :key="mem._id"
                    class="person-list"
                  >
                    {{ mem.first_name }} {{ mem.last_name
                    }}<span class="person-sep"> or</span>
                  </span>
                  )
                </li>
              </ul>
            </div>

            <h3 class="mt-5" v-if="missingText">** {{ missingText }}</h3>
          </v-card-text>
          <v-card-text v-if="!showApprovals">
            <h3>
              Approvals are not required for Standard Changes, but the change
              must still be logged.
            </h3>
            <h2 class="mt-5">** {{ missingText }}</h2>
          </v-card-text>
        </v-card>

        <v-card class="mt-5" color="#fff2d5">
          <v-card-title>History</v-card-title>
          <v-card-text>
            <div
              v-for="item of changeRequest.comments"
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
                <v-icon
                  v-if="item.action.indexOf('Reject') >= 0"
                  class="mr-3"
                  color="red"
                  >mdi-close-outline</v-icon
                >
                <v-icon
                  v-if="item.action.indexOf('Approv') >= 0"
                  class="mr-3"
                  color="green"
                  >mdi-check-outline</v-icon
                ><strong>{{ item.user }}</strong>
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
import { ENTITY_URL } from "../urls";
import _ from "lodash";
import router from "../router";
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

    changeRequest: {},
    changeRequestId: "",

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
    changeType: "",
    commentText: "",

    showApprovals: true,
    userCanApprove: true,
    canSave: true,

    changeRequests: [],

    approvedNames: [],
    missingText: "",
    currentUser: "",

    isAdmin: false,
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
    this.changeRequestId = this.$route.params.changeRequestId;
    this.currentUser = store.getters.fullName;
    this.isAdmin = store.getters.roles.indexOf("Admin") >= 0;
  },
  methods: {
    loadEntity(id) {
      axios
        .get(`${ENTITY_URL}/${id}`)
        .then((result) => {
          this.entity = result.data.data;
          this.loadChangeRequest();
        })
        .catch((err) => {
          console.log(err);
        });
    },

    loadChangeRequest() {
      axios
        .get(
          `${ENTITY_URL}/${this.entity_id}/request-change/${this.changeRequestId}`
        )
        .then((result) => {
          this.changeRequest = result.data.data;
          this.changeTitle = this.changeRequest.title;
          this.changeType = this.changeRequest.change_type;
          this.changeDate = this.changeRequest.date;
          this.changeReason = this.changeRequest.reason;
          this.changeDescription = this.changeRequest.description;
          this.commentText = "";
          this.missingText = "";

          let approveNames = this.changeRequest.comments
            .filter((f) => f.action.indexOf("Approve") >= 0)
            .map((f) => f.user);

          let requiredNames = [];
          let allPeople = [];

          if (this.entity.location && this.entity.location.change_approvers) {
            let foundOne = false;

            for (let ca of this.entity.location.change_approvers) {
              for (let mem of ca.members) {
                if (
                  approveNames.indexOf(`${mem.first_name} ${mem.last_name}`) >=
                  0
                )
                  foundOne = true;
                else allPeople.push(`${mem.first_name} ${mem.last_name}`);
              }
            }

            if (!foundOne) {
              this.entity.location.change_approvers.forEach((ca) => {
                requiredNames.push(ca.name);
              });
            }
          }

          this.entity.links.programs.forEach((p) => {
            for (let ca of p.change_approvers) {
              let foundOne = false;
              for (let mem of ca.members) {
                if (
                  approveNames.indexOf(`${mem.first_name} ${mem.last_name}`) >=
                  0
                )
                  foundOne = true;
                else allPeople.push(`${mem.first_name} ${mem.last_name}`);
              }

              if (!foundOne) {
                p.change_approvers.forEach((ca) => {
                  requiredNames.push(ca.name);
                });
              }
            }
          });

          let missingApprovals = [];

          requiredNames.forEach((n) => {
            if (approveNames.indexOf(n) == -1) missingApprovals.push(n);
          });

          this.userCanApprove = false;

          if (missingApprovals.length > 0) {
            if (allPeople.indexOf(this.currentUser) > -1)
              this.userCanApprove = true;

            this.missingText = `Awaiting approval from ${_.uniq(
              missingApprovals
            ).join(", ")}`;
          }

          if (this.changeRequest.status == "Rejected") {
            this.userCanApprove = false;
            this.canSave = false;
            this.missingText = "This request has been rejected.";
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    save() {
      let body = _.clone(this.changeRequest);
      body.description = this.changeDescription;
      body.date = this.changeDate;
      body.reason = this.changeReason;

      axios
        .put(
          `${ENTITY_URL}/${this.entity._id}/request-change/${this.changeRequestId}`,
          body
        )
        .then((result) => {
          if (result.data.messages[0].text == "Change added") {
            let newId = result.data.data.ops[0]._id;
            router.push(`/entity/${this.entity_id}/changes/${newId}`);
          } else {
            this.loadChangeRequest();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    typeChange() {
      if (this.changeType == "Normal") this.showApprovals = true;
      else this.showApprovals = false;
    },

    addComment() {
      let comment = {
        date: moment().format("YYYY-MM-DD @ h:mm a"),
        user: this.currentUser,
        action: "Commented:",
        description: this.commentText,
      };

      this.changeRequest.comments.push(comment);
      this.save();
    },

    approve() {
      // this needs to make sure it's the right person and right time
      let comment = {
        date: moment().format("YYYY-MM-DD @ h:mm a"),
        user: this.currentUser,
        action: "Approved:",
        description: this.commentText,
      };

      this.changeRequest.comments.push(comment);
      this.save();
    },

    approveFully() {
      // this needs to make sure it's the right person and right time
      let comment = {
        date: moment().format("YYYY-MM-DD @ h:mm a"),
        user: this.currentUser,
        action: "Admin Approved:",
        description: this.commentText,
      };

      this.changeRequest.comments.push(comment);
      this.save();
    },

    reject() {
      // this needs to make sure it's the right person and right time
      let comment = {
        date: moment().format("YYYY-MM-DD @ h:mm a"),
        user: this.currentUser,
        action: "Rejected:",
        description: this.commentText,
      };

      this.changeRequest.comments.push(comment);
      this.changeRequest.status = "Rejected";

      this.save();
    },
    /*
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
    }, */
  },
};
</script>
