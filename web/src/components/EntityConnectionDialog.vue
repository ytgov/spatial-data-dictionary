<template>
  <v-dialog v-model="isOpen" max-width="600px">
    <v-container class="pb-3" style="background-color: white">
      <h2>Connection: {{ connection.name }}</h2>

      <hr class="mb-4" />

      <p><strong>Role:</strong> {{ role }}</p>

      <strong>Connected Attributes:</strong>

      <ul>
        <li v-for="attribute in attributes" v-bind:key="attribute.id">
          {{ attribute.name }}
        </li>
      </ul>

      <v-alert v-if="errorMessage" dense type="error">
        {{ errorMessage }}
      </v-alert>

      <v-btn color="primary" @click="goToConnection()"
        ><v-icon class="mr-2">mdi-link-variant</v-icon> View Entity</v-btn
      >
      <v-btn
        color="warning"
        v-if="attributes.length == 0 && canEdit"
        class="float-right"
        @click="removeConnection()"
      >
        Remove Connection
      </v-btn>
    </v-container>
  </v-dialog>
</template>

<script>
import { ENTITY_URL } from "../urls";
import axios from "axios";
import router from "../router";

export default {
  name: "EntityConnectionDialog",
  props: ["selectedEntity", "entity"],
  data: () => ({
    isOpen: null,
    errorMessage: "",
    role: "",
    connection: {},
    self: {},
    allAttributes: [],
    attributes: [],
    timer: null,
    canEdit: false,
  }),
  watch: {
    selectedEntity: function (val) {
      this.connection = val;
      this.role = val.role;

      axios.get(`${ENTITY_URL}/${this.connection.id}`).then((result) => {
        let link = result.data.data;
        this.connection = link;
        this.timer = window.setInterval(this.matchAttributes, 100);
      });
    },
    entity: function (val) {
      this.self = val;
      this.allAttributes = val.attributes;
    },
  },
  created() {
    this.errorMessage = "";
    //this.isOpen = null;
  },
  methods: {
    openDialog(canEdit) {
      this.isOpen = true;
      this.canEdit = canEdit;
    },
    closeDialog() {
      this.isOpen = null;
    },

    removeConnection() {
      this.errorMessage = "";
      this.$emit("removeConnection", this.connection);
    },

    matchAttributes() {
      if (this.allAttributes) {
        window.clearInterval(this.timer);
        this.attributes = [];
        let ids = this.connection.attributes.map((a) => a._id);

        this.allAttributes.forEach((a) => {
          if (a.source && a.source.id) {
            if (ids.indexOf(a.source.id) != -1) this.attributes.push(a);
          }
        });
      }
    },
    goToConnection() {
      router.push(`/entity/${this.connection._id}`);
    },
  },
};
</script>
