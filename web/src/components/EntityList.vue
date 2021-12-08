<template>
  <div class="">
    <v-breadcrumbs
      class="pl-0"
      divider="/"
      :items="[
        { text: 'Dashboard', to: '/dashboard', exact: true },
        { text: 'Entities', exact: true },
      ]"
    ></v-breadcrumbs>

    <v-btn
      color="primary"
      class="float-right mt-0"
      to="/entity/create"
      v-if="canEdit"
      ><v-icon>mdi-plus</v-icon> Create</v-btn
    >
    <h1>Entities</h1>
    <hr class="mb-3" />

    <div class="row">
      <div class="col-md-6">
        <v-text-field
          label="Search"
          outlined
          dense
          v-model="searchFilter"
          @keyup="changeFilter"
        ></v-text-field>

        <v-row>
          <v-col class="py-0">
            <v-select
              :items="typeOptions"
              label="Entity type"
              multiple
              outlined
              clearable
              dense
              @change="changeFilter"
              v-model="typeFilter"
              hide-details
            >
              <template v-slot:prepend-item>
                <v-list-item ripple @click="toggleTypeFilters">
                  <v-list-item-action>
                    <v-icon :color="typeFilter.length > 0 ? 'primary' : ''">
                      {{ typeFilterIcon }}
                    </v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title> Select All </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider class="mt-2"></v-divider>
              </template> </v-select
          ></v-col>
          <v-col class="py-0">
            <v-select
              dense
              outlined
              hide-details
              label="Status"
              :items="['Draft', 'Complete', 'Archived']"
              v-model="statusFilter"
              @change="changeFilter"
              multiple
              clearable
            >
            </v-select
          ></v-col>
        </v-row>
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
        >
          <template v-slot:prepend-item>
            <v-list-item ripple @click="toggleProgramFilters">
              <v-list-item-action>
                <v-icon :color="programFilter.length > 0 ? 'primary' : ''">
                  {{ programFilterIcon }}
                </v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title> Select All </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider class="mt-2"></v-divider>
          </template>
        </v-select>
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
          hide-details
        >
          <template v-slot:prepend-item>
            <v-list-item ripple @click="toggleLocationFilters">
              <v-list-item-action>
                <v-icon :color="locationFilter.length > 0 ? 'primary' : ''">
                  {{ locationFilterIcon }}
                </v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title> Select All </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider class="mt-2"></v-divider>
          </template>
        </v-select>
      </div>
    </div>

    <div class="float-right">
      <v-switch
        class="mt-0 mb-3"
        v-model="cardView"
        label="Table view"
        prepend-icon="mdi-view-module"
        hide-details
        @change="changeFilter"
      ></v-switch>
    </div>
    <v-divider class="mb-0" style="clear: both"></v-divider>
    <v-progress-linear
      class="mt-0"
      :active="isLoading"
      indeterminate
      dark
    ></v-progress-linear>

    <div v-if="!cardView">
      <div v-for="group of groupList" v-bind:key="group.id" class="mt-3">
        <h2 class="mb-1">
          <v-icon class="mr-3" color="#323232">mdi-select-group</v-icon>
          {{ group.name }}
        </h2>

        <div class="row">
          <div
            class="col-12 col-sm-6"
            v-for="item of group.entities"
            v-bind:key="item.id"
          >
            <v-card class="mt-3" color="#fff2d5" :to="'/entity/' + item._id">
              <v-card-subtitle class="mb-0 pb-0">{{
                item.location.name
              }}</v-card-subtitle>
              <v-card-title
                class="mt-0 pt-0 pb-1"
                style="border-bottom: 1px #bbb solid"
              >
                {{ item.name }}</v-card-title
              >

              <v-card-subtitle class="mt-3 pb-0">CONNECTIONS</v-card-subtitle>
              <v-card-text style="overflow: hidden">
                <div class="row">
                  <div class="col-sm-6">
                    <div class="mr-4" style="font-size: 32px; float: left">
                      {{ item.attributes.length }}
                    </div>
                    Attributes
                  </div>
                  <div class="col-sm-6">
                    <div class="mr-4" style="font-size: 32px; float: left">
                      {{ item.links.people.length }}
                    </div>
                    People
                  </div>
                </div>

                <div class="mt-3"></div>
              </v-card-text>

              <v-card-actions style="display: block; height: 92px">
                <div class="mb-3" style="height: 32px; overflow: hidden">
                  <div class="mb-3">
                    <v-chip
                      class="mr-2"
                      v-for="tag of item.tags"
                      v-bind:key="tag"
                      link
                      :to="'/tags/' + tag"
                    >
                      <v-icon left> mdi-tag </v-icon>{{ tag }}
                    </v-chip>
                  </div>
                </div>

                <div style="height: 32px; overflow: hidden">
                  <status-chip :status="item.status"> </status-chip>
                  <location-chip :location="item.location.type"></location-chip>
                  <entity-type-chip :type="item.entity_type"></entity-type-chip>
                </div>
              </v-card-actions>
            </v-card>
          </div>
        </div>
      </div>
    </div>
    <div v-if="cardView">
      <v-data-table
        :items="filteredEntities"
        :headers="[
          { value: 'name', text: 'Entity' },
          { value: 'location', text: 'Location' },
          { value: 'program', text: 'Program' },
          { value: 'entity_type', text: 'Type' },
          { value: 'status', text: 'Status' },
        ]"
        dense
        :footer-props="{ 'items-per-page-options': [20, 50, 100, -1] }"
        @click:row="(item) => $router.push(`/entity/${item._id}`)"
      >
        <template v-slot:item.location="{ item }">
          {{ item.location.name }} ({{ item.location.type }})
        </template>
        <template v-slot:item.program="{ item }">
          {{ item.links.programs.map((p) => p.name).join(", ") }}
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import store from "../store";
import { ENTITY_URL, LOCATION_URL, PROGRAM_URL } from "../urls";
import _ from "lodash";

export default {
  name: "Grid",
  computed: {
    roles: function () {
      return store.getters.roles;
    },
    typeFilterIcon: function () {
      if (this.typeFilter.length == this.typeOptions.length)
        return "mdi-close-box";
      return "mdi-checkbox-blank-outline";
    },
    programFilterIcon: function () {
      if (this.programFilter.length == this.programOptions.length)
        return "mdi-close-box";
      return "mdi-checkbox-blank-outline";
    },
    locationFilterIcon: function () {
      if (this.locationFilter.length == this.locationOptions.length)
        return "mdi-close-box";
      return "mdi-checkbox-blank-outline";
    },
  },
  data: () => ({
    allEntities: [],
    filteredEntities: [],
    foundPrograms: [],
    programOptions: [],
    locationOptions: [],
    typeOptions: [
      "Domain table",
      "Feature class",
      "Table",
      "View",
      "Web service",
    ],
    groupList: [],

    searchFilter: "",
    domainFilter: false,
    programFilter: [],
    locationFilter: [],
    typeFilter: [],
    statusFilter: [],
    isLoading: false,
    canEdit: false,
    cardView: true,
  }),
  created() {
    this.canEdit =
      this.roles.indexOf("Writer") >= 0 || this.roles.indexOf("Admin") >= 0;

    this.isLoading = true;

    let prefs = store.getters.entityPreferences;
    this.cardView = prefs.cardView || false;
    this.searchFilter = prefs.searchFilter || [];
    this.programFilter = prefs.programFilter || [];
    this.locationFilter = prefs.locationFilter || [];
    this.typeFilter = prefs.typeFilter || [];
    this.statusFilter = prefs.statusFilter || [];

    axios
      .get(ENTITY_URL)
      .then((results) => {
        this.allEntities = results.data.data;
        this.filteredEntities = results.data.data;

        let parameters = this.$route.query;

        if (parameters.location) {
          this.locationFilter.push(parameters.location);
        }

        if (parameters.program) {
          this.programFilter.push(parameters.program);
        }

        this.changeFilter();
        this.makeGroups();
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        this.isLoading = false;
      });

    axios
      .get(PROGRAM_URL)
      .then((results) => {
        this.programOptions = results.data.data;
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
  },
  methods: {
    makeGroups() {
      this.foundPrograms = this.filteredEntities.flatMap(
        (e) => e.links.programs
      );

      let groups = new Array();

      for (let program of this.foundPrograms) {
        let groupMatch = groups.filter((g) => g.id == program.id);

        if (groupMatch.length == 0) {
          let group = {
            name: program.name,
            id: program.id,
            entities: new Array(),
          };

          for (let entity of this.filteredEntities) {
            for (let prog of entity.links.programs) {
              if (prog.id == group.id) group.entities.push(entity);
            }
          }

          if (this.programFilter.length > 0) {
            if (this.programFilter.indexOf(group.id) >= 0) groups.push(group);
          } else {
            groups.push(group);
          }
        }
      }

      this.groupList = groups;
    },

    changeFilter() {
      store.dispatch("setEntityPreferences", {
        locationFilter: this.locationFilter,
        programFilter: this.programFilter,
        typeFilter: this.typeFilter,
        searchFilter: this.searchFilter,
        cardView: this.cardView,
        statusFilter: this.statusFilter,
      });

      let filteredList = _.cloneDeep(this.allEntities);

      if (this.statusFilter.length > 0) {
        let toRemove = [];

        for (let entity of filteredList) {
          if (this.statusFilter.indexOf(entity.status) == -1) {
            toRemove.push(entity);
          }
        }

        for (let remove of toRemove) {
          let remIdx = filteredList.indexOf(remove);
          filteredList.splice(remIdx, 1);
        }
      }

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

      if (this.programFilter.length > 0) {
        let toRemove = [];

        for (let entity of filteredList) {
          let progs = entity.links.programs.map((p) => p.id);
          let hasMatch = false;

          for (let p of progs) {
            if (this.programFilter.indexOf(p) >= 0) {
              hasMatch = true;
            }
          }

          if (!hasMatch) toRemove.push(entity);
        }

        for (let remove of toRemove) {
          let remIdx = filteredList.indexOf(remove);
          filteredList.splice(remIdx, 1);
        }
      }

      if (this.typeFilter.length > 0) {
        let toRemove = [];
        //let includeDomains = this.typeFilter.indexOf("Domain table") >= 0;

        for (let entity of filteredList) {
          //if (entity.is_domain && includeDomains) continue;

          if (this.typeFilter.indexOf(entity.entity_type) == -1) {
            toRemove.push(entity);
          }
        }

        for (let remove of toRemove) {
          let remIdx = filteredList.indexOf(remove);
          filteredList.splice(remIdx, 1);
        }
      }

      if (this.searchFilter.length > 0) {
        let searchText = this.searchFilter.toLowerCase().trim();
        let toRemove = [];

        for (let entity of filteredList) {
          let nameTest = entity.name.toLowerCase();
          let tags = "";

          if (entity.tags) {
            tags = entity.tags.reduce((t, i) => {
              return t + " " + i.toLowerCase();
            }, "");
          }

          if (
            nameTest.indexOf(searchText) == -1 &&
            tags.indexOf(searchText) == -1
          )
            toRemove.push(entity);
        }

        for (let remove of toRemove) {
          let remIdx = filteredList.indexOf(remove);
          filteredList.splice(remIdx, 1);
        }
      }

      this.filteredEntities = filteredList;
      this.makeGroups();
    },

    toggleTypeFilters() {
      this.$nextTick(() => {
        if (this.typeFilter.length == this.typeOptions.length) {
          this.typeFilter = [];
        } else {
          this.typeFilter = this.typeOptions.slice();
        }
      });
    },
    toggleProgramFilters() {
      this.$nextTick(() => {
        if (this.programFilter.length == this.programOptions.length) {
          this.programFilter = [];
        } else {
          this.programFilter = this.programOptions.slice();
        }
      });
    },
    toggleLocationFilters() {
      this.$nextTick(() => {
        if (this.locationFilter.length == this.locationOptions.length) {
          this.locationFilter = [];
        } else {
          this.locationFilter = this.locationOptions.slice();
        }
      });
    },
  },
};
</script>
