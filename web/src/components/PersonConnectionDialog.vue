<template>
  <v-dialog v-model="isOpen" max-width="600px">
    <v-container class="pb-3" style="background-color: white">
      <h2>Connection: {{ connection.name }}</h2>
      <hr class="mb-4" />
      <v-text-field
        v-model="role"
        label="Role (required)"
        dense
        outlined
        required
      >
      </v-text-field>

      <v-btn color="primary" @click="saveConnection()"> Save</v-btn>
      <v-btn color="warning" class="float-right" @click="removeConnection()">
        Remove
      </v-btn>
    </v-container>
  </v-dialog>
</template>

<script>
export default {
  name: "EntityConnectionDialog",
  data: () => ({
    isOpen: null,
    connection: {},
    role: "",
  }),
  methods: {
    openDialog(connection) {
      this.connection = connection;
      this.role = this.connection.role;
      this.isOpen = true;
    },
    closeDialog() {
      this.isOpen = null;
    },
    saveConnection() {
      this.$emit("updatePersonConnection", this.role);
      this.closeDialog();
    },
    removeConnection() {
      this.$emit("removePersonConnection");
      this.closeDialog();
    },
  },
};
</script>
