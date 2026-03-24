import React, { useState } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { MessageSquare, ThumbsUp, Reply, MoreVertical, Flag, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommentProps {
  videoId: string;
}

export const CommentSection: React.FC<CommentProps> = ({ videoId }) => {
  const [user] = useAuthState(auth);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const commentsQuery = query(
    collection(db, 'comments'),
    where('videoId', '==', videoId),
    orderBy('createdAt', 'desc')
  );

  const [comments, loading, error] = useCollectionData(commentsQuery);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        videoId,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        text: newComment.trim(),
        likes: 0,
        createdAt: serverTimestamp(),
      });
      setNewComment('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'comments');
    }
  };

  const handleLikeComment = async (commentId: string, authorId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        likes: increment(1)
      });

      // Create notification for the author
      if (authorId !== user.uid) {
        await addDoc(collection(db, 'notifications'), {
          userId: authorId,
          type: 'like',
          message: `${user.displayName} liked your comment`,
          read: false,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `comments/${commentId}`);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!user || !replyText.trim()) return;
    // For simplicity, we'll store replies as a sub-collection or just another comment with a parentId
    // Here we'll just add it to a sub-collection 'replies'
    try {
      await addDoc(collection(db, 'comments', commentId, 'replies'), {
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        text: replyText.trim(),
        likes: 0,
        createdAt: serverTimestamp(),
      });
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `comments/${commentId}/replies`);
    }
  };

  return (
    <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-900">Comments ({comments?.length || 0})</h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-10 flex gap-4">
          <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-10 h-10 rounded-full" />
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none min-h-[100px]"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="absolute bottom-4 right-4 bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Post
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center mb-10 border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">Please sign in to join the conversation.</p>
        </div>
      )}

      <div className="space-y-8">
        {loading && <div className="text-center py-10 text-gray-400">Loading comments...</div>}
        {comments?.map((comment: any) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 group"
          >
            <img src={comment.userPhoto} alt={comment.userName} className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">{comment.userName}</span>
                  <span className="text-xs text-gray-400">
                    {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                  </span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">{comment.text}</p>
              
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => handleLikeComment(comment.id, comment.userId)}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {comment.likes}
                </button>
                <button 
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
                <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>

              {/* Reply Input */}
              <AnimatePresence>
                {replyingTo === comment.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="flex gap-3">
                      <img src={user?.photoURL || ''} className="w-8 h-8 rounded-full" />
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button 
                          onClick={() => handleReply(comment.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 font-bold text-xs px-3"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
