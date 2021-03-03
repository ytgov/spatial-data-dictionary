<template>
  <div class="">
    <v-btn color="primary" class="float-right mt-0" to="/entity/create"
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
          hide-details
          v-model="searchFilter"
          @keyup="changeFilter"
        ></v-text-field>

        <v-switch
          label="Show Only Domain Tables"
          dense
          v-model="domainFilter"
          @change="changeFilter"
        ></v-switch>
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
          dense
          @change="changeFilter"
          v-model="locationFilter"
        ></v-select>
      </div>
    </div>

    <hr class="mb-3" />

    <div v-for="group of groupList" v-bind:key="group.id">
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
          <v-card
            class="mt-3"
            color="#fff2d5"
            :to="'/entity/' + item._id"
            style="height: 220px; overflow: hidden"
          >
            <v-card-title> {{ item.name }}</v-card-title>

            <v-card-text style="max-height: 110px; overflow: hidden">
              <!-- <strong>{{ item.location }}</strong
            ><br /> -->
              {{ item.attributes.length }} Attributes<br />{{
                item.links.people.length
              }}
              People
              <div class="mt-3">
                <status-chip :status="item.status"> </status-chip>
                <location-chip
                  :location="item.location.storage"
                ></location-chip>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ENTITY_URL, LOCATION_URL, PROGRAM_URL } from "../urls";
import _ from "lodash";

export default {
  name: "Grid",
  data: () => ({
    allEntities: [],
    filteredEntities: [],
    foundPrograms: [],
    programOptions: [],
    locationOptions: [],
    groupList: [],

    searchFilter: "",
    domainFilter: false,
    programFilter: [],
    locationFilter: [],
  }),
  created() {
    axios
      .get(ENTITY_URL)
      .then((results) => {
        this.allEntities = results.data.data;
        this.filteredEntities = results.data.data;
        this.makeGroups();
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
      let filteredList = _.cloneDeep(this.allEntities);

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

      if (this.searchFilter.length > 0) {
        let searchText = this.searchFilter.toLowerCase().trim();
        let toRemove = [];

        for (let entity of filteredList) {
          let nameTest = entity.name.toLowerCase();
          if (nameTest.indexOf(searchText) == -1) toRemove.push(entity);
        }

        for (let remove of toRemove) {
          let remIdx = filteredList.indexOf(remove);
          filteredList.splice(remIdx, 1);
        }
      }

      if (this.domainFilter) {
        console.log("FILTERING BY DOMAIN");
        let toRemove = [];

        for (let entity of filteredList) {
          if (!entity.is_domain) toRemove.push(entity);
        }

        for (let remove of toRemove) {
          let remIdx = filteredList.indexOf(remove);
          filteredList.splice(remIdx, 1);
        }
      }

      this.filteredEntities = filteredList;
      this.makeGroups();
    },
  },
};
</script>
