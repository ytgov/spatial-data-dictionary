db = db.getSiblingDB('SDD'); // we can not use "use" statement here to switch db

db.createUser(
    {
        user: "SDD_USER",
        pwd: "password",
        roles: [{ role: "readWrite", db: "SDD" }],
        passwordDigestor: "server",
    }
)