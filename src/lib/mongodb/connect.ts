import "server-only";
import mongoose from "mongoose";
import { MOCK_MODE } from "@/lib/config";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Cache the connection across hot reloads / serverless invocations so we don't
 * open a new pool on every request.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  // Holds the in-memory server instance in mock mode so it isn't garbage-collected.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  memServer: any;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cache: MongooseCache =
  global._mongoose ?? { conn: null, promise: null, memServer: null };
global._mongoose = cache;

/** In mock mode, spin up an in-memory MongoDB so no real database is needed. */
async function resolveUri(): Promise<string> {
  if (MOCK_MODE) {
    if (!cache.memServer) {
      // webpackIgnore keeps this dev-only dependency out of the production bundle.
      const mod = "mongodb-memory-server";
      const { MongoMemoryServer } = await import(/* webpackIgnore: true */ mod);
      cache.memServer = await MongoMemoryServer.create();
    }
    return cache.memServer.getUri();
  }
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local (or set NEXT_PUBLIC_MOCK_MODE=true).");
  }
  return MONGODB_URI;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = resolveUri()
      .then((uri) => mongoose.connect(uri, { bufferCommands: false }))
      .then(async (m) => {
        // In mock mode, seed demo data as part of "connected" so the very first
        // page read sees it (avoids a layout/page render race).
        if (MOCK_MODE) {
          const { seedMockData } = await import("@/lib/mock/seed");
          await seedMockData();
        }
        return m;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
