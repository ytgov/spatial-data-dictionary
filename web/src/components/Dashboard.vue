<template>
  <div class="home">
    <h1>Dashboard</h1>

    <v-card class="mt-5" color="#fff2d5">
      <v-card-title>Upcoming Changes</v-card-title>
      <v-card-text>This is the body of the text</v-card-text>
    </v-card>

    <div class="row">
      <div class="col-md-6">
        <v-card class="mt-5" color="#fff2d5">
          <v-card-title>Open Change Requests</v-card-title>
          <v-card-text>This is the body of the text</v-card-text>
        </v-card>
      </div>
      <div class="col-md-6">
        <v-card class="mt-5" color="#fff2d5">
          <v-card-title>Draft Entities</v-card-title>
          <v-card-text>This is the body of the text</v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  data: () => ({})
};
</script>
