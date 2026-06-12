import mongoose from 'mongoose';

let cached = (globalThis as any).__mongoose;
if (!cached) cached = (globalThis as any).__mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(import.meta.env.MONGODB_URI || process.env.MONGODB_URI!);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
