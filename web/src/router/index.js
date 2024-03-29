import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../components/Home.vue";
import Dashboard from "../components/Dashboard.vue";
import NotFound from "../views/NotFound.vue";
import Login from "../components/Login";
import LoginComplete from "../components/LoginComplete";
import Profile from "../components/Profile";
import CategoryList from "../components/CategoryList";
import EntityList from "../components/EntityList";
import EntityDetail from "../components/EntityDetail";
import EntityPrint from "../components/EntityPrint";
import EntityCreate from "../components/EntityCreate";
import EntityEdit from "../components/EntityEdit";
import Locations from "../views/Locations";
import Programs from "../views/Programs";
import People from "../views/People";
import EntityMap from "../views/EntityMap";
import EntityChangeRequest from "../views/EntityChangeRequest";
import EntityChangeRequestDetail from "../views/EntityChangeRequestDetail";
import EntityChangeList from "../views/EntityChangeList";
import EntityChangeDetail from "../views/EntityChangeDetail";
import ChangeList from "../views/ChangeList";
import Search from "../views/Search";
import QueryBuilder from "../views/QueryBuilder";
import AuthLocal from "../views/AuthLocal";

import store from "../store";

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
      requiresAuth: true
    }
  },
  {
    path: "/categories",
    name: "Categories",
    component: CategoryList,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/entity",
    name: "Entities",
    component: EntityList,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/entity/create",
    name: "EntityCreate",
    component: EntityCreate,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/entity/:id",
    name: "Entity detail",
    component: EntityDetail,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/entity/:id/edit",
    name: "Entity attributes",
    component: EntityEdit,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/entity/:id/map",
    name: "Entity map",
    component: EntityMap,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/entity/:id/print",
    name: "Entity print",
    component: EntityPrint,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/entity/:id/change-request",
    name: "Entity change request",
    component: EntityChangeRequest,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/entity/:id/change-request/:changeRequestId",
    name: "EntityChangeRequestDetail",
    component: EntityChangeRequestDetail,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/entity/:id/changes",
    name: "Entity change list",
    component: EntityChangeList,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/entity/:id/changes/:changeId",
    name: "Entity change",
    component: EntityChangeDetail,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/location",
    name: "Locations",
    component: Locations,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/program",
    name: "Programs",
    component: Programs,
    meta: {
      requiresAuth: true
    }
  },
  /* {
    path: "/domain",
    name: "Domains",
    component: Domains,
    meta: {
      //requiresAuth: true
    }
  }, */
  {
    path: "/people",
    name: "People",
    component: People,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/change",
    name: "ChangeList",
    component: ChangeList,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/search",
    name: "Search",
    component: Search,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/query-builder",
    name: "QueryBuilder",
    component: QueryBuilder,
    meta: {
      requiresAuth: true
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
      requiresAuth: true
    }
  },
  {
    path: "/sign-in-local",
    name: "AuthLocal",
    component: AuthLocal,
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

  await store.dispatch("checkAuthentication");
  var isAuthenticated = store.getters.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    console.log("You aren't authenticatd, redirecting to sign-in");
    next("/sign-in");
    return;
  }

  return next();
});

export default router;
