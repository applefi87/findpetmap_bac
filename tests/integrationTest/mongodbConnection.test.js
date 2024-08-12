import { expect } from 'chai';
// import createApp from '../../src/createApp.js';
import User from '../../src/models/userModel.js';
import 'dotenv/config' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import mongoose from 'mongoose'

describe('Server Connection Test', () => {
  it('should connect to MongoDB successfully using User model', async function(){
    this.timeout(10000); // Set timeout to 10 seconds
    mongoose.connect(process.env.mongoDB_atlas_URL, { autoIndex: true })
    // Check if the User model can be used to query MongoDB
    const users = await User.find();
    expect(users).to.be.an('array');
  });
});
