import Database from "better-sqlite3";
import { Pool } from "pg";
import { MongoClient } from "mongodb";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

/**
 * Picks the database from DATABASE_URL:
 * - mongodb:// or mongodb+srv:// -> MongoDB (collections are created automatically, no migration needed)
 * - postgres:// or postgresql://  -> Postgres (run `npm run auth:migrate` once)
 * - empty                         -> local SQLite file (run `npm run auth:migrate` once)
 */
function createDatabase(): BetterAuthOptions["database"] {
  const url = process.env.DATABASE_URL;

  if (url && /^mongodb(\+srv)?:\/\//.test(url)) {
    const client = new MongoClient(url);
    return mongodbAdapter(client.db(), { client });
  }
  if (url && /^postgres(ql)?:\/\//.test(url)) {
    return new Pool({ connectionString: url });
  }
  return new Database(process.env.SQLITE_PATH || "./data/auth.db");
}

function createSocialProviders() {
  const providers: NonNullable<BetterAuthOptions["socialProviders"]> = {};
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } =
    process.env;

  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    providers.google = { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET };
  }
  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
    providers.github = { clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET };
  }
  return providers;
}

export const auth = betterAuth({
  appName: "বাজার দর",
  database: createDatabase(),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Sign-up should send the user to the login page (per the brief), not log them in.
    autoSignIn: false,
  },
  socialProviders: createSocialProviders(),
  // nextCookies must stay the last plugin.
  plugins: [nextCookies()],
});







// import Database from "better-sqlite3";
// import { Pool } from "pg";
// import { betterAuth, type BetterAuthOptions } from "better-auth";
// import { nextCookies } from "better-auth/next-js";

// /**
//  * Postgres when DATABASE_URL is a postgres:// URL (use this on Vercel/Netlify),
//  * otherwise a local SQLite file (fine for development).
//  */
// function createDatabase() {
//   const url = process.env.DATABASE_URL;
//   if (url && /^postgres(ql)?:\/\//.test(url)) {
//     return new Pool({ connectionString: url });
//   }
//   return new Database(process.env.SQLITE_PATH || "./data/auth.db");
// }

// function createSocialProviders() {
//   const providers: NonNullable<BetterAuthOptions["socialProviders"]> = {};
//   const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } =
//     process.env;

//   if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
//     providers.google = { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET };
//   }
//   if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
//     providers.github = { clientId: GITHUB_CLIENT_ID, clientSecret: GITHUB_CLIENT_SECRET };
//   }
//   return providers;
// }

// export const auth = betterAuth({
//   appName: "বাজার দর",
//   database: createDatabase(),
//   emailAndPassword: {
//     enabled: true,
//     minPasswordLength: 8,
//     // Sign-up should send the user to the login page (per the brief), not log them in.
//     autoSignIn: false,
//   },
//   socialProviders: createSocialProviders(),
//   // nextCookies must stay the last plugin.
//   plugins: [nextCookies()],
// });
