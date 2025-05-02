import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';

const MyProfile = () => {
  const [user] = useAuthState(auth);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFirstName(docSnap.data().firstName);
          setLastName(docSnap.data().lastName);
          setEmail(docSnap.data().email);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Password change handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('Please fill out all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false); 
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };


  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="profile-container p-8 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-10">
      <h2 className="text-3xl font-extrabold text-center text-indigo-600 mb-6">My Profile</h2>

      <div className="profile-info text-center">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">First Name: {firstName}</p>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">Last Name: {lastName}</p>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">Email: {email}</p>
      </div>

      <button
        onClick={() => setShowPasswordChange(!showPasswordChange)}
        className="w-full p-3 mt-6 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold"
      >
        {showPasswordChange ? 'Cancel' : 'Change Password'}
      </button>

      {showPasswordChange && (
        <form onSubmit={handleChangePassword} className="mt-6">
          <h3 className="text-xl font-semibold text-indigo-600">Change Password</h3>

          <label className="block mt-4 text-gray-700 dark:text-gray-200">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 mt-2 border rounded-md bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            required
          />

          <label className="block mt-4 text-gray-700 dark:text-gray-200">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 mt-2 border rounded-md bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            required
          />

          <label className="block mt-4 text-gray-700 dark:text-gray-200">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 mt-2 border rounded-md bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            required
          />

          {message && <p className="text-center text-red-500 mt-4">{message}</p>}

          <button
            type="submit"
            className="w-full p-3 mt-6 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold"
          >
            Update Password
          </button>
        </form>
      )}

      <button
        onClick={handleLogout}
        className="w-full p-3 mt-6 text-white bg-red-600 hover:bg-red-700 rounded-md font-semibold"
      >
        Logout
      </button>
    </div>
  );
};

export default MyProfile;
