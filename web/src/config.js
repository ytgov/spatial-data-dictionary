export const applicationName = "Spatial Data Dictionary";
export const applicationIcon = "mdi-cash-register";
export const hasSidebar = true;
export const hasSidebarClosable = false;

export const sections = [
    {
        name: "Dashboard",
        url: "/dashboard",
        icon: "mdi-view-dashboard"
    },
/*     {
        name: "Categories",
        url: "/categories",
        icon: "mdi-file-cabinet"
    }, */
    {
        name: "Entities",
        url: "/entity",
        icon: "mdi-database-marker"
    },/* 
    {
        name: "Domains",
        url: "/domain",
        icon: "mdi-format-list-text"
    }, */
    {
        name: "Locations",
        url: "/location",
        icon: "mdi-file-cabinet"
    },
    {
        name: "Programs",
        url: "/program",
        icon: "mdi-select-group"
    },
    {
        name: "People",
        url: "/people",
        icon: "mdi-account-group"
    },
    {
        name: "Changes",
        url: "/change",
        icon: "mdi-hammer-wrench"
    },
    {
        name: "Query Builder",
        url: "/query-builder",
        icon: "mdi-database-edit"
    }
];
export const environment = process.env.NODE_ENV;
export const apiBaseUrl = process.env.NODE_ENV == "production" ? "" : "http://localhost:3000";
