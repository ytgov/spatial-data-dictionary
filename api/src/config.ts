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

/* export const VIVVO_CONFIG = {
  issuer: 'https://c1dev.vivvocloud.com.com/',
  authorizationURL: 'https://c1dev.vivvocloud.com/oauth2/auth',
  tokenURL: 'https://c1dev.vivvocloud.com/oauth2/token',
  userInfoURL: 'https://c1dev.vivvocloud.com/userinfo',
  clientID: process.env.VIVVO_CLIENT_ID || "",
  clientSecret: process.env.VIVVO_CLIENT_SECRET || "",
  callbackURL: process.env.VIVVO_CALLBACK_URL || "",
  scope: 'profile email phone address'
} */

export const MONGO_USER = process.env.MONGO_USER || "admin";
export const MONGO_PASS = process.env.MONGO_PASS || "password";
export const MONGO_HOST = process.env.MONGO_HOST || "localhost";
export const MONGO_PORT = process.env.MONGO_PORT || "27017";
export const MONGO_DB = process.env.MONGO_DB || "SDD";

export const MONGO_URL = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`

export const USE_LOCAL_AUTH = process.env.USE_LOCAL_AUTH == "true";

export const MAIL_FROM = process.env.MAIL_FROM || "test@yukon.ca";
export const MAIL_HOST = process.env.MAIL_HOST || "smtp.gov.yk.ca";
export const MAIL_PORT = process.env.MAIL_PORT || 587;
export const MAIL_USER = process.env.MAIL_USER || "";
export const MAIL_PASS = process.env.MAIL_PASS || "";

export const MAIL_CONFIG = {
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  }
};

export const APPLICATION_NAME = process.env.APPLICATION_NAME || "Spatial Data Dictionary";
