import React from 'react'
import { DiscussionMessage } from '@/utils/api/user/lesson-overview/discussion/getCourseDiscussion';
import CustomImageTag from '@/components/commonComp/customImage/CustomImageTag';

interface CommentThreadProps {
  replies: DiscussionMessage[];
}

const CommentThread: React.FC<CommentThreadProps> = ({ replies }) => {
  return (
    <div className="space-y-4 pl-12 mt-4">
      {replies.map((reply, index) => (
        <div key={index} className="border-b borderColor pb-4 last:border-b-0">
          <div className="flex items-start gap-3">
            {/* User avatar */}
            <div className="w-9 h-9 rounded-full bg-[#A5B7C4] overflow-hidden flex-shrink-0">
              <CustomImageTag src={reply.user.profile} alt={reply.user.name} className="w-full h-full rounded-full" />
            </div>
            
            <div className="flex-1">
              {/* User info and timestamp */}
              <div className="flex flex-col mb-2">
                <h3 className="font-medium text-sm">{reply.user.name}</h3>
                <span className="text-xs text-gray-500">{reply.time_ago}</span>
              </div>
              
              {/* Comment content */}
              <p className="text-sm text-gray-700">{reply.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CommentThread 