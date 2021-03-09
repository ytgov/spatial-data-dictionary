<template>
  <v-dialog v-model="isOpen" max-width="600px">
    <v-container class="pb-3" style="background-color: white">
      <h2>Connection: {{ connection.name }}</h2>
      <hr class="mb-4" />
      <p><strong>Role:</strong> Destination</p>
      <v-btn color="primary" @click="goToConnection()"
        ><v-icon class="mr-2">mdi-link-variant</v-icon> View Entity</v-btn
      >
    </v-container>
  </v-dialog>
</template>

<script>
import router from "../router";

export default {
  name: "EntityConnectionDialog",
  props: ["selectedEntity"],
  data: () => ({
    isOpen: null,
    connection: {},
  }),
  watch: {
    selectedEntity: function (val) {
      this.connection = val;
    },
  },
  methods: {
    openDialog() {
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
