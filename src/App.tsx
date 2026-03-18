import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Search } from './pages/Search';
import { Profile } from './pages/Profile';
import { Friends } from './pages/Friends';
import { Notifications } from './pages/Notifications';
import { db, User } from './lib/db';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    db.init();
    const users = db.getUsers();
    if (users.length > 0) {
      setCurrentUser(users[0]);
    }
  }, []);

  if (!currentUser) return null;

  return (
    <Routes>
      <Route path="/" element={<Layout currentUser={currentUser} onUserChange={setCurrentUser} />}>
        <Route index element={<Search currentUser={currentUser} />} />
        <Route path="profile/:id" element={<Profile currentUser={currentUser} />} />
        <Route path="friends" element={<Friends currentUser={currentUser} />} />
        <Route path="notifications" element={<Notifications currentUser={currentUser} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
