import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDB } from '../lib/useDB';
import { db, User } from '../lib/db';
import { Bell, UserPlus, Check, X } from 'lucide-react';

export function Notifications({ currentUser }: { currentUser: User | null }) {
  const { notifications, friendRequests, users } = useDB();

  useEffect(() => {
    if (currentUser) {
      db.markNotificationsRead(currentUser.userId);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const myNotifs = notifications
    .filter(n => n.toUserId === currentUser.userId)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Bell className="w-6 h-6" />
        Notifications
      </h1>
      
      <div className="space-y-3">
        {myNotifs.map(notif => {
          const fromUser = users.find(u => u.userId === notif.fromUserId);
          const request = friendRequests.find(r => 
            r.fromUserId === notif.fromUserId && 
            r.toUserId === currentUser.userId && 
            r.status === 'pending'
          );

          return (
            <div 
              key={notif.id} 
              className={`p-4 rounded-xl shadow-sm border transition-colors ${notif.read ? 'bg-white border-gray-100' : 'bg-indigo-50 border-indigo-100'}`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    <Link to={`/profile/${notif.fromUserId}`} className="hover:underline font-bold">
                      {fromUser?.name || `@${fromUser?.username}`}
                    </Link>
                    {' '}sent you a friend request
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                  </p>

                  {request && (
                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={() => db.updateFriendRequestStatus(request.id, 'accepted')}
                        className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button 
                        onClick={() => db.updateFriendRequestStatus(request.id, 'rejected')}
                        className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {myNotifs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
