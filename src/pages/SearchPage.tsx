import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db, auth } from "../firebase";
import { User } from "../types";
import UserProfileModal from "../components/UserProfileModal";
import { Search as SearchIcon, User as UserIcon } from "lucide-react";
import { AnimatePresence } from "framer-motion";

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryText = searchParams.get("q") || "";
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!queryText.trim()) return;
      setLoading(true);
      try {
        // Simple search by username or name
        // Firestore doesn't support full-text search, so we'll do a simple prefix search or exact match
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("username", ">=", queryText.toLowerCase()),
          where("username", "<=", queryText.toLowerCase() + "\uf8ff"),
          limit(20)
        );

        const snapshot = await getDocs(q);
        const users = snapshot.docs
          .map((doc) => doc.data() as User)
          .filter((u) => u.userId !== currentUser?.uid); // Don't show self

        setResults(users);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [queryText, currentUser]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <SearchIcon className="w-6 h-6 text-gray-400" />
        <h1 className="text-2xl font-bold">Search results for "{queryText}"</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-ink border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((user) => (
            <div
              key={user.userId}
              onClick={() => setSelectedUser(user)}
              className="card p-4 flex items-center gap-4 cursor-pointer hover:border-ink transition-colors group"
            >
              <img
                src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border border-gray-100"
              />
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-ink transition-colors">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
              <UserIcon className="w-5 h-5 text-gray-300 group-hover:text-ink transition-colors" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-line">
          <p className="text-gray-500">No users found matching your search.</p>
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

export default SearchPage;
