import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createData } from "../services/firestoreService";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, getDoc, doc, getDocs, query, where, updateDoc, deleteDoc } from "firebase/firestore";

export default function Groups() {
  const [user] = useAuthState(auth);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]); // Holds only the user's friends
  const [showAddForm, setShowAddForm] = useState(false);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [formGroup, setFormGroup] = useState({
    groupName: "",
    description: "",
    members: [],
    memberIds: []
  });
  const [isEditing, setIsEditing] = useState(false); // Track if editing a group

  useEffect(() => {
    if (user) {
      const loadGroupsAndFriends = async () => {
        // Fetch groups where the user is a member
        const groupData = await fetchUserGroups();
        setGroups(groupData);

        // Fetch friends of the current user
        const friendsData = await fetchUserFriends();
        setFriends(friendsData);
        setLoading(false);
      };

      loadGroupsAndFriends();
    }
  }, [user]);

  // Fetch groups where the user is a member
  const fetchUserGroups = async () => {
    const groupsRef = collection(db, "groups");
    const q = query(groupsRef, where("memberIds", "array-contains", user.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  // Fetch friends of the current user
  const fetchUserFriends = async () => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUserName(userData.displayName);
      return userData.friends.map(friend => ({
        id: friend.friendId,
        displayName: friend.friendName,
      }));
    }
    return [];
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
    setIsEditing(false);
    setFormGroup({ groupName: "", description: "", members: [], memberIds: [] });
  };

  const handleGroupChange = (e) => {
    const { name, value } = e.target;
    setFormGroup(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberSelection = (e) => {
    const selectedFriendId = e.target.value;
    const selectedFriend = friends.find(friend => friend.id === selectedFriendId);
    if (selectedFriend && !formGroup.members.some(member => member.id === selectedFriendId)) {
      setFormGroup(prev => ({
        ...prev,
        members: [...prev.members, { id: selectedFriendId, name: selectedFriend.displayName }],
        memberIds: [...prev.memberIds, selectedFriendId]
      }));
    }
  };

  const removeMember = (memberId) => {
    setFormGroup(prev => ({
      ...prev,
      members: prev.members.filter(member => member.id !== memberId),
      memberIds: prev.memberIds.filter(id => id !== memberId)
    }));
  };

  const handleAddGroup = async () => {
    const updatedFormGroup = {
      ...formGroup,
      members: [...formGroup.members, { id: user.uid, name: userName }],
      memberIds: [...formGroup.memberIds, user.uid],
    };

    if (isEditing) {
      // Update existing group
      const groupRef = doc(db, "groups", groupDetails.id);
      await updateDoc(groupRef, updatedFormGroup);

      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupDetails.id ? { id: groupDetails.id, ...updatedFormGroup } : group
        )
      );
      setIsEditing(false);
      console.log("Group updated successfully.");
    } else {
      // Create new group
      await createData("groups", updatedFormGroup, user.uid);
      setGroups([...groups, updatedFormGroup]);
      console.log("Group created successfully.");
    }

    setFormGroup({ groupName: "", description: "", members: [], memberIds: [] });
    setShowAddForm(false);
  };

  const handleEditGroup = (group) => {
    setIsEditing(true);
    setFormGroup({
      groupName: group.groupName,
      description: group.description,
      members: group.members,
      memberIds: group.memberIds,
    });
    setShowAddForm(true);
    setGroupDetails(group);
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteDoc(doc(db, "groups", groupId));
      setGroups(groups.filter(group => group.id !== groupId));
      console.log("Group deleted successfully.");
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="relative">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-center text-indigo-400 mt-8 mb-6"
        >
          <span className="text-white text-6xl">Manage Your</span> <span className="text-6xl">Groups 👥</span>
        </motion.h1>

        {/* Add Group Button */}
        <div className="flex justify-end">
          <button
            onClick={handleShowAddForm}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Add Group
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.div className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden">
              <div className="p-6">
                <motion.h3 className="font-bold text-neutral-700 dark:text-neutral-200">
                  {isEditing ? "Edit Group" : "Add New Group"}
                </motion.h3>
                <form className="space-y-4 mt-4">
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Group Name</label>
                    <input
                      type="text"
                      name="groupName"
                      value={formGroup.groupName}
                      onChange={handleGroupChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={formGroup.description}
                      onChange={handleGroupChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Add Members</label>
                    <select
                      onChange={handleMemberSelection}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                    >
                      <option value="">Select a friend</option>
                      {friends.map(friend => (
                        <option key={friend.id} value={friend.id}>
                          {friend.displayName}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2">
                      {formGroup.members.map(member => (
                        <span key={member.id} className="inline-flex items-center bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-3 py-1 rounded-md mr-2">
                          {member.name}
                          <button onClick={() => removeMember(member.id)} className="ml-2 text-red-500 font-bold">
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </form>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-sm rounded-full font-bold bg-red-600 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGroup}
                    className="px-4 py-2 text-sm rounded-full font-bold bg-green-600 text-white"
                  >
                    Save Group
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Groups List */}
      <ul className="max-w-2xl mx-auto w-full flex flex-col gap-4 mt-6">
        {groups.map(group => (
          <motion.div
            key={group.id}
            className="p-4 flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-xl"
          >
            <div>
              <h3 className="font-medium text-neutral-800 dark:text-neutral-200">{group.groupName}</h3>
              <p className="text-neutral-600 dark:text-neutral-400">{group.description}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleEditGroup(group)}
                className="px-4 py-2 text-sm rounded-full font-bold bg-blue-600 text-white"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteGroup(group.id)}
                className="px-4 py-2 text-sm rounded-full font-bold bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </ul>
    </>
  );
}
