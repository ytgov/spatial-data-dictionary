<template>
  <div>
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[
        { text: 'Dashboard', to: '/dashboard' },
        { text: 'Entities', to: '/entity', exact: true },
        { text: 'Create Entity' },
      ]"
    ></v-breadcrumbs>
    <h1>Create Entity</h1>
    <hr class="mb-3" />

    <v-form v-model="form1Valid">
      <div class="row">
        <div class="col-12">
          <v-text-field
            dense
            v-model="name"
            outlined
            label="Name (required)"
            required
            :rules="nameRules"
            hide-details
          ></v-text-field>
        </div>

        <div class="col-12">
          <v-textarea
            dense
            v-model="description"
            outlined
            label="Description"
            hide-details
          ></v-textarea>
        </div>

        <div class="col-12">
          <v-autocomplete
            dense
            :items="locationOptions"
            v-model="location"
            outlined
            label="Location (required)"
            required
            :rules="requiredRule"
            hide-details
            item-value="_id"
            item-text="name"
          ></v-autocomplete>
        </div>
        <div class="col-12">
          <v-autocomplete
            dense
            :items="programOptions"
            v-model="programs"
            outlined
            multiple
            hide-details
            label="Program(s)"
            required
            item-value="_id"
            item-text="name"
          ></v-autocomplete>
        </div>
        <div class="col-12">
          <v-autocomplete
            dense
            :items="list"
            v-model="sources"
            outlined
            label="Sources"
            required
            multiple
            item-value="_id"
            item-text="display_name"
            hint="Location: Name"
            persistent-hint
          ></v-autocomplete>
        </div>
      </div>
    </v-form>

    <v-banner :hidden="!showError" icon="mdi-alert-circle" class="problem mt-4">
      <h3>There is a problem</h3>
      <span>That's not the right team!</span>
    </v-banner>

    <v-btn
      color="primary"
      class="mr-5"
      :disabled="!form1Valid"
      @click="saveForm"
      >Create</v-btn
    >
    <v-btn color="secondary" to="/entity">Cancel</v-btn>

    <v-snackbar v-model="snackbar" right color="success">
      <v-icon class="mr-3">mdi-thumb-up-outline</v-icon>
      {{ apiSuccess }}
    </v-snackbar>
  </div>
</template>

<script>
import axios from "axios";
import { ENTITY_URL, LOCATION_URL, PROGRAM_URL } from "../urls";
import router from "../router";

export default {
  name: "Grid",
  data: () => ({
    list: [],
    sources: [],
    locationOptions: [],
    programOptions: [],
    form1Valid: true,
    name: "",
    nameRules: [
      (v) => !!v || "Name is required",
      (v) => (v && v.length > 2) || "Name must be more than 2 characters",
    ],
    requiredRule: [(v) => !!v || "This is required"],
    description: "",
    location: "",
    programs: [],
    showError: null,
    snackbar: null,
    apiSuccess: "",
  }),
  created() {
    axios
      .get(ENTITY_URL)
      .then((results) => {
        this.list = results.data.data;

        this.list.map(
          (e) => (e.display_name = `${e.location.name}: ${e.name}`)
        );
      })
      .catch((err) => {
        console.err(err);
      });

    axios
      .get(LOCATION_URL)
      .then((results) => {
        this.locationOptions = results.data.data;
      })
      .catch((err) => {
        console.err(err);
      });

    axios
      .get(PROGRAM_URL)
      .then((results) => {
        this.programOptions = results.data.data;
      })
      .catch((err) => {
        console.err(err);
      });
  },
  methods: {
    saveForm() {
      this.showError = false;
      console.log("SAVING");

      let body = {
        name: this.name,
        description: this.description,
        location: { id: this.location },
        links: {
          entities: [],
          people: [],
          programs: [],
        },
        attributes: [],
        status: "Draft",
      };

      if (this.sources) {
        let sourceList = [];

        this.sources.forEach((item) => {
          sourceList.push({ id: item, role: "Source" });
        });

        body.links.entities = sourceList;
      }

      if (this.programs) {
        let programList = [];

        this.programs.forEach((item) => {
          programList.push({ id: item });
        });

        body.links.programs = programList;
      }

      axios
        .post(ENTITY_URL, body)
        .then((result) => {
          console.log(result);

          let res = result.data.data;
          let id = res.insertedId;
          this.snackbar = true;
          this.apiSuccess = "This message came from the API";

          router.push(`/entity/${id}`);
        })
        .catch((err) => {
          this.showError = true;
          console.log(err);
        });
    },
  },
};
</script>
