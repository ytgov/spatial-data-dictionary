<template>
  <div class="">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[
        { text: 'Dashboard', href: '/dashboard' },
        { text: 'Query Builder' },
      ]"
    ></v-breadcrumbs>

    <h1>Query Builder</h1>
    <hr class="mb-3" />

    <div class="row mt-5" style="clear: both">
      <div class="col-md-4">
        <h3>Available Entities</h3>
        <!-- <v-card class="" color="#fff2d5"> -->
        <v-treeview
          dense
          :items="entityTree"
          v-model="selected"
          @input="treeChange"
          selectable
        ></v-treeview>
        <!-- </v-card> -->
      </div>
      <div class="col-md-8">
        <h3>Generated SQL Statement</h3>
        <div style="font-family: consolas !important; font-size: 0.8rem">
          <pre
            style="
              padding: 10px;
              background-color: #bbb;
              border-radius: 4px;
              border: 1px #666 solid;
            "
            >{{ queryText }}</pre
          >
        </div>

        <!-- <v-textarea style=";"
          rows="20"
          v-model="queryText"
          dense
          outlined
          background-color="#bbb"
        ></v-textarea> -->
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import { ENTITY_URL } from "../urls";

export default {
  name: "QueryBuilder",
  data: () => ({
    queryText: "",
    entities: [],
    entityTree: [],
    selected: [],
  }),
  created() {
    this.loadEntities();
  },
  methods: {
    loadEntities() {
      axios
        .get(ENTITY_URL)
        .then((results) => {
          this.entities = results.data.data;
          this.buildTree();
        })
        .catch((err) => {
          console.err(err);
        });
    },

    buildTree() {
      this.entityTree = [];
      let locations = _.uniq(this.entities.map((e) => e.location.name));

      for (let loc of locations) {
        let tree = { id: loc, name: loc, children: [] };
        let ents = this.entities.filter((e) => e.location.name == loc);

        for (let ent of ents) {
          let mid = { id: ent._id, name: ent.name, children: [] };

          mid.children = ent.attributes.map((a) => {
            return { id: `${ent.name}.${a.name}`, name: a.name };
          });

          tree.children.push(mid);
        }

        this.entityTree.push(tree);
        this.treeChange();
      }
    },
    treeChange() {
      let tables = _.uniq(
        this.selected.map((a) => {
          return a.substring(0, a.indexOf("."));
        })
      );

      if (this.selected.length == 0) {
        this.queryText = "Choose Locations, Tables and Attibutes to the right";
        return;
      }

      this.queryText =
        "SELECT\n    " +
        this.selected.join(", \n    ") +
        "\nFROM " +
        tables.join(", ");

      if (tables.length > 1) {
        let base = tables[0];

        this.queryText += "\nWHERE";

        for (let i = 1; i < tables.length; i++) {
          this.queryText += `\n    ${base}.<KEYFIELD> = ${tables[i]}.<FOREIGNKEY> AND `;
        }

        this.queryText = this.queryText.substring(0, this.queryText.length - 5);
      }
    },
  },
};
</script>
