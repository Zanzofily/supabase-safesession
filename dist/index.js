"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AuthManager: () => auth_server_default
});
module.exports = __toCommonJS(src_exports);

// src/auth.server.ts
var import_headers = require("next/headers");
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var AuthManager = class {
  /**
   * Initializes the authentication manager with necessary dependencies.
   * @param supabase An instance of @supabase/ssr client
   * @param jwtSecret The secret used to verify JWTs.
   */
  constructor(supabase, jwtSecret) {
    this.supabase = supabase;
    this.jwtSecret = jwtSecret;
  }
  /**
   * Retrieves authentication tokens from cookies.
   * @returns {AuthTokens | null} AuthTokens if found and correctly parsed, null otherwise.
   */
  getAuthTokensFromCookies() {
    const cookieNameRegex = /^sb-[a-z]+-auth-token$/;
    const authCookie = (0, import_headers.cookies)().getAll().find((cookie) => cookieNameRegex.test(cookie.name));
    if (!authCookie) {
      return null;
    }
    try {
      const session = JSON.parse(decodeURIComponent(authCookie.value));
      return {
        access_token: session.access_token,
        refresh_token: session.refresh_token
      };
    } catch (error) {
      return null;
    }
  }
  /**
   * Verifies the JWT token, refreshes it if expired, and returns user data.
   * @returns {Promise<AuthResponse>} The user session data if successful, or an error message.
   */
  getSafeSession() {
    return __async(this, null, function* () {
      const tokens = this.getAuthTokensFromCookies();
      if (!tokens) {
        return { status: "error", error: "Authentication tokens not found" };
      }
      return this.parseAndVerifySession(tokens);
    });
  }
  /**
   * Verifies the JWT access token and decodes it. Handles token expiration by refreshing it.
   * @param tokens The authentication tokens obtained from cookies.
   * @returns {Promise<AuthResponse>} The decoded JWT payload or an error.
   */
  parseAndVerifySession(tokens) {
    return __async(this, null, function* () {
      try {
        const session = import_jsonwebtoken.default.verify(
          tokens.access_token,
          this.jwtSecret
        );
        return { status: "success", data: __spreadProps(__spreadValues({}, session), { id: session.sub }) };
      } catch (error) {
        if (error instanceof import_jsonwebtoken.default.TokenExpiredError) {
          return this.refreshSession(tokens);
        } else {
          return { status: "error", error: "JWT verification failed" };
        }
      }
    });
  }
  /**
   * Refreshes the session when the JWT has expired.
   * @param tokens The authentication tokens.
   * @returns {Promise<AuthResponse>} The new session data or an error.
   */
  refreshSession(tokens) {
    return __async(this, null, function* () {
      const session = yield this.supabase.auth.setSession(tokens);
      if (session.error) {
        return { status: "error", error: session.error.message };
      }
      if (!session.data || !session.data.user) {
        return {
          status: "error",
          error: "No user data available after refreshing session"
        };
      }
      return {
        status: "success",
        data: __spreadProps(__spreadValues({}, session.data.user), { sub: session.data.user.id })
      };
    });
  }
};
var auth_server_default = AuthManager;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthManager
});
//# sourceMappingURL=index.js.map