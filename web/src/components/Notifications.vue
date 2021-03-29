<template>
  <v-snackbar v-model="visible" right :color="color">
    <v-icon class="mr-3">{{ icon }}</v-icon>
    {{ text }}
  </v-snackbar>
</template>

<script>
export default {
  name: "Home",
  data: () => ({
    visible: null,
    color: "",
    text: "",
    icon: "",
  }),
  methods: {
    show(color, icon, message) {
      this.color = color;
      this.icon = icon;
      this.text = message;

      this.visible = true;
    },
    showSuccess(message) {
      this.color = "green";
      this.icon = "mdi-thumb-up";
      this.text = message;

      this.visible = true;
    },
    showError(message) {
      this.color = "red";
      this.icon = "mdi-thumb-down";
      this.text = message;

      this.visible = true;
    },
    showAPIMessages(apiResponse) {
      if (apiResponse.errors) {
        return this.showError(apiResponse.errors[0].text);
      }

      if (apiResponse.messages) {
        let message = apiResponse.messages[0];

        if (message.variant == "success") this.showSuccess(message.text);
        else if (message.variant == "error") this.showError(message.text);
        else this.show(message.variant, "mdi-help-circle", message.text);

        return;
      }

      this.show("primary", "mdi-check", "Complete");
    },
  },
};
</script>
