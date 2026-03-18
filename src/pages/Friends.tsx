import { Link } from 'react-router-dom';
import { useDB } from '../lib/useDB';
import { User } from '../lib/db';

export function Friends({ currentUser }: { currentUser: User | null }) {
  const { users, friends } = useDB();

  if (!currentUser) return null;

  const myFriends = friends
    .filter(f => f.userId === currentUser.userId)
    .map(f => users.find(u => u.userId === f.friendId))
    .filter(Boolean) as User[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900" id="fr5">Friends ({myFriends.length})</h1>
      
      <div className="space-y-3">
        {myFriends.map(friend => (
          <Link 
            key={friend.userId} 
            to={`/profile/${friend.userId}`}
            className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors"
          >
            <img src={friend.profilePic} alt={friend.name} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
            <div>
              <h3 className="font-semibold text-gray-900">{friend.name}</h3>
              <p className="text-sm text-gray-500">@{friend.username}</p>
            </div>
          </Link>
        ))}
        {myFriends.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">You don't have any friends yet.</p>
            <Link to="/" className="text-indigo-600 font-medium hover:underline">
              Find some friends
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
