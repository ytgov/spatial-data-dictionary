
import * as config from "./config";

export const LOGIN_URL = `${config.apiBaseUrl}/api/auth/login`;
export const AUTH_CHECK_URL = `${config.apiBaseUrl}/api/auth/isAuthenticated`;
export const LOGOUT_URL = `${config.apiBaseUrl}/api/auth/logout`;
export const PROFILE_URL = `${config.apiBaseUrl}/api/user/me`;

export const ENTITY_URL = `${config.apiBaseUrl}/api/entity`;
export const CATEGORY_URL = `${config.apiBaseUrl}/api/category`;
export const LOCATION_URL = `${config.apiBaseUrl}/api/location`;
export const PROGRAM_URL = `${config.apiBaseUrl}/api/program`;
export const DOMAIN_URL = `${config.apiBaseUrl}/api/domain`;