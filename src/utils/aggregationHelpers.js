import mongoose from 'mongoose';
// import { trusted } from 'mongoose';

export const generateGetArticleListPipeline = (longitude, latitude, filter, skip, limit) => {
  return [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude, latitude], // User's location
        },
        distanceField: 'distance', // The calculated distance will be stored in this field
        spherical: true,           // Specifies that the earth is round and uses 2dsphere index
        query: {
          //這物件的順序不影響index的順序
          isDelete: false,
          ...filter,
        },
      },
    },
    {
      $addFields: {
        distanceBucket: {
          $floor: {
            $divide: ['$distance', 1000],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'image',           // The name of the image collection
        localField: '_id',       // Field in the article collection
        foreignField: 'article', // Field in the image collection
        as: 'images',            // The name of the output array field
      },
    },
    {
      $project: {
        _id: 1,
        petType: 1,
        color: 1,
        hasReward: 1,
        rewardAmount: 1,
        hasMicrochip: 1,
        lostDate: 1,
        lostCityCode: 1,
        lostDistrict: 1,
        title: 1,
        images: 1,
        distance: 1,
        distanceBucket: 1,
      },
    },
    {
      $sort: {
        distanceBucket: 1,
        lostDate: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]
}

