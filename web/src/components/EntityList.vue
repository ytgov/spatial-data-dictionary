<template>
  <div class="">
    <h1>Entities</h1>
    <hr class="mb-3" />

    <h2 class="mb-1">
      <v-icon class="mr-3" color="#323232">mdi-file-cabinet</v-icon> Surface
      Management
    </h2>

    <div class="row">
      <div class="col-3">
        <v-card class="mt-5" color="#fff2d5">
          <v-card-title>Rehabilitation</v-card-title>

          <v-card-text> 12 Attributes<br>30 Properties 
          
          </v-card-text>

          <v-card-actions style="background-color: rgb(241, 241, 241); border-top: thin solid rgba(0, 0, 0, .12) !important" dense>
            <v-btn small color="info" icon outlined to="/entity/12"><v-icon>mdi-link-variant</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </div>

    <h2 class="mt-3">
      <v-icon class="mr-3" color="#323232">mdi-file-cabinet</v-icon> Culverts
    </h2>
  </div>
</template>

<script>
export default {
  name: "Grid",
  data: () => ({}),

  methods: {},
};
</script>
