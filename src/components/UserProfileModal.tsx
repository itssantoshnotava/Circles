import React, { useState, useEffect } from "react";
import { X, UserPlus, Check, Clock, UserMinus, UserCheck } from "lucide-react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { User, FriendRequest, Friend } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  const currentUser = auth.currentUser;
  const [requestStatus, setRequestStatus] = useState<"none" | "sent" | "received" | "friends">("none");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !user) return;

    // Check if they are friends
    const friendsQuery = query(
      collection(db, "friends"),
      where("userId", "==", currentUser.uid),
      where("friendId", "==", user.userId)
    );

    const unsubscribeFriends = onSnapshot(friendsQuery, (snapshot) => {
      if (!snapshot.empty) {
        setRequestStatus("friends");
        setLoading(false);
      } else {
        // Check for friend requests
        const requestsQuery = query(
          collection(db, "friendRequests"),
          where("fromUserId", "in", [currentUser.uid, user.userId]),
          where("toUserId", "in", [currentUser.uid, user.userId])
        );

        const unsubscribeRequests = onSnapshot(requestsQuery, (reqSnapshot) => {
          if (!reqSnapshot.empty) {
            const req = reqSnapshot.docs[0].data() as FriendRequest;
            setRequestId(reqSnapshot.docs[0].id);
            if (req.status === "accepted") {
              setRequestStatus("friends");
            } else if (req.status === "pending") {
              if (req.fromUserId === currentUser.uid) {
                setRequestStatus("sent");
              } else {
                setRequestStatus("received");
              }
            } else {
              setRequestStatus("none");
            }
          } else {
            setRequestStatus("none");
          }
          setLoading(false);
        });

        return () => unsubscribeRequests();
      }
    });

    return () => unsubscribeFriends();
  }, [currentUser, user]);

  const handleAddFriend = async () => {
    if (!currentUser || !user) return;
    try {
      setLoading(true);
      await addDoc(collection(db, "friendRequests"), {
        fromUserId: currentUser.uid,
        toUserId: user.userId,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Add notification
      await addDoc(collection(db, "notifications"), {
        type: "friend_request",
        fromUserId: currentUser.uid,
        toUserId: user.userId,
        message: `@${currentUser.displayName || "Someone"} sent you a friend request`,
        createdAt: serverTimestamp(),
      });

      console.log("Friend request sent");
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!currentUser || !user || !requestId) return;
    try {
      setLoading(true);
      // Update request status
      await updateDoc(doc(db, "friendRequests", requestId), {
        status: "accepted",
      });

      // Add to friends collection (both ways)
      await addDoc(collection(db, "friends"), {
        userId: currentUser.uid,
        friendId: user.userId,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "friends"), {
        userId: user.userId,
        friendId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      console.log("Friend request accepted");
      console.log("Friend added");
    } catch (error) {
      console.error("Error accepting friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!currentUser || !user || !requestId) return;
    try {
      setLoading(true);
      await updateDoc(doc(db, "friendRequests", requestId), {
        status: "rejected",
      });
      console.log("Friend request rejected");
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-sm rounded-2xl p-8 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <img
            src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-md mb-4 object-cover"
          />
          <h2 className="text-2xl font-bold text-ink">{user.name}</h2>
          <p className="text-gray-500 mb-8">@{user.username}</p>

          <div className="w-full space-y-3">
            {loading ? (
              <div className="flex justify-center py-2">
                <div className="w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {requestStatus === "none" && (
                  <button
                    id="fr1"
                    onClick={handleAddFriend}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Add Friend
                  </button>
                )}

                {requestStatus === "sent" && (
                  <button
                    id="fr2"
                    disabled
                    className="btn btn-disabled w-full flex items-center justify-center gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    Requested
                  </button>
                )}

                {requestStatus === "received" && (
                  <div className="flex gap-2">
                    <button
                      id="fr3"
                      onClick={handleAcceptRequest}
                      className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Accept
                    </button>
                    <button
                      onClick={handleRejectRequest}
                      className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                )}

                {requestStatus === "friends" && (
                  <button
                    id="fr4"
                    disabled
                    className="btn btn-disabled w-full flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-5 h-5" />
                    Friends
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfileModal;
