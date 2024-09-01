import './preload.js'
import routes from './testRoute.js';
import createApp from '../src/createApp.js';
import mongoose from 'mongoose'

before(async function () {
  this.timeout(100000); // Increase timeout for the setup
});

after(async () => {
  try {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  } catch (err) {
    console.error('Failed to disconnect from MongoMemoryServer:', err);
  }
});

const app = createApp();
routes(app);

export { app };

export default app;