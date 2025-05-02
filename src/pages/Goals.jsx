// import  { useEffect, useState } from 'react';
// import { fetchData, createData, deleteData, editData, fetchExpensessByMonth, fetchIncomesByMonth } from '../services/firestoreService'; 
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { auth } from '../firebase'; 
// import { format } from 'date-fns'; 
// import { motion } from "framer-motion";

// export default function Goals() {
//   const [user] = useAuthState(auth); 
//   const [goals, setGoals] = useState([]);
//   const [formGoal, setFormGoal] = useState({ name: '', description: '', amount: 0, status: 'ongoing' });
//   const [active, setActive] = useState(null); 
//   const [totalSavings, setTotalSavings] = useState(0); 

//   useEffect(() => {
//     if (user) {
//       const loadGoals = async () => {
//         const fetchedGoals = await fetchData("goals", user.uid); 
//         const monthYear = format(new Date(), "MM-yyyy");
//         const fetchExpenses = await fetchExpensessByMonth(user.uid,monthYear);
//         const fetchIncomes = await fetchIncomesByMonth(user.uid,monthYear);
//         const budget = fetchIncomes.reduce((total,income) => total + parseInt(income.amount),0);
//         console.log(budget);
//         console.log(fetchExpenses);
//         const expenses = fetchExpenses.reduce((total, transaction) => parseInt(total) + parseInt(transaction.amount), 0);
//         console.log(expenses);
//         setTotalSavings(budget-expenses);
        
//         setGoals(fetchedGoals);
        
//       };

//       loadGoals();
//     }
//   }, [user]);

//   const calculateProgress = (amount) => {
//     return Math.min((totalSavings / amount) * 100, 100); 
//   };

//   const handleSave = async () => {
//     if (active?.type === 'edit') {
//       // Edit goal
//       await editData("goals", active.id, formGoal);
//       setGoals(goals.map(goal => goal.id === active.id ? { ...goal, ...formGoal } : goal));
//     } else {
//       // Create new goal
//       await createData("goals", formGoal, user.uid);
//       setGoals([...goals, { ...formGoal, userId: user.uid }]);
//     }
//     setActive(null);
//   };

//   return (
//     <div className="p-8 bg-black min-h-screen">
//       <motion.h1
//           initial={{ opacity: 0, y: -30 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-6xl font-extrabold text-center text-indigo-400 mt-8 mb-6"
//         >
//           <span className="text-white">Track Your</span> Goals 🎯
//         </motion.h1>

//       <div className="flex justify-end mb-6">
//         <button
//           onClick={() => {
//             setActive({ type: 'add' });
//             setFormGoal({ name: '', description: '', amount: 0, status: 'ongoing' });
//           }}
//           className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
//         >
//           Add Goal
//         </button>
//       </div>

//       {/* Goal List */}
//       <ul className="space-y-4">
//         {goals.map((goal) => {
//           const progress = calculateProgress(goal.amount); // Calculate progress for each goal
//           return (
//             <li key={goal.id} className="bg-zinc-800 p-6 rounded-lg shadow-md text-white">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="text-xl font-bold">{goal.name}</h2>
//                   <p className="text-sm text-gray-400">{goal.description}</p>
//                   <p className="text-md mt-2">Target: ${goal.amount}</p>
//                   <p className="text-md">Status: {goal.status}</p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => {
//                       setActive({ type: 'edit', id: goal.id });
//                       setFormGoal(goal);
//                     }}
//                     className="px-4 py-2 text-sm rounded-full font-bold bg-blue-500 hover:bg-blue-600 text-white"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => deleteData("goals", goal.id)}
//                     className="px-4 py-2 text-sm rounded-full font-bold bg-red-500 hover:bg-red-600 text-white"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>

//               {/* Progress Bar */}
//               <div className="mt-4">
//                 <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden">
//                   <div
//                     style={{ width: `${progress}%` }}
//                     className="h-full bg-green-500 transition-all"
//                   ></div>
//                 </div>
//                 <p className="text-sm mt-1">{Math.round(progress)}% completed</p>
//               </div>
//             </li>
//           );
//         })}
//       </ul>

//       {/* Add/Edit Goal Form */}
//       {active && (
//         <div className="fixed inset-0 grid place-items-center bg-black bg-opacity-70 z-50">
//           <div className="w-full max-w-lg p-8 bg-white dark:bg-neutral-900 rounded-lg shadow-lg">
//             <h3 className="text-lg font-bold mb-4 text-white">{active.type === 'edit' ? 'Edit Goal' : 'Add New Goal'}</h3>
//             <form className="space-y-4">
//               <div>
//                 <label className="block font-medium text-neutral-600 dark:text-neutral-400">Name</label>
//                 <input
//                   type="text"
//                   value={formGoal.name}
//                   onChange={(e) => setFormGoal({ ...formGoal, name: e.target.value })}
//                   className="w-full p-2 bg-gray-900 text-white rounded-md"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block font-medium text-neutral-600 dark:text-neutral-400">Description</label>
//                 <textarea
//                   value={formGoal.description}
//                   onChange={(e) => setFormGoal({ ...formGoal, description: e.target.value })}
//                   className="w-full p-2 bg-gray-900 text-white rounded-md"
//                   rows="3"
//                 ></textarea>
//               </div>
//               <div>
//                 <label className="block font-medium text-neutral-600 dark:text-neutral-400">Amount</label>
//                 <input
//                   type="number"
//                   value={formGoal.amount}
//                   onChange={(e) => setFormGoal({ ...formGoal, amount: parseFloat(e.target.value) })}
//                   className="w-full p-2 bg-gray-900 text-white rounded-md"
//                   required
//                 />
//               </div>
//               <div className="flex items-center">
//                     <label className="block text-neutral-600 dark:text-neutral-400 mr-2">Status</label>
//                     <select
//                       name="status"
//                       value={formGoal.status}
//                       onChange={(e) => setFormGoal({ ...formGoal, status: e.target.value})}
//                       className="w-full p-2 bg-gray-900 text-white rounded-md"
//                     >
//                       <option value="ongoing">Ongoing</option>
//                       <option value="completed">Completed</option>
//                     </select>
//                   </div>
//             </form>
//             <div className="flex justify-between mt-6">
//               <button
//                 onClick={() => setActive(null)}
//                 className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { fetchData, createData, deleteData, editData, fetchExpensessByMonth, fetchIncomesByMonth } from "../services/firestoreService"; 
// import { useAuthState } from "react-firebase-hooks/auth";
// import { auth } from "../firebase"; 
// import { format } from "date-fns"; 
// import { motion } from "framer-motion";

// export default function Goals() {
//   const [user] = useAuthState(auth); 
//   const [goals, setGoals] = useState([]);
//   const [formGoal, setFormGoal] = useState({ name: '', description: '', amount: 0, status: 'ongoing', allocatedAmount: 0 });
//   const [active, setActive] = useState(null); 
//   const [totalSavings, setTotalSavings] = useState(0); 

//   useEffect(() => {
//     if (user) {
//       const loadGoals = async () => {
//         const fetchedGoals = await fetchData("goals", user.uid); 
//         const monthYear = format(new Date(), "MM-yyyy");
//         const fetchExpenses = await fetchExpensessByMonth(user.uid, monthYear);
//         const fetchIncomes = await fetchIncomesByMonth(user.uid, monthYear);
//         const budget = fetchIncomes.reduce((total, income) => total + parseInt(income.amount), 0);
//         const expenses = fetchExpenses.reduce((total, transaction) => parseInt(total) + parseInt(transaction.amount), 0);
//         setTotalSavings(budget - expenses);
//         setGoals(fetchedGoals);
//       };

//       loadGoals();
//     }
//   }, [user]);

//   const calculateProgress = (allocated, target) => {
//     return Math.min((allocated / target) * 100, 100);
//   };

//   const calculateMonthsToComplete = (allocated, target) => {
//     if (allocated <= 0) return "N/A";
//     return Math.ceil(target / allocated);
//   };

//   const handleSave = async () => {
//     if (active?.type === 'edit') {
//       await editData("goals", active.id, formGoal);
//       setGoals(goals.map(goal => goal.id === active.id ? { ...goal, ...formGoal } : goal));
//     } else {
//       await createData("goals", formGoal, user.uid);
//       setGoals([...goals, { ...formGoal, userId: user.uid }]);
//     }
//     setActive(null);
//   };

//   return (
//     <div className="p-8 bg-black min-h-screen">
//       <motion.h1
//         initial={{ opacity: 0, y: -30 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="text-6xl font-extrabold text-center text-indigo-400 mt-8 mb-6"
//       >
//         <span className="text-white">Track Your</span> Goals 🎯
//       </motion.h1>

//       <div className="flex justify-end mb-6">
//         <button
//           onClick={() => {
//             setActive({ type: 'add' });
//             setFormGoal({ name: '', description: '', amount: 0, status: 'ongoing', allocatedAmount: 0 });
//           }}
//           className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
//         >
//           Add Goal
//         </button>
//       </div>

//       {/* Goal List */}
//       <ul className="space-y-4">
//         {goals.map((goal) => {
//           const progress = calculateProgress(goal.allocatedAmount, goal.amount); // Calculate progress for each goal
//           const monthsToComplete = calculateMonthsToComplete(goal.allocatedAmount, goal.amount);

//           return (
//             <li key={goal.id} className="bg-zinc-800 p-6 rounded-lg shadow-md text-white">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="text-xl font-bold">{goal.name}</h2>
//                   <p className="text-sm text-gray-400">{goal.description}</p>
//                   <p className="text-md mt-2">Target: ${goal.amount}</p>
//                   <p className="text-md">Status: {goal.status}</p>
//                   <p className="text-md">Allocated per Month: ${goal.allocatedAmount}</p>
//                   <p className="text-md">Estimated Completion: {monthsToComplete} month(s)</p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => {
//                       setActive({ type: 'edit', id: goal.id });
//                       setFormGoal(goal);
//                     }}
//                     className="px-4 py-2 text-sm rounded-full font-bold bg-blue-500 hover:bg-blue-600 text-white"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => deleteData("goals", goal.id)}
//                     className="px-4 py-2 text-sm rounded-full font-bold bg-red-500 hover:bg-red-600 text-white"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>

//               {/* Progress Bar */}
//               <div className="mt-4">
//                 <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden">
//                   <div
//                     style={{ width: `${progress}%` }}
//                     className="h-full bg-green-500 transition-all"
//                   ></div>
//                 </div>
//                 <p className="text-sm mt-1">{Math.round(progress)}% completed</p>
//               </div>
//             </li>
//           );
//         })}
//       </ul>

//       {/* Add/Edit Goal Form */}
//       {active && (
//         <div className="fixed inset-0 grid place-items-center bg-black bg-opacity-70 z-50">
//           <div className="w-full max-w-lg p-8 bg-white dark:bg-neutral-900 rounded-lg shadow-lg">
//             <h3 className="text-lg font-bold mb-4 text-white">{active.type === 'edit' ? 'Edit Goal' : 'Add New Goal'}</h3>
//             <form className="space-y-4">
//               <div>
//                 <label className="block font-medium text-neutral-600 dark:text-neutral-400">Name</label>
//                 <input
//                   type="text"
//                   value={formGoal.name}
//                   onChange={(e) => setFormGoal({ ...formGoal, name: e.target.value })}
//                   className="w-full p-2 bg-gray-900 text-white rounded-md"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block font-medium text-neutral-600 dark:text-neutral-400">Description</label>
//                 <textarea
//                   value={formGoal.description}
//                   onChange={(e) => setFormGoal({ ...formGoal, description: e.target.value })}
//                   className="w-full p-2 bg-gray-900 text-white rounded-md"
//                   rows="3"
//                 ></textarea>
//               </div>
//               <div>
//                 <label className="block font-medium text-neutral-600 dark:text-neutral-400">Target Amount</label>
//                 <input
//                   type="number"
//                   value={formGoal.amount}
//                   onChange={(e) => setFormGoal({ ...formGoal, amount: parseFloat(e.target.value) })}
//                   className="w-full p-2 bg-gray-900 text-white rounded-md"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block font-medium text-neutral-600 dark:text-neutral-400">Allocate per Month</label>
//                 <input
//                   type="number"
//                   value={formGoal.allocatedAmount}
//                   onChange={(e) => setFormGoal({ ...formGoal, allocatedAmount: parseFloat(e.target.value) })}
//                   className="w-full p-2 bg-gray-900 text-white rounded-md"
//                 />
//               </div>
//               <div>
//                 <label className="block text-neutral-600 dark:text-neutral-400">Status</label>
//                 <select
//                   value={formGoal.status}
//                   onChange={(e) => setFormGoal({ ...formGoal, status: e.target.value })}
//                   className="w-full p-2 bg-gray-900 text-white rounded-md"
//                 >
//                   <option value="ongoing">Ongoing</option>
//                   <option value="completed">Completed</option>
//                 </select>
//               </div>
//             </form>
//             <div className="flex justify-between mt-6">
//               <button
//                 onClick={() => setActive(null)}
//                 className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { fetchData, createData, deleteData, editData, fetchExpensessByMonth, fetchIncomesByMonth } from "../services/firestoreService"; 
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase"; 
import { format, differenceInMonths } from "date-fns"; 
import { motion } from "framer-motion";

export default function Goals() {
  const [user] = useAuthState(auth); 
  const [goals, setGoals] = useState([]);
  const [formGoal, setFormGoal] = useState({ 
    name: '', 
    description: '', 
    amount: 0, 
    status: 'ongoing', 
    contributions: 0, 
    endDate: '', 
    allocatedAmount: 0 
  });
  const [contributeGoal, setContributeGoal] = useState(null);
  const [totalSavings, setTotalSavings] = useState(0); 
  const [monthlyContributions, setMonthlyContributions] = useState(0);
  const [contributionAmount, setContributionAmount] = useState('');
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (user) {
      const loadGoals = async () => {
        const fetchedGoals = await fetchData("goals", user.uid); 
        const monthYear = format(new Date(), "MM-yyyy");
        const fetchExpenses = await fetchExpensessByMonth(user.uid, monthYear);
        const fetchIncomes = await fetchIncomesByMonth(user.uid, monthYear);
        const budget = fetchIncomes.reduce((total, income) => total + parseInt(income.amount), 0);
        const expenses = fetchExpenses.reduce((total, transaction) => parseInt(total) + parseInt(transaction.amount), 0);
        const savings = budget - expenses;

        const contributions = fetchedGoals.reduce((total, goal) => total + (goal.contributions || 0), 0);

        setTotalSavings(savings);
        setMonthlyContributions(contributions);
        setGoals(fetchedGoals);
      };

      loadGoals();
    }
  }, [user]);

  const calculateProgress = (contributions, target) => {
    return Math.min((contributions / target) * 100, 100);
  };

  const calculateRemainingMonths = (endDate) => {
    const currentDate = new Date();
    const end = new Date(endDate);
    return differenceInMonths(end, currentDate) + 1;
  };

  const handleSave = async () => {
    if (active?.type === 'edit') {
      await editData("goals", active.id, formGoal);
      setGoals(goals.map(goal => goal.id === active.id ? { ...goal, ...formGoal } : goal));
    } else {
      await createData("goals", formGoal, user.uid);
      setGoals([...goals, { ...formGoal, userId: user.uid }]);
    }
    setActive(null);
  };

  const handleAddContribution = async () => {
    const contribution = parseFloat(contributionAmount);

    if (monthlyContributions + contribution > totalSavings) {
      alert("Contribution exceeds your monthly savings.");
      return;
    }

    const updatedGoal = {
      ...contributeGoal,
      contributions: (contributeGoal.contributions || 0) + contribution,
    };

    await editData("goals", contributeGoal.id, updatedGoal);
    setGoals(goals.map(goal => (goal.id === contributeGoal.id ? updatedGoal : goal)));
    setMonthlyContributions(monthlyContributions + contribution);
    setContributeGoal(null);
    setContributionAmount('');
  };

  return (
    <div className="p-8 bg-black min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl font-extrabold text-center text-indigo-400 mt-8 mb-6"
      >
        <span className="text-white">Track Your</span> Goals 🎯
      </motion.h1>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setActive({ type: 'add' });
            setFormGoal({ name: '', description: '', amount: 0, status: 'ongoing', contributions: 0, endDate: '', allocatedAmount: 0 });
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
        >
          Add Goal
        </button>
      </div>

      <ul className="space-y-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.contributions, goal.amount);
          const remainingMonths = calculateRemainingMonths(goal.endDate);

          return (
            <li key={goal.id} className="bg-zinc-800 p-6 rounded-lg shadow-md text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{goal.name}</h2>
                  <p className="text-sm text-gray-400">{goal.description}</p>
                  <p className="text-md mt-2">Target: ${goal.amount}</p>
                  <p className="text-md">Status: {goal.status}</p>
                  <p className="text-md">Total Contributions: ${goal.contributions || 0}</p>
                  <p className="text-md">Remaining Months: {remainingMonths}</p>
                  <p className="text-md">End Date: {goal.endDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActive({ type: 'edit', id: goal.id });
                      setFormGoal(goal);
                    }}
                    className="px-4 py-2 text-sm rounded-full font-bold bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteData("goals", goal.id)}
                    className="px-4 py-2 text-sm rounded-full font-bold bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setContributeGoal(goal)}
                    className="px-4 py-2 text-sm rounded-full font-bold bg-green-500 hover:bg-green-600 text-white"
                  >
                    Contribute
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-green-500 transition-all"
                  ></div>
                </div>
                <p className="text-sm mt-1">{Math.round(progress)}% completed</p>
              </div>
            </li>
          );
        })}
      </ul>

      {contributeGoal && (
        <div className="fixed inset-0 grid place-items-center bg-black bg-opacity-70 z-50">
          <div className="w-full max-w-md p-8 bg-white dark:bg-neutral-900 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-white">Add Contribution</h3>
            <input
              type="number"
              placeholder="Enter amount"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              className="w-full p-2 bg-gray-900 text-white rounded-md"
            />
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setContributeGoal(null)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContribution}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
              >
                Contribute
              </button>
            </div>
          </div>
        </div>
      )}
      {active && (
        <div className="fixed inset-0 grid place-items-center bg-black bg-opacity-70 z-50">
          <div className="w-full max-w-lg p-8 bg-white dark:bg-neutral-900 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-white">{active.type === 'edit' ? 'Edit Goal' : 'Add New Goal'}</h3>
            <form className="space-y-4">
              <div>
                <label className="block font-medium text-neutral-600 dark:text-neutral-400">Name</label>
                <input
                  type="text"
                  value={formGoal.name}
                  onChange={(e) => setFormGoal({ ...formGoal, name: e.target.value })}
                  className="w-full p-2 bg-gray-900 text-white rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-neutral-600 dark:text-neutral-400">Description</label>
                <textarea
                  value={formGoal.description}
                  onChange={(e) => setFormGoal({ ...formGoal, description: e.target.value })}
                  className="w-full p-2 bg-gray-900 text-white rounded-md"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label className="block font-medium text-neutral-600 dark:text-neutral-400">Target Amount</label>
                <input
                  type="number"
                  value={formGoal.amount}
                  onChange={(e) => setFormGoal({ ...formGoal, amount: parseFloat(e.target.value) })}
                  className="w-full p-2 bg-gray-900 text-white rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-neutral-600 dark:text-neutral-400">End Date</label>
                <input
                  type="date"
                  value={formGoal.endDate}
                  onChange={(e) => setFormGoal({ ...formGoal, endDate: e.target.value })}
                  className="w-full p-2 bg-gray-900 text-white rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400">Status</label>
                <select
                  value={formGoal.status}
                  onChange={(e) => setFormGoal({ ...formGoal, status: e.target.value })}
                  className="w-full p-2 bg-gray-900 text-white rounded-md"
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </form>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setActive(null)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

