// import { useState, useEffect } from 'react';
// import { db } from '../firebase';
// import { collection, getDocs, query, where } from 'firebase/firestore';
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { auth } from '../firebase';
// import AddExpenseCard from '../components/AddExpenseCard';

// const Dashboard = () => {
//   const [user] = useAuthState(auth);
//   const [loading, setLoading] = useState(true);
//   const [totalOwed, setTotalOwed] = useState(0);
//   const [totalOwe, setTotalOwe] = useState(0);
//   const [friendsBalance, setFriendsBalance] = useState([]);
//   const [showAddExpenseCard, setShowAddExpenseCard] = useState(false);
//   useEffect(() => {
//     const fetchExpensesAndFriends = async () => {
//       if (!user) return;

//       const expensesRef = collection(db, 'expenses');
//       const snapshot = await getDocs(expensesRef);

//       let totalOwedAmount = 0;
//       let totalOweAmount = 0;
//       const balanceByFriend = {};

//       snapshot.forEach((doc) => {
//         const expense = doc.data();
//         const { createdBy, payers } = expense;

//         payers.forEach((payer) => {
//           if (payer.userId === user.uid && !payer.settled) {
//             if (createdBy !== user.uid) {
//               totalOweAmount += payer.share;
//               balanceByFriend[createdBy] = (balanceByFriend[createdBy] || 0) - payer.share;
//             }
//           } else if (createdBy === user.uid && payer.userId !== user.uid && !payer.settled) {
//             totalOwedAmount += payer.share;
//             balanceByFriend[payer.userId] = (balanceByFriend[payer.userId] || 0) + payer.share;
//           }
//         });
//       });

//       setTotalOwed(totalOwedAmount);
//       setTotalOwe(totalOweAmount);

//       // Fetch friends' names based on friend IDs in balanceByFriend

//       const friendIds = Object.keys(balanceByFriend);
//       if(friendIds.length >0){
//       const friendsRef = collection(db, 'users');
//       const friendsSnapshot = await getDocs(query(friendsRef, where('userId', 'in', friendIds)));

//       const balanceList = friendsSnapshot.docs.map(doc => {
//         const friendData = doc.data();
//         return {
//           friendId: friendData.userId,
//           friendName: friendData.displayName,
//           balance: balanceByFriend[friendData.userId],
//         };
//       });

      
//       setFriendsBalance(balanceList);
//     }
//       setLoading(false);
//     };

//     fetchExpensesAndFriends();
//   }, [user]);

//   const handleSaveExpense = () => {
//     // setExpenses(prevExpenses =>
//     //   prevExpenses.map(expense =>
//     //     expense.id === updatedExpense.id ? updatedExpense : expense
//     //   )
//     // );
//     setShowAddExpenseCard(false);
//   };
//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4 text-white">Dashboard</h2>

//       <div className='flex justify-end'>
//       <button
//           className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md my-6"
//           onClick={() => setShowAddExpenseCard(true)}
//         >
//           Add Expense
//         </button>
//         </div>
//         {showAddExpenseCard && (
//           <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//             <AddExpenseCard
//               friends={[]}
//               groups={[]}
//               onSave={handleSaveExpense}
//               onClose={() => setShowAddExpenseCard(false)}
//             />
//           </div>
//         )}
//       <div className="flex  gap-4 mb-8">
//         <div className="bg-green-100 p-4 rounded shadow w-full md:w-1/2">
//           <h3 className="text-xl font-semibold text-green-600">Total Owed to You</h3>
//           <p className="text-2xl">${totalOwed.toFixed(2)}</p>
//         </div>
//         <div className="bg-red-100 p-4 rounded shadow w-full md:w-1/2">
//           <h3 className="text-xl font-semibold text-red-600">Total You Owe</h3>
//           <p className="text-2xl">${totalOwe.toFixed(2)}</p>
//         </div>
//       </div>

//       <h3 className="text-xl font-semibold mb-4 text-white">Friends Balances</h3>
//       <ul className="bg-white shadow rounded-lg p-4 space-y-4">
//         {Object.keys(friendsBalance).length>0 ? friendsBalance.map((friend) => (
//           <li key={friend.friendId} className="flex justify-between py-2 border-b last:border-0">
//             <span className="font-medium">{friend.friendName}</span>
//             <span
//               className={`font-semibold ${
//                 friend.balance > 0 ? 'text-green-600' : 'text-red-600'
//               }`}
//             >
//               {friend.balance > 0 ? `Owes you $${friend.balance.toFixed(2)}` : `You owe $${Math.abs(friend.balance).toFixed(2)}`}
//             </span>
//           </li>
//         )): "Every one is settled for now"}
//       </ul>
//     </div>
//   );
// };

// export default Dashboard;

import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import AddExpenseCard from '../components/AddExpenseCard';

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalOwe, setTotalOwe] = useState(0);
  const [friendsBalance, setFriendsBalance] = useState([]);
  const [expensesByFriend, setExpensesByFriend] = useState({});
  const [expandedFriend, setExpandedFriend] = useState(null); // For dropdown toggle
  const [showAddExpenseCard, setShowAddExpenseCard] = useState(false);

  useEffect(() => {
    const fetchExpensesAndFriends = async () => {
      if (!user) return;

      const expensesRef = collection(db, 'expenses');
      const snapshot = await getDocs(expensesRef);

      let totalOwedAmount = 0;
      let totalOweAmount = 0;
      const balanceByFriend = {};
      const expensesGroupedByFriend = {};

      snapshot.forEach((doc) => {
        const expense = doc.data();
        const { createdBy, payers } = expense;

        payers.forEach((payer) => {
          if (payer.userId === user.uid && !payer.settled) {
            if (createdBy !== user.uid) {
              totalOweAmount += payer.share;
              balanceByFriend[payer.userId] = (balanceByFriend[payer.userId] || 0) - payer.share;

              // Group expenses by friend
              if (!expensesGroupedByFriend[payer.userId]) expensesGroupedByFriend[payer.userId] = [];
              expensesGroupedByFriend[payer.userId].push({
                description: expense.description,
                amount: payer.share,
                type: "take"
              });
            }
          } else if (createdBy === user.uid && payer.userId !== user.uid && !payer.settled) {
            totalOwedAmount += payer.share;
            balanceByFriend[payer.userId] = (balanceByFriend[payer.userId] || 0) + payer.share;

            // Group expenses by friend
            if (!expensesGroupedByFriend[payer.userId]) expensesGroupedByFriend[payer.userId] = [];
            expensesGroupedByFriend[payer.userId].push({
              description: expense.description,
              amount: payer.share,
              type:"give"
            });
          }
        });
      });

      setTotalOwed(totalOwedAmount);
      setTotalOwe(totalOweAmount);

      // Fetch friends' names based on friend IDs in balanceByFriend
      const friendIds = Object.keys(balanceByFriend);
      if (friendIds.length > 0) {
        const friendsRef = collection(db, 'users');
        const friendsSnapshot = await getDocs(query(friendsRef, where('userId', 'in', friendIds)));

        const balanceList = friendsSnapshot.docs.map(doc => {
          const friendData = doc.data();
          return {
            friendId: friendData.userId,
            friendName: friendData.displayName,
            balance: balanceByFriend[friendData.userId],
          };
        });

        setFriendsBalance(balanceList);
      }

      setExpensesByFriend(expensesGroupedByFriend);
      setLoading(false);
    };

    fetchExpensesAndFriends();
  }, [user]);

  const handleSaveExpense = () => {
    setShowAddExpenseCard(false);
  };

  const toggleFriendDetails = (friendId) => {
    setExpandedFriend((prev) => (prev === friendId ? null : friendId));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Dashboard</h2>

      <div className="flex justify-end">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md my-6"
          onClick={() => setShowAddExpenseCard(true)}
        >
          Add Expense
        </button>
      </div>

      {showAddExpenseCard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <AddExpenseCard
            friends={[]}
            groups={[]}
            onSave={handleSaveExpense}
            onClose={() => setShowAddExpenseCard(false)}
          />
        </div>
      )}

      <div className="flex gap-4 mb-8">
        <div className="bg-green-100 p-4 rounded shadow w-full md:w-1/2">
          <h3 className="text-xl font-semibold text-green-600">Total Owed to You</h3>
          <p className="text-2xl">${totalOwed.toFixed(2)}</p>
        </div>
        <div className="bg-red-100 p-4 rounded shadow w-full md:w-1/2">
          <h3 className="text-xl font-semibold text-red-600">Total You Owe</h3>
          <p className="text-2xl">${totalOwe.toFixed(2)}</p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-white">Friends Balances</h3>
      <ul className="bg-white shadow rounded-lg p-4 space-y-4">
        {friendsBalance.length > 0 ? (
          friendsBalance.map((friend) => friend.friendId !== user.uid ? (
            <li key={friend.friendId} className="border-b last:border-0 pb-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleFriendDetails(friend.friendId)}
              >
                <span className="font-medium">{friend.friendName}</span>
                <span
                  className={`font-semibold ${
                    friend.balance > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {friend.balance > 0
                    ? `Owes you $${friend.balance.toFixed(2)}`
                    : `You owe $${Math.abs(friend.balance).toFixed(2)}`}
                </span>
              </div>

              {expandedFriend === friend.friendId && (
                <ul className="mt-2 pl-4 space-y-2">
                  {expensesByFriend[friend.friendId]?.map((expense, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span>{expense.description}</span>
                      <span className={expense.type ==="take" ?"text-red-400" :"text-green-400" }>${expense.amount.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ): "")
        ) : (
          <p className="text-center">Everyone is settled for now.</p>
        )}
      </ul>
      <h3 className="text-xl font-semibold mb-4 text-white mt-4">Your Balances</h3>
      <ul className="bg-white shadow rounded-lg p-4 space-y-4">
      {friendsBalance.length > 0 ? (
          friendsBalance.map((friend) => friend.friendId === user.uid ? (
            <li key={friend.friendId} className="border-b last:border-0 pb-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleFriendDetails(friend.friendId)}
              >
                <span className="font-medium">You</span>
                <span
                  className={`font-semibold ${
                    friend.balance > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {friend.balance > 0
                    ? `Owes you $${friend.balance.toFixed(2)}`
                    : `You owe $${Math.abs(friend.balance).toFixed(2)}`}
                </span>
              </div>

              {expandedFriend === friend.friendId && (
                <ul className="mt-2 pl-4 space-y-2">
                  {expensesByFriend[friend.friendId]?.map((expense, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span>{expense.description}</span>
                      <span className={expense.type ==="take" ?"text-red-400" :"text-green-400" }>${expense.amount.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ): "")
        ) : (
          <p className="text-center">Everyone is settled for now.</p>
        )}
        </ul>
    </div>
  );
};

export default Dashboard;

