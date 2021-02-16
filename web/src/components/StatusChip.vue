<template>
  <v-chip class="mr-2" :color="statusColor">
    <v-icon left> {{ statusIcon }} </v-icon> {{ status }}
  </v-chip>
</template>

<script>
export default {
  name: "StatusChip",
  computed: {
    statusIcon() {
      if (this.status == "Draft") return "mdi-file-document-edit-outline";
      else if (this.status == "Archived") return "mdi-archive-outline";
      else return "mdi-check";
    },
    statusColor() {
      if (this.status == "Draft") return "warning";
      else if (this.status == "Archived") return "error";
      else return "success";
    },
  },
  props: ["status"],
  data: () => ({}),
  created() {},
};
</script>
