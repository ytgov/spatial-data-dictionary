<template>
  <v-dialog v-model="isOpen" persistent max-width="600px">
    <v-container class="pb-3" style="background-color: white">
      <h2>Add Connection</h2>

      <hr class="mb-4" />
      <v-select
        :items="connectionTypeOptions"
        v-model="connectionType"
        dense
        outlined
        label="Connection Type"
      ></v-select>

      <v-select
        :items="entityOptions"
        v-if="connectionType == 'Source Entity'"
        v-model="selectedEntity"
        item-text="name"
        item-value="_id"
        dense
        outlined
        label="Select a Source Entity"
      ></v-select>

      <v-select
        :items="personOptions"
        v-if="connectionType != 'Source Entity'"
        v-model="selectedPerson"
        item-text="display_name"
        item-value="_id"
        dense
        outlined
        label="Select a Person"
      ></v-select>

      <v-text-field
        label="Role (required)"
        v-model="personRole"
        v-if="connectionType != 'Source Entity'"
        required
        dense
        outlined
      ></v-text-field>

      <v-card
        class="mb-4"
        color="#fff2d5"
        v-if="connectionType == 'Person' && selectedPerson == null"
      >
        <v-card-text>
          <v-text-field
            label="First name (required)"
            v-model="newPersonFirstName"
            required
            dense
            outlined
            background-color="white"
          ></v-text-field>
          <v-text-field
            label="Last name (required)"
            v-model="newPersonLastName"
            dense
            outlined
            background-color="white"
            required
          ></v-text-field>
          <v-text-field
            label="Email (required)"
            v-model="newPersonEmail"
            required
            dense
            outlined
            type="email"
            hide-details
            background-color="white"
          ></v-text-field>
        </v-card-text>
      </v-card>

      <v-alert v-if="errorMessage" dense type="error">
        {{ errorMessage }}
      </v-alert>

      <v-btn color="primary" @click="saveConnection()"> Add </v-btn>
      <v-btn color="secondary" class="float-right" @click="closeDialog()">
        Close
      </v-btn>
    </v-container>
  </v-dialog>
</template>

<script>
import { ENTITY_URL, PERSON_URL } from "../urls";
import axios from "axios";

export default {
  name: "ConnectionDialog",
  props: ["dialog", "existing", "self"],
  data: () => ({
    isOpen: null,
    connectionTypeOptions: ["Source Entity", "Person"],
    entityOptions: [],
    personOptions: [],
    allEntities: [],
    existingEntities: [],

    connectionType: "Source Entity",
    selectedEntity: null,
    selectedPerson: null,
    personRole: "",
    newPersonFirstName: "",
    newPersonLastName: "",
    newPersonEmail: "",

    errorMessage: "",
  }),
  watch: {
    dialog: function (val) {
      this.clearInput();

      let existingIds = this.existingEntities.map((e) => e.id);
      this.entityOptions = [];

      this.allEntities.forEach((e) => {
        if (existingIds.indexOf(e._id) == -1 && this.self._id != e._id)
          this.entityOptions.push(e);
      });

      this.isOpen = val;
    },
    existing: function (val) {
      this.existingEntities = val;
    },
  },
  created() {
    this.errorMessage = "";

    axios
      .get(ENTITY_URL)
      .then((result) => {
        this.allEntities = result.data.data;
      })
      .catch((error) => {
        console.error(error);
      });

    axios
      .get(PERSON_URL)
      .then((result) => {
        this.personOptions = result.data.data;
        this.selectedPerson = this.personOptions[0]._id;
        this.personOptions.push({
          _id: null,
          display_name: "Add a New Person",
        });
      })
      .catch((error) => {
        console.error(error);
      });
  },
  methods: {
    openDialog() {
      this.isOpen = true;
    },
    closeDialog() {
      this.isOpen = null;
      //this.$emit("doClose");
    },
    clearInput() {
      this.errorMessage = "";
      this.connectionType = "Source Entity";
      this.selectedPerson = this.personOptions[0];
      this.selectedEntity = null;
      this.personRole = this.newPersonFirstName = this.newPersonLastName = this.newPersonEmail =
        "";
    },
    displayName(person) {
      return `${person.first_name} ${person.last_name}`;
    },
    saveConnection() {
      this.errorMessage = "";

      if (this.connectionType == "Source Entity") {
        if (!this.selectedEntity) {
          this.errorMessage = "You must select an Entity";
          return;
        }
      } else if (this.connectionType == "Person") {
        if (!this.personRole) {
          this.errorMessage = "You must enter a Role";
          return;
        }

        if (this.selectedPerson == null) {
          if (
            !(
              this.newPersonFirstName &&
              this.newPersonLastName &&
              this.newPersonEmail
            )
          ) {
            this.errorMessage =
              "You must complete all information about the person";
            return;
          }
        }
      }

      let connection = {
        connectionType: this.connectionType,
        selectedEntity: this.selectedEntity,
        selectedPerson: this.selectedPerson,
        newPersonFirstName: this.newPersonFirstName,
        newPersonLastName: this.newPersonLastName,
        newPersonEmail: this.newPersonEmail,
        personRole: this.personRole,
      };

      this.$emit("doSave", connection);
    },
  },
};
</script>
