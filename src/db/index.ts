import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Connection for query purposes
const queryClient = postgres(process.env.DATABASE_URL);

// Create drizzle instance with schema
export const db = drizzle(queryClient, { schema });

// Export schema for use in queries
export * from './schema';
