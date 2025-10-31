// import React from 'react'
// import { Avatar,AvatarFallback,AvatarImage } from './ui/avatar'

// const Comment = ({comment}) => {
//   return (
//     <div className ='my-2'>
//         <div className='flex gap-3 items-center'>
//             <Avatar>
//                 <AvatarImage src={comment?.author?.profilePicture}/>
//                 <AvatarFallback>CN</AvatarFallback>
//             </Avatar>
//             <h1 className='font-bold text-sm'>{comment?.author.username}<span className='font-normal pl-1'>{comment?.text}</span></h1>
//         </div>

//     </div>
//   )
// }

// export default Comment



import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

const getInitials = (name = '') => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const Comment = ({ comment }) => {
  const author = comment?.author || {};
  const username = author?.username || '';      // safe fallback
  const profilePicture = author?.profilePicture;

  return (
    <div className='my-2'>
      <div className='flex gap-3 items-center'>
        <Avatar>
          {profilePicture ? (
            <AvatarImage src={profilePicture} alt={`${username}'s avatar`} />
          ) : (
            <AvatarFallback>{getInitials(username) || 'U'}</AvatarFallback>
          )}
        </Avatar>

        <h1 className='font-bold text-sm'>
          <span className='font-medium mr-2'>{username || 'Unknown'}</span>
          <span className='font-normal pl-1'>{comment?.text}</span>
        </h1>
      </div>
    </div>
  )
}

export default Comment
