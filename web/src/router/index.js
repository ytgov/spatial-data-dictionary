import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../components/Home.vue";
import Dashboard from "../components/Dashboard.vue";
import NotFound from "../views/NotFound.vue";
import Form from "../components/Form";
import Login from "../components/Login";
import LoginComplete from "../components/LoginComplete";
import Profile from "../components/Profile";
import CategoryList from "../components/CategoryList";
import EntityList from "../components/EntityList";
import EntityDetail from "../components/EntityDetail";
import EntityCreate from "../components/EntityCreate";
import EntityEdit from "../components/EntityEdit";
//import store from "../store";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      //requiresAuth: true
    }
  },
  {
    path: "/form",
    name: "Basic Form",
    component: Form,
    meta: {
      //requiresAuth: true
    }
  },
  {
    path: "/categories",
    name: "Categories",
    component: CategoryList,
    meta: {
      //requiresAuth: true
    }
  },
  {
    path: "/entity",
    name: "Entities",
    component: EntityList,
    meta: {
      //requiresAuth: true
    }
  },
  {
    path: "/entity/create",
    name: "EntityCreate",
    component: EntityCreate,
    meta: {
      //requiresAuth: true
    }
  },
  {
    path: "/entity/:id",
    name: "Entity detail",
    component: EntityDetail,
    meta: {
      //requiresAuth: true
    }
  },
  {
    path: "/entity/:id/edit",
    name: "Entity attriutes",
    component: EntityEdit,
    meta: {
      //requiresAuth: true
    }
  },
  {
    path: "/sign-in",
    name: "Login",
    component: Login
  },
  {
    path: "/login-complete",
    name: "LoginComplete",
    component: LoginComplete
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: {
      //requiresAuth: true
    }
  },
  {
    path: "*",
    name: "Not Found",
    component: NotFound
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  var requiresAuth = to.meta.requiresAuth || false;

  if (!requiresAuth) {
    return next();
  }

  /* await store.dispatch("checkAuthentication");
  var isAuthenticated = store.getters.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    console.log("You aren't authenticatd, redirecting to sign-in")
    next("/sign-in");
    return;
  } */

  return next();
});

export default router;
