<template>
  <v-dialog v-model="isOpen" max-width="600px">
    <v-container class="pb-3" style="background-color: white">
      <h2>Connection: {{ connection.name }}</h2>
      <hr class="mb-4" />
      <p><strong>Role:</strong> Destination</p>

      <strong v-if="attributes && attributes.length > 0">Connected Attributes:</strong>

      <ul v-if="attributes && attributes.length > 0">
        <li v-for="attribute in attributes" v-bind:key="attribute.id">
          {{ attribute.name }}
        </li>
      </ul>

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
  props: ["selectedEntity", "entity"],
  data: () => ({
    isOpen: null,
    connection: {},
    canEdit: false,
    attributes: [],
  }),
  watch: {
    selectedEntity: function (val) {
      this.connection = val;
    },
  },
  methods: {
    openDialog(canEdit) {
      this.isOpen = true;
      this.canEdit = canEdit;

      let remAttrs = this.selectedEntity.attributes;
      let localAttrs = this.entity.attributes;

      this.attributes = [];

      for (let locAttr of localAttrs) {
        for (let remAttr of remAttrs) {
          if (remAttr.source && remAttr.source.id) {
            let remId = remAttr.source.id;

            if (remId == locAttr._id) this.attributes.push(locAttr);
          }
        }
      }
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
