export const generateGetArticleListPipeline = (bottomLeft, topRight, filter, skip, limit) => {
  return [
    {
      $match: {
        location: {
          $geoWithin: {
            $box: [
              [bottomLeft.lng, bottomLeft.lat],
              [topRight.lng, topRight.lat],
            ],
          },
        },
        isDelete: false,
        ...filter,
      },
    },
    {
      $lookup: {
        from: 'Previewimages',
        let: { articleId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$resource', '$$articleId'] },
                  { $eq: ['$isDelete', false] }, 
                ],
              },
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              fullPath: 1,
            },
          },
        ],
        as: 'previewImage',
      },
    },
    {
      $addFields: {
        previewImage: { $arrayElemAt: ['$previewImage.fullPath', 0] }, // Extract the top image from the array
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
        previewImage: 1,
        location: 1,
      },
    },
    {
      $sort: {
        lostDate: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];
};