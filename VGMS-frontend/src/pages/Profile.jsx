import React from 'react';

const Profile = ({ user }) => {
  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h2>Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
};

export default Profile;
