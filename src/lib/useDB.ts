import { useState, useEffect } from 'react';
import { db, User, FriendRequest, Friend, Notification } from './db';

export function useDB() {
  const [users, setUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    db.init();
    
    const loadData = () => {
      setUsers(db.getUsers());
      setFriendRequests(db.getFriendRequests());
      setFriends(db.getFriends());
      setNotifications(db.getNotifications());
    };

    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('db_update', handleUpdate);
    return () => window.removeEventListener('db_update', handleUpdate);
  }, []);

  return { users, friendRequests, friends, notifications };
}
