import { Outlet, Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { Search, Users, Bell, User as UserIcon } from 'lucide-react';
import { useDB } from '../lib/useDB';
import { User } from '../lib/db';

export function Layout({ currentUser, onUserChange }: { currentUser: User | null, onUserChange: (u: User) => void }) {
  const { users, notifications } = useDB();
  const location = useLocation();

  const unreadNotifs = notifications.filter(n => n.toUserId === currentUser?.userId && !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-xl tracking-tight">FriendsApp</span>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              className="text-sm border rounded-md px-2 py-1 bg-gray-50"
              value={currentUser?.userId || ''}
              onChange={(e) => {
                const u = users.find(u => u.userId === e.target.value);
                if (u) onUserChange(u);
              }}
            >
              {users.map(u => (
                <option key={u.userId} value={u.userId}>
                  Acting as: {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t pb-4">
        <div className="max-w-3xl mx-auto flex justify-around p-3">
          <NavLink to="/" icon={<Search />} label="Search" active={location.pathname === '/'} />
          <NavLink to="/friends" icon={<Users />} label="Friends" active={location.pathname === '/friends'} />
          <NavLink to="/notifications" icon={
            <div className="relative">
              <Bell />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </div>
          } label="Alerts" active={location.pathname === '/notifications'} />
          <NavLink to={`/profile/${currentUser?.userId}`} icon={<UserIcon />} label="Profile" active={location.pathname.startsWith('/profile')} />
        </div>
      </nav>
    </div>
  );
}

function NavLink({ to, icon, label, active }: { to: string, icon: ReactNode, label: string, active: boolean }) {
  return (
    <Link to={to} className={`flex flex-col items-center gap-1 ${active ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>
      <div className="w-6 h-6">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
