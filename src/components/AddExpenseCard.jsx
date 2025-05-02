/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';
import { fetchGroups } from '../services/firestoreService';
import { auth, db } from '../firebase';
import { addDoc, doc, updateDoc, getDoc, collection } from 'firebase/firestore';

const AddExpenseCard = ({ onSave, onClose, editingExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedPayers, setSelectedPayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [category, setCategory] = useState(''); // Category state
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // Date state
  const [currentUserName, setCurrentUserName] = useState('');

  //const categories = ['Entertainment', 'Food', 'Groceries', 'Utilities', 'Travel', 'Miscellaneous']; // Default categories
  const categories = [
    "Food",
    "Housing",
    "Utilities",
    "Transportation",
    "Entertainment",
    "Recurring Payments",
    "Miscellaneous",
    "Healthcare",
    "Savings",
    "Taxes",
  ];
  useEffect(() => {
    const loadData = async () => {
      // Fetch groups
      const fetchedGroups = await fetchGroups(auth.currentUser.uid);
      setGroups(fetchedGroups);

      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUserName(userData.displayName);
        const friendData = userData.friends.map(friend => ({
          id: friend.friendId,
          displayName: friend.friendName,
        }));
        setFriends(friendData);
      }
    };

    loadData();

    if (editingExpense) {
      setDescription(editingExpense.description);
      setAmount(editingExpense.amount.toString());
      setSelectedPayers(editingExpense.payers.map(payer => ({
        id: payer.userId,
        displayName: payer.name,
      })));
      setCategory(editingExpense.category || '');
      setDate(editingExpense.date || new Date().toISOString().slice(0, 10));
    }
  }, [editingExpense]);

  const handleSaveExpense = async () => {
    const splitAmount = amount && selectedPayers.length ? (amount / (selectedPayers.length + 1)).toFixed(2) : '0.00';
    const payerIds = selectedPayers.map(payer => payer.id);

    const expenseData = {
      description,
      amount: parseFloat(amount),
      category,
      date, // Add the date field here
      payers: selectedPayers.map(payer => ({
        userId: payer.id,
        name: payer.displayName,
        share: parseFloat(splitAmount),
        settled: editingExpense
          ? editingExpense.payers.find(p => p.userId === payer.id)?.settled || false
          : payer.id === auth.currentUser.uid,
      })),
      createdBy: editingExpense?.createdBy || auth.currentUser.uid,
      createdByName: editingExpense?.createdByName || currentUserName,
      createdAt: editingExpense?.createdAt || new Date(),
      payerIds: [...payerIds, auth.currentUser.uid],
    };

    try {
      if (editingExpense) {
        const expenseRef = doc(db, 'expenses', editingExpense.id);
        await updateDoc(expenseRef, expenseData);
        console.log('Expense updated successfully.');
      } else {
        const expenseRef = await addDoc(collection(db, 'expenses'), expenseData);
        console.log('Expense added with ID:', expenseRef.id);
      }
      onSave(expenseData);
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleGroupSelect = group => {
    const groupMembers = group.members
      .filter(member => member.id !== auth.currentUser.uid)
      .map(member => ({
        id: member.id,
        displayName: member.name,
      }));

    setSelectedPayers(groupMembers);
  };

  const filteredResults = [...friends, ...groups].filter(item =>
    (item.displayName || item.groupName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = item => {
    if (item.groupName) {
      handleGroupSelect(item);
    } else if (!selectedPayers.some(p => p.id === item.id)) {
      setSelectedPayers([...selectedPayers, item]);
    }
    setSearchTerm('');
  };

  const handleRemove = id => {
    setSelectedPayers(selectedPayers.filter(p => p.id !== id));
  };

  return (
    <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-lg w-full max-w-md p-6">
      <h3 className="text-xl font-semibold text-center mb-4 text-white">
        {editingExpense ? 'Edit Expense' : 'Add an Expense'}
      </h3>

      {/* Search bar for adding payers or groups */}
      <div className="flex items-center border-b mb-4">
        <IconSearch className="text-gray-500" />
        <input
          type="text"
          placeholder="Add friends or groups..."
          className="flex-1 p-2 bg-transparent outline-none text-white"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedPayers.map(payer => (
          <div key={payer.id} className="flex items-center bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-white">
            {payer.displayName}
            <IconX
              className="ml-1 cursor-pointer text-gray-500"
              onClick={() => handleRemove(payer.id)}
            />
          </div>
        ))}
      </div>

      {searchTerm && (
        <div className="mb-4 max-h-32 overflow-y-auto">
          {filteredResults.map(item => (
            <div
              key={item.id}
              className="cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-white"
              onClick={() => handleSelect(item)}
            >
              {item.displayName || item.groupName}
            </div>
          ))}
        </div>
      )}

      <input
        type="text"
        placeholder="Enter a description"
        className="w-full p-2 mb-2 bg-gray-100 dark:bg-gray-700 rounded text-white"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="$ 0.00"
        className="w-full p-2 mb-4 bg-gray-100 dark:bg-gray-700 rounded text-white"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      {/* Category dropdown */}
      <div className="mb-4">
        <label className="block text-white mb-2">Category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded text-white"
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Date input */}
      <div className="mb-4">
        <label className="block text-white mb-2">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded text-white"
        />
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        <span>Paid by you and split equally</span>
        <span>(${amount && selectedPayers.length ? (amount / (selectedPayers.length + 1)).toFixed(2) : '0.00'}/person)</span>
      </div>

      <div className="flex justify-end space-x-2">
        <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
          Cancel
        </button>
        <button onClick={handleSaveExpense} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
          {editingExpense ? 'Update Expense' : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default AddExpenseCard;
