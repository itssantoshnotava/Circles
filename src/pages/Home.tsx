import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

const Home: React.FC = () => {
  const user = auth.currentUser;
  return (
    <>
      <div id="fr6" className="hidden">Search → View Profile → Add Friend → Notification → Accept → Friends list updated</div>
      {user ? <Navigate to="/friends" /> : <Navigate to="/auth" />}
    </>
  );
};

export default Home;
