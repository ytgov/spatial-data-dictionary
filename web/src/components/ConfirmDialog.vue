<template>
  <v-dialog v-model="dialogModel" persistent max-width="400px">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions class="px-5">
        <v-btn color="primary" @click="doConfirm()">Confirm</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="secondary" @click="doDeny()">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    title: "",
    message: "",
    dialogModel: null,
    confirmCallback: null,
    denyCallback: null,
  }),
  methods: {
    show(title, message, confirmCallback, denyCallback) {
      this.title = title;
      this.message = message;
      this.confirmCallback = confirmCallback;
      this.denyCallback = denyCallback;
      this.dialogModel = true;
    },

    doConfirm() {
      this.confirmCallback();
      this.dialogModel = null;
    },
    doDeny() {
      this.denyCallback();
      this.dialogModel = null;
    },
  },
};
</script>