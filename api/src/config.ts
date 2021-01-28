import * as dotenv from "dotenv";

let path;
switch (process.env.NODE_ENV) {
  case "test":
    path = `.env.test`;
    break;
  case "production":
    path = `.env.production`;
    break;
  default:
    path = `.env.development`;
}
dotenv.config({ path: path });

console.log("LOADING CONFIG:", path)

export const API_PORT = process.env.API_PORT || "3000";
export const FRONTEND_URL = process.env.FRONTEND_URL || "";
export const NODE_ENV = process.env.NODE_ENV;

export const AUTH_REDIRECT = process.env.AUTH_REDIRECT || "";

export const VIVVO_CONFIG = {
  issuer: 'https://yukon.vivvocloud.com/',
  authorizationURL: 'https://yukon.vivvocloud.com/oauth/v2/authorize',
  tokenURL: 'https://yukon.vivvocloud.com/oauth/v2/token',
  userInfoURL: 'https://yukon.vivvocloud.com/oauth/v2/userinfo',
  clientID: process.env.VIVVO_CLIENT_ID || "",
  clientSecret: process.env.VIVVO_CLIENT_SECRET || "",
  callbackURL: process.env.VIVVO_CALLBACK_URL || "",
  scope: 'openid profile email phone address'
}
 
export const DB_NAME = process.env.DB_NAME || "";
export const DB_USER = process.env.DB_USER || "";
export const DB_PASS = process.env.DB_PASS || "";
export const DB_HOST = process.env.DB_HOST || "";
export const DB_PORT = process.env.DB_PORT || "1433";

export const DB_CONFIG = {
  client: "mssql", connection: { host: DB_HOST, user: DB_USER, password: DB_PASS, database: DB_NAME, port: parseInt(DB_PORT) }
};
