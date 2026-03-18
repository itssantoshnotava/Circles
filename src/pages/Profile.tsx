import { useParams } from 'react-router-dom';
import { useDB } from '../lib/useDB';
import { db, User } from '../lib/db';
import { UserPlus, UserCheck, Clock, X, Check } from 'lucide-react';

export function Profile({ currentUser }: { currentUser: User | null }) {
  const { id } = useParams<{ id: string }>();
  const { users, friendRequests, friends } = useDB();

  const profileUser = users.find(u => u.userId === id);

  if (!profileUser || !currentUser) {
    return <div className="p-8 text-center text-gray-500">User not found</div>;
  }

  const isSelf = currentUser.userId === profileUser.userId;

  // Check relationship status
  const isFriend = friends.some(f => 
    (f.userId === currentUser.userId && f.friendId === profileUser.userId) ||
    (f.userId === profileUser.userId && f.friendId === currentUser.userId)
  );

  const sentRequest = friendRequests.find(r => 
    r.fromUserId === currentUser.userId && r.toUserId === profileUser.userId && r.status === 'pending'
  );

  const receivedRequest = friendRequests.find(r => 
    r.fromUserId === profileUser.userId && r.toUserId === currentUser.userId && r.status === 'pending'
  );

  const handleAddFriend = () => {
    db.addFriendRequest(currentUser.userId, profileUser.userId);
  };

  const handleAccept = () => {
    if (receivedRequest) {
      db.updateFriendRequestStatus(receivedRequest.id, 'accepted');
    }
  };

  const handleReject = () => {
    if (receivedRequest) {
      db.updateFriendRequestStatus(receivedRequest.id, 'rejected');
    }
  };

  const friendCount = friends.filter(f => f.userId === profileUser.userId).length;

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500" />
      
      <div className="px-6 pb-6 relative">
        <img 
          src={profileUser.profilePic} 
          alt={profileUser.name} 
          className="w-24 h-24 rounded-full border-4 border-white absolute -top-12 left-6 bg-white object-cover"
        />
        
        <div className="mt-14">
          <h1 className="text-2xl font-bold text-gray-900">{profileUser.name}</h1>
          <p className="text-gray-500">@{profileUser.username}</p>
          
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 font-medium">
            <span id="fr5">Friends ({friendCount})</span>
          </div>

          {!isSelf && (
            <div className="mt-6">
              {isFriend ? (
                <button 
                  id="fr4"
                  className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2 cursor-default"
                >
                  <UserCheck className="w-5 h-5" />
                  Friends
                </button>
              ) : sentRequest ? (
                <button 
                  id="fr2"
                  disabled
                  className="w-full py-2.5 px-4 bg-gray-100 text-gray-500 font-medium rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Clock className="w-5 h-5" />
                  Requested
                </button>
              ) : receivedRequest ? (
                <div className="flex gap-3" id="fr3">
                  <button 
                    onClick={handleAccept}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    Accept
                  </button>
                  <button 
                    onClick={handleReject}
                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              ) : (
                <button 
                  id="fr1"
                  onClick={handleAddFriend}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Friend
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
