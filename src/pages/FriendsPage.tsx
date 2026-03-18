import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { User, Friend } from "../types";
import { Users, User as UserIcon } from "lucide-react";
import UserProfileModal from "../components/UserProfileModal";
import { AnimatePresence } from "framer-motion";

const FriendsPage: React.FC = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "friends"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const friendList = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const friendData = docSnapshot.data() as Friend;
          const userDoc = await getDoc(doc(db, "users", friendData.friendId));
          return { ...userDoc.data(), userId: userDoc.id } as User;
        })
      );
      setFriends(friendList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-6 h-6 text-gray-400" />
        <h1 id="fr5" className="text-2xl font-bold">Friends ({friends.length})</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-ink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : friends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <div
              key={friend.userId}
              onClick={() => setSelectedUser(friend)}
              className="card p-4 flex items-center gap-4 cursor-pointer hover:border-ink transition-colors group"
            >
              <img
                src={friend.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                alt={friend.name}
                className="w-12 h-12 rounded-full object-cover border border-gray-100"
              />
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-ink transition-colors">
                  {friend.name}
                </h3>
                <p className="text-sm text-gray-500">@{friend.username}</p>
              </div>
              <UserIcon className="w-5 h-5 text-gray-300 group-hover:text-ink transition-colors" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-line">
          <p className="text-gray-500">You haven't added any friends yet.</p>
        </div>
      )}

      <AnimatePresence>
        {selectedUser && (
          <UserProfileModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FriendsPage;
