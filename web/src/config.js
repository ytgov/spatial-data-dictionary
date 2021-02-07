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
    {
        name: "Categories",
        url: "/categories",
        icon: "mdi-file-cabinet"
    },
    {
        name: "Entities",
        url: "/entities",
        icon: "mdi-database-marker"
    },
    {
        name: "Domains",
        url: "/domain",
        icon: "mdi-format-list-text"
    }
];
export const environment = process.env.NODE_ENV;
export const apiBaseUrl = process.env.NODE_ENV == "production" ? "" : "http://localhost:3000";
