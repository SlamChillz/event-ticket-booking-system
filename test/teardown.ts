import { db } from '../src/database';

export default async () => {
  try {
    // Check if database is initialized before destroying
    if (db.client && db.client.isInitialized) {
      await db.destroy();
      console.log('Database teardown completed');
    } else {
      console.log('Database was not initialized, skipping teardown');
    }
  } catch (error) {
    console.error('Error during database teardown:', error);
    // Don't throw to avoid masking test failures
  }
};

