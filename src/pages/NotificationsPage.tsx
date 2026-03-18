import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Notification, User, FriendRequest } from "../types";
import { Check, X, Bell, UserPlus } from "lucide-react";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingRequests, setPendingRequests] = useState<(FriendRequest & { user: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    // Listen for pending friend requests
    const q = query(
      collection(db, "friendRequests"),
      where("toUserId", "==", currentUser.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const req = docSnapshot.data() as FriendRequest;
          const userDoc = await getDoc(doc(db, "users", req.fromUserId));
          const userData = userDoc.data() as User;
          return { ...req, id: docSnapshot.id, user: userData };
        })
      );
      setPendingRequests(requests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAccept = async (reqId: string, fromUserId: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "friendRequests", reqId), {
        status: "accepted",
      });

      await addDoc(collection(db, "friends"), {
        userId: currentUser.uid,
        friendId: fromUserId,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "friends"), {
        userId: fromUserId,
        friendId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      console.log("Friend request accepted");
      console.log("Friend added");
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleReject = async (reqId: string) => {
    try {
      await updateDoc(doc(db, "friendRequests", reqId), {
        status: "rejected",
      });
      console.log("Friend request rejected");
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-6 h-6 text-gray-400" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-ink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pendingRequests.length > 0 ? (
        <div className="space-y-4">
          {pendingRequests.map((req) => (
            <div key={req.id} className="card p-4 flex items-center gap-4">
              <img
                src={req.user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user.username}`}
                alt={req.user.name}
                className="w-12 h-12 rounded-full object-cover border border-gray-100"
              />
              <div className="flex-1">
                <p className="font-medium">
                  <span className="font-bold">{req.user.name}</span> sent you a friend request
                </p>
                <p className="text-sm text-gray-500">@{req.user.username}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(req.id, req.fromUserId)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-line">
          <p className="text-gray-500">No new notifications.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
