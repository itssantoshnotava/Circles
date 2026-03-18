import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDB } from '../lib/useDB';
import { User } from '../lib/db';
import { Search as SearchIcon } from 'lucide-react';

export function Search({ currentUser }: { currentUser: User | null }) {
  const { users } = useDB();
  const [query, setQuery] = useState('');

  const results = users.filter(u => 
    u.userId !== currentUser?.userId &&
    (u.name.toLowerCase().includes(query.toLowerCase()) || 
     u.username.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {results.map(user => (
          <Link 
            key={user.userId} 
            to={`/profile/${user.userId}`}
            className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors"
          >
            <img src={user.profilePic} alt={user.name} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </Link>
        ))}
        {results.length === 0 && query && (
          <p className="text-center text-gray-500 py-8">No users found.</p>
        )}
      </div>
    </div>
  );
}
