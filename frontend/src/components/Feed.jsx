

import React from 'react'
import Posts from './Posts'

const Feed = () => {
  // drop the hardcoded pl-[20%] which caused layout misalignment
  return (
    <div className='flex-1 my-8 flex flex-col items-center'>
      <Posts/>
    </div>
  )
}

export default Feed
