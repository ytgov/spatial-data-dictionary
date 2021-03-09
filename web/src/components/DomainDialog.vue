<template>
  <v-dialog v-model="isOpen" max-width="600px">
    <v-container class="pb-3" style="background-color: white">
      <h2>Domain: {{ connection.name }}</h2>
      <hr class="mb-4" />
      <p>{{ connection.description }}</p>
      <strong>Attributes:</strong>
      <ul>
        <li v-for="attr in connection.attributes" v-bind:key="attr.id">
          {{ attr.name }} ({{ attr.type }})
        </li>
      </ul>
      <v-btn color="primary" @click="goToConnection()"
        ><v-icon class="mr-2">mdi-link-variant</v-icon> View Entity</v-btn
      >
    </v-container>
  </v-dialog>
</template>

<script>
import { ENTITY_URL } from "../urls";
import axios from "axios";
import router from "../router";

export default {
  name: "DomainDialog",
  data: () => ({
    isOpen: null,
    connection: {},
  }),
  methods: {
    openDialog(connection) {
      this.connection = connection;
      console.log(connection);

      axios.get(`${ENTITY_URL}/${connection.id}`).then((resp) => {
        this.connection = resp.data.data;
      });

      this.isOpen = true;
    },
    closeDialog() {
      this.isOpen = null;
    },
    goToConnection() {
      router.push(`/entity/${this.connection._id}`);
    },
  },
};
</script>
