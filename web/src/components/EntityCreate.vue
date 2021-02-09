<template>
  <div>
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
          ></v-text-field>
        </div>

        <div class="col-12">
          <v-textarea
            dense
            v-model="description"
            outlined
            label="Description (required)"
            required
          ></v-textarea>
        </div>

        <div class="col-12">
          <v-autocomplete
            dense
            :items="categoryList"
            v-model="category"
            outlined
            label="Category"
            required
            multiple
            item-value="name"
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
            item-text="name"
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
import { ENTITY_URL, CATEGORY_URL } from "../urls";
import router from "../router";

export default {
  name: "Grid",
  data: () => ({
    list: [],
    sources: [],
    categoryList: [],
    form1Valid: true,
    name: "",
    nameRules: [
      (v) => !!v || "Name is required",
      (v) => (v && v.length > 2) || "Name must be more than 2 characters",
    ],
    description: "",
    category: [],
    showError: null,
    snackbar: null,
    apiSuccess: "",
  }),
  created() {
    this.loadCategories();

    axios
      .get(ENTITY_URL)
      .then((results) => {
        this.list = results.data.data;
      })
      .catch((err) => {
        console.err(err);
      });
  },
  methods: {
    loadCategories() {
      axios
        .get(CATEGORY_URL)
        .then((result) => {
          console.log(result.data.data);
          this.categoryList = result.data.data;
        })
        .catch((err) => console.log(err));
    },

    saveForm() {
      this.showError = false;
      console.log("SAVING");

      let body = {
        name: this.name,
        categories: this.category,
        links: { entities: [], people: [] },
        attributes: [],
        status: "Active",
        description: this.description,
      };

      if (this.sources) {
        let sourceList = [];

        this.sources.forEach((item) => {
          sourceList.push({ id: item, role: "Source" });
        });

        body.links.entities = sourceList;
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
