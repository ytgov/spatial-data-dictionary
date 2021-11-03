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
        :readonly="!canEdit"
      >
      </v-text-field>

      <v-btn color="primary" @click="saveConnection()" v-if="canEdit"> Save</v-btn>
      <v-btn color="warning" class="float-right" @click="removeConnection()" v-if="canEdit">
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
    canEdit: false,
  }),
  methods: {
    openDialog(connection, canEdit) {
      this.connection = connection;
      this.role = this.connection.role;
      this.canEdit = canEdit;
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
