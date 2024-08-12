import mongoose from 'mongoose'
import userModel from './src/models/userModel.js' // Replace with the actual path to your user model

async function performanceTest() {
  const newRate = 3; // The index in the array to increment
  const changeValue = 1;
  const userId = "668d3ff63dc247f49520d402";
  const iterations = 30; // Number of iterations for the test

  let totalTimeManual = 0;
  let totalTimeInc = 0;

  for (let i = 0; i < iterations; i++) {

    // 2. Test the manual modification and save operation
    const startTimeManual = Date.now();

    const user = await userModel.findById(userId, "_id record.givenRatings.article");
    user.record.givenRatings['article'][newRate] += changeValue;
    await user.save();

    const endTimeManual = Date.now();
    totalTimeManual += endTimeManual - startTimeManual;

    // 1. Test the $inc operation
    const startTimeInc = Date.now();

    const userLean = await userModel.findById(userId, "_id record.givenRatings.article").lean();
    const updateUserData = { $inc: { [`record.givenRatings.article.${newRate}`]: changeValue } };
    await userModel.updateOne({ _id: userId }, updateUserData);

    const endTimeInc = Date.now();
    totalTimeInc += endTimeInc - startTimeInc;


    // Swap order in the next iteration to avoid systematic bias
    if (i % 2 === 1) {
      const tempTime = totalTimeManual;
      totalTimeManual = totalTimeInc;
      totalTimeInc = tempTime;
    }
  }

  console.log('Total time taken with $inc:', totalTimeInc, 'ms');
  console.log('Total time taken with manual modification:', totalTimeManual, 'ms');

  // Compare results
  if (totalTimeInc < totalTimeManual) {
    console.log(`$inc operation is faster by ${totalTimeManual - totalTimeInc} ms on average`);
  } else if (totalTimeManual < totalTimeInc) {
    console.log(`Manual modification is faster by ${totalTimeInc - totalTimeManual} ms on average`);
  } else {
    console.log('Both operations took the same time on average');
  }
}

// Example usage with session handling
async function runTest() {
  await performanceTest();  // Pass the req object with user data
}

// Run the test function
runTest();
