export interface User {
  userId: string;
  username: string;
  name: string;
  profilePic: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: any;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  createdAt: any;
}

export interface Notification {
  id: string;
  type: "friend_request";
  fromUserId: string;
  toUserId: string;
  message: string;
  createdAt: any;
}
