<template>
  <div>
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[{ text: 'Dashboard', href: '/dashboard' }, { text: 'Changes' }]"
    ></v-breadcrumbs>
    <h1>Changes</h1>

    <hr class="mb-1" />

    <div class="row">
      <div class="col-md-6">
        <v-text-field
          label="Search"
          outlined
          dense
          v-model="searchFilter"
          @keyup="changeFilter"
        ></v-text-field>

        <v-select
          :items="['Open', 'In progress', 'Complete', 'Won\'t fix']"
          label="Status"
          multiple
          outlined
          clearable
          dense
          @change="changeFilter"
          v-model="typeFilter"
        ></v-select>

        <!--  <v-switch
          label="Show Only Domain Tables"
          dense
          v-model="domainFilter"
          @change="changeFilter"
        ></v-switch> -->
      </div>
      <div class="col-md-6">
        <v-select
          :items="programOptions"
          item-text="name"
          item-value="_id"
          label="Programs"
          multiple
          outlined
          clearable
          dense
          @change="changeFilter"
          v-model="programFilter"
        ></v-select>
        <v-select
          :items="locationOptions"
          item-text="name"
          item-value="_id"
          label="Locations"
          multiple
          outlined
          clearable
          dense
          @change="changeFilter"
          v-model="locationFilter"
        ></v-select>
      </div>
    </div>

    <hr class="mb-3" />

    <div class="row">
      <div class="col-md-12">
        <v-card class="" color="#fff2d5">
          <v-data-table
            :items="filteredList"
            :search="searchFilter"
            :headers="[
              { text: 'Date', value: 'complete_date' },
              { text: 'Status', value: 'status' },
              { text: 'Entity', value: 'entity.name' },
              { text: 'Location', value: 'entity.location.name' },
              { text: 'Change title', value: 'title' },
              { text: 'Reason', value: 'reason' },
              { text: 'Assigned to', value: 'assigned_user' },
            ]"
            @click:row="changeClick"
            :sort-by="['complete_date']"
            :sort-desc="['true']"
          >
          </v-data-table>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ENTITY_URL, PROGRAM_URL, LOCATION_URL } from "../urls";
import _ from "lodash";
import router from "../router";

export default {
  name: "Form",
  data: () => ({
    changes: [],
    filteredList: [],

    programOptions: [],
    locationOptions: [],

    searchFilter: "",
    typeFilter: [],
    programFilter: [],
    locationFilter: [],
  }),
  computed: {},
  created() {
    this.loadChanges(this.entity_id);
    this.loadPrograms();
    this.loadLocations();
  },
  methods: {
    loadChanges() {
      axios
        .get(`${ENTITY_URL}/changes`)
        .then((result) => {
          this.changes = result.data.data;
          this.changeFilter();
        })
        .catch((err) => {
          console.log(err);
        });
    },

    loadPrograms() {
      axios
        .get(PROGRAM_URL)
        .then((results) => {
          this.programOptions = results.data.data;
        })
        .catch((err) => {
          console.err(err);
        });
    },
    loadLocations() {
      axios
        .get(LOCATION_URL)
        .then((results) => {
          this.locationOptions = results.data.data;
        })
        .catch((err) => {
          console.err(err);
        });
    },

    changeClick(item) {
      this.changeItem = _.clone(item);
      this.changeDialogOpen = true;
      router.push(`/entity/${item.entity_id}/changes/${item._id}`);
    },

    changeFilter() {
      let filteredList = _.cloneDeep(this.changes);

      if (this.locationFilter.length > 0) {
        let toRemove = [];

        for (let entity of filteredList) {
          let locId = entity.location.id;

          if (this.locationFilter.indexOf(locId) == -1) {
            toRemove.push(entity);
          }
        }

        for (let remove of toRemove) {
          let remIdx = filteredList.indexOf(remove);
          filteredList.splice(remIdx, 1);
        }
      }

      if (this.typeFilter.length > 0) {
        let toRemove = [];

        for (let entity of filteredList) {
          let status = entity.status;

          if (this.typeFilter.indexOf(status) == -1) {
            toRemove.push(entity);
          }
        }

        for (let remove of toRemove) {
          let remIdx = filteredList.indexOf(remove);
          filteredList.splice(remIdx, 1);
        }
      }

      if (this.programFilter.length > 0) {
        let toRemove = [];

        for (let change of filteredList) {
          let idList = change.programs.map((p) => p.id);

          let match = false;

          for (let p of this.programFilter) {
            if (idList.indexOf(p) >= 0) match = true;
          }

          if (!match) {
            toRemove.push(change);
          }
        }

        for (let remove of toRemove) {
          let remIdx = filteredList.indexOf(remove);
          filteredList.splice(remIdx, 1);
        }
      }

      this.filteredList = filteredList;
    },
  },
};
</script>
