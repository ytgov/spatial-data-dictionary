<template>
  <v-chip class="mr-2" color="info">
    <v-icon left> {{ locationIcon }} </v-icon> {{ location }}
  </v-chip>
</template>

<script>
export default {
  name: "Locationhip",
  computed: {
    locationIcon() {
      if (this.location == "Web service") return "mdi-web";
      else if (this.location == "Database")
        return "mdi-database";
      else return "mdi-file";
    },
  },
  props: ["location"],
  data: () => ({}),
  created() {},
};
</script>
