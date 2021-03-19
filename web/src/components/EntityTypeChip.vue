<template>
  <v-chip class="mr-2" dark color="#dc4405">
    <v-icon left> {{ icon }} </v-icon> {{ type }}
  </v-chip>
</template>

<script>
export default {
  name: "TypeChip",
  computed: {
    icon() {
      if (this.type == "Web service") return "mdi-web-box";
      else if (this.type == "Table") return "mdi-table";
      else if (this.type == "View") return "mdi-database-search";
      else return "mdi-file"; // feature class
    },
  },
  props: ["type"],
  data: () => ({}),
  created() {},
};
</script>
