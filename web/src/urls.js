
import * as config from "./config";

export const LOGIN_URL = `${config.apiBaseUrl}/api/user/login`;
export const AUTH_CHECK_URL = `${config.apiBaseUrl}/api/user/isAuthenticated`;
export const LOGOUT_URL = `${config.apiBaseUrl}/api/user/logout`;
export const PROFILE_URL = `${config.apiBaseUrl}/api/user`;