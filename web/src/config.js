export const applicationName = "Spatial Data Dictionary";
export const applicationIcon = "mdi-cash-register";
export const hasSidebar = true;
export const hasSidebarClosable = false;

export const sections = [
    {
        name: "Dashboard",
        url: "/",
        icon: "mdi-view-dashboard"
    },
    {
        name: "Entities",
        url: "/form",
        icon: "mdi-database-marker"
    },
    {
        name: "Attributes",
        url: "/grid",
        icon: "mdi-table-large"
    }
];
export const environment = process.env.NODE_ENV;
export const apiBaseUrl = process.env.NODE_ENV == "production" ? "" : "http://localhost:3000";
