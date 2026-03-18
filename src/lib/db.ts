import { v4 as uuidv4 } from 'uuid';

export type User = {
  userId: string;
  username: string;
  name: string;
  profilePic: string;
};

export type FriendRequest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: number;
};

export type Friend = {
  id: string;
  userId: string;
  friendId: string;
  createdAt: number;
};

export type Notification = {
  id: string;
  type: "friend_request";
  fromUserId: string;
  toUserId: string;
  message: string;
  createdAt: number;
  read: boolean;
};

const INITIAL_USERS: User[] = [
  { userId: 'u1', username: 'alice', name: 'Alice Smith', profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
  { userId: 'u2', username: 'bob', name: 'Bob Jones', profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
  { userId: 'u3', username: 'charlie', name: 'Charlie Brown', profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
  { userId: 'u4', username: 'dave', name: 'Dave Williams', profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dave' },
];

class MockDB {
  private get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private set<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch a custom event so other components can re-render
    window.dispatchEvent(new Event('db_update'));
  }

  init() {
    if (this.get<User>('users').length === 0) {
      this.set('users', INITIAL_USERS);
    }
  }

  // Users
  getUsers(): User[] {
    return this.get<User>('users');
  }

  getUser(userId: string): User | undefined {
    return this.getUsers().find(u => u.userId === userId);
  }

  // Friend Requests
  getFriendRequests(): FriendRequest[] {
    return this.get<FriendRequest>('friendRequests');
  }

  addFriendRequest(fromUserId: string, toUserId: string) {
    if (fromUserId === toUserId) return;

    const friends = this.getFriends();
    const alreadyFriends = friends.some(f => 
      (f.userId === fromUserId && f.friendId === toUserId) ||
      (f.userId === toUserId && f.friendId === fromUserId)
    );
    if (alreadyFriends) return;

    const requests = this.getFriendRequests();
    // Check for duplicates
    const existing = requests.find(r => 
      ((r.fromUserId === fromUserId && r.toUserId === toUserId) || 
       (r.fromUserId === toUserId && r.toUserId === fromUserId)) &&
      r.status === 'pending'
    );
    if (existing) return;

    const newReq: FriendRequest = {
      id: uuidv4(),
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: Date.now()
    };
    this.set('friendRequests', [...requests, newReq]);
    console.log("Friend request sent");

    // Add notification
    const fromUser = this.getUser(fromUserId);
    this.addNotification({
      id: uuidv4(),
      type: 'friend_request',
      fromUserId,
      toUserId,
      message: `@${fromUser?.username} sent you a friend request`,
      createdAt: Date.now(),
      read: false
    });
  }

  updateFriendRequestStatus(requestId: string, status: 'accepted' | 'rejected') {
    const requests = this.getFriendRequests();
    const reqIndex = requests.findIndex(r => r.id === requestId);
    if (reqIndex === -1) return;

    const req = requests[reqIndex];
    requests[reqIndex] = { ...req, status };
    this.set('friendRequests', requests);

    if (status === 'accepted') {
      console.log("Friend request accepted");
      this.addFriend(req.fromUserId, req.toUserId);
    }
  }

  // Friends
  getFriends(): Friend[] {
    return this.get<Friend>('friends');
  }

  addFriend(userId1: string, userId2: string) {
    const friends = this.getFriends();
    const newFriends: Friend[] = [
      { id: uuidv4(), userId: userId1, friendId: userId2, createdAt: Date.now() },
      { id: uuidv4(), userId: userId2, friendId: userId1, createdAt: Date.now() }
    ];
    this.set('friends', [...friends, ...newFriends]);
    console.log("Friend added");
  }

  // Notifications
  getNotifications(): Notification[] {
    return this.get<Notification>('notifications');
  }

  addNotification(notification: Notification) {
    const notifs = this.getNotifications();
    this.set('notifications', [...notifs, notification]);
  }

  markNotificationsRead(userId: string) {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => n.toUserId === userId ? { ...n, read: true } : n);
    this.set('notifications', updated);
  }
}

export const db = new MockDB();
