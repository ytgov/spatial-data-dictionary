<template>
  <div class="hello">
    <h1>{{ title }}</h1>
    <h3>Please use your YNET credentials to sign in</h3>
    <p>
      The authentication for this application is managed by an authentication
      partner. When you click the button below, you will be redirected to their
      site and once authenticated, back here.
    </p>
    <p>
      If you have already authenticated and your session is still active, it may
      skip the sign in process and return you here immediately.
    </p>

    <a class="v-btn primary v-size--default" :href="loginLink"
      >Click here to sign in</a
    >
  </div>
</template>

<script>
import * as config from "../config";
import router from "../router";
import store from "../store";

export default {
  name: "Login",
  data: () => ({
    loginLink: `${config.apiBaseUrl}/api/auth/login`,
    title: `Sign in to ${config.applicationName}`,
  }),
  async created() {
    await store.dispatch("checkAuthentication");
    var isAuthenticated = store.getters.isAuthenticated;

    if (isAuthenticated) {
      router.push("/");
    }

    console.log(config.apiBaseUrl);
  },
};
</script>
