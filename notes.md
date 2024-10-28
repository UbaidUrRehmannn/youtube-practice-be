<b>Aggrigation Pipeline Starts</b>
/*
 [
  {
    $lookup: {
      from: "authors",
      localField: "author_id",
      foreignField: "_id",
      as: "author_detail"
    }
  },
  ! we can use this to select first element of array 
  {
    $addFields: {
      author_detail: {
        $first: "$author_detail"
      }
    }
  }
  ! or we can use this
  {
    $addFields: {
      author_detail: {
    		$arrayElemAt: ["$author_detail", 0]
      }
    }
  }
]
*/
<b>Aggrigation Pipeline Ends</b>
