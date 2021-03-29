<template>
  <div class="home">
    <h1>Sign in</h1>

    <div class="row">
      <div class="col-md-6">
        <v-card class="mt-5" color="#fff2d5">
          <v-card-title>Enter your local credentials (not YNET)</v-card-title>
          <v-card-text>
            <v-text-field
              dense
              outlined
              background-color="white"
              v-model="username"
              label="Username"
              @keydown="checkEnter"
            ></v-text-field>
            <v-text-field
              dense
              outlined
              background-color="white"
              v-model="password"
              label="Password"
              type="password"
              @keydown="checkEnter"
            ></v-text-field>

            <v-btn color="primary" @click="signIn">Sign in</v-btn>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import { LOGIN_URL } from "../urls";
import axios from "axios";
import router from "../router";

export default {
  name: "Home",
  data: () => ({
    username: "",
    password: "",
  }),
  methods: {
    checkEnter(event) {
      if (event.code == "Enter") {
        this.signIn();
      }
    },
    signIn() {
      let username = this.username.trim();
      let password = this.password.trim();

      if (!username || !password) {
        this.$refs.notifier.showError(
          "Username and Password are both required"
        );
        return;
      }

      axios
        .post(LOGIN_URL, { username, password })
        .then((resp) => {
          this.$refs.notifier.showAPIMessages(resp.data);

          if (!resp.data.errors) {
            if (
              resp.data.data.username &&
              resp.data.data.username == this.username
            ) {
              router.push("/dashboard");
            }
          }
        })
        .catch((error) => {
          this.$refs.notifier.showError(error);
        });
    },
  },
};
</script>
