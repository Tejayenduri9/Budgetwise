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
  const [contributionAmount, setContributionAmount] = useState('');
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (user) {
      const loadGoals = async () => {
        const fetchedGoals = await fetchData("goals", user.uid); 
        const monthYear = format(new Date(), "MM-yyyy");
        const fetchExpenses = await fetchExpensessByMonth(user.uid, monthYear);
        const fetchIncomes = await fetchIncomesByMonth(user.uid, monthYear);
        const budget = fetchIncomes.reduce((total, income) => total + parseInt(income.amount), 0);
        const expenses = fetchExpenses.reduce((total, transaction) => total + parseInt(transaction.amount), 0);
        const contributions = fetchedGoals.reduce((total, goal) => total + (goal.contributions || 0), 0);
        const savings = budget - expenses - contributions;

        setTotalSavings(savings);
        setGoals(fetchedGoals);
      };

      loadGoals();
    }
  }, [user]);

  const calculateProgress = (contributions, target) => Math.min((contributions / target) * 100, 100);
  const getProgressColor = (progress) => progress < 30 ? 'bg-red-500' : progress < 70 ? 'bg-yellow-500' : 'bg-green-500';
  const calculateRemainingMonths = (endDate) => differenceInMonths(new Date(endDate), new Date()) + 1;

  const handleSave = async () => {
    if (active?.type === 'edit') {
      await editData("goals", active.id, formGoal);
      setGoals(goals.map(goal => goal.id === active.id ? { ...goal, ...formGoal } : goal));
    } else {
      const newGoalId = await createData("goals", formGoal, user.uid);
      setGoals([...goals, { ...formGoal, id: newGoalId, userId: user.uid }]);
    }
    setActive(null);
  };

  const handleAddContribution = async () => {
    const contribution = parseFloat(contributionAmount);
    if (contribution > totalSavings) return alert("Not enough savings to contribute this amount.");

    const updatedGoal = {
      ...contributeGoal,
      contributions: (contributeGoal.contributions || 0) + contribution,
    };

    await editData("goals", contributeGoal.id, updatedGoal);
    setGoals(goals.map(goal => goal.id === contributeGoal.id ? updatedGoal : goal));
    setTotalSavings(prev => prev - contribution);
    setContributeGoal(null);
    setContributionAmount('');
  };

  return (
    <div className="p-8 bg-black min-h-screen">
      <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-6xl font-extrabold text-center text-indigo-400 mt-8 mb-6">
        <span className="text-white">Track Your</span> Goals 🎯
      </motion.h1>

      <div className="bg-zinc-800 shadow-md p-4 rounded-lg mb-6 w-fit text-white">
        <h3 className="text-lg font-semibold">Current Savings</h3>
        <p className="text-2xl font-bold text-green-400">${totalSavings.toFixed(2)}</p>
      </div>

      <div className="flex justify-end mb-6">
        <button onClick={() => {
          setActive({ type: 'add' });
          setFormGoal({ name: '', description: '', amount: 0, status: 'ongoing', contributions: 0, endDate: '', allocatedAmount: 0 });
        }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">
          Add Goal
        </button>
      </div>

      <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = calculateProgress(goal.contributions, goal.amount);
          const remainingMonths = calculateRemainingMonths(goal.endDate);

          return (
            <li key={goal.id} className="bg-zinc-800 p-6 rounded-lg shadow-md text-white">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold capitalize">{goal.name}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setActive({ type: 'edit', id: goal.id }); setFormGoal(goal); }} className="px-3 py-1 text-sm rounded-full font-bold bg-blue-500 hover:bg-blue-600">✏️</button>
                  <button onClick={async () => { await deleteData("goals", goal.id); setGoals(goals.filter(g => g.id !== goal.id)); }} className="px-3 py-1 text-sm rounded-full font-bold bg-red-500 hover:bg-red-600">🗑</button>
                  <button onClick={() => setContributeGoal(goal)} className="px-3 py-1 text-sm rounded-full font-bold bg-green-500 hover:bg-green-600">💰</button>
                </div>
              </div>
              <p>Target: ${goal.amount}</p>
              <p>Status: {goal.status}</p>
              <p>Total Contributions: ${goal.contributions || 0}</p>
              <p>Remaining Months: {remainingMonths}</p>
              <p>End Date: {goal.endDate}</p>

              <div className="mt-4">
                <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div style={{ width: `${progress}%` }} className={`h-full ${getProgressColor(progress)} transition-all`}></div>
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
            <input type="number" placeholder="Enter amount" value={contributionAmount} onChange={(e) => setContributionAmount(e.target.value)} className="w-full p-2 bg-gray-900 text-white rounded-md" />
            <div className="flex justify-between mt-6">
              <button onClick={() => setContributeGoal(null)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
              <button onClick={handleAddContribution} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">Contribute</button>
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
                <input type="text" value={formGoal.name} onChange={(e) => setFormGoal({ ...formGoal, name: e.target.value })} className="w-full p-2 bg-gray-900 text-white rounded-md" required />
              </div>
              <div>
                <label className="block font-medium text-neutral-600 dark:text-neutral-400">Description</label>
                <textarea value={formGoal.description} onChange={(e) => setFormGoal({ ...formGoal, description: e.target.value })} className="w-full p-2 bg-gray-900 text-white rounded-md" rows="3"></textarea>
              </div>
              <div>
                <label className="block font-medium text-neutral-600 dark:text-neutral-400">Target Amount</label>
                <input type="number" value={formGoal.amount} onChange={(e) => setFormGoal({ ...formGoal, amount: parseFloat(e.target.value) })} className="w-full p-2 bg-gray-900 text-white rounded-md" required />
              </div>
              <div>
                <label className="block font-medium text-neutral-600 dark:text-neutral-400">End Date</label>
                <input type="date" value={formGoal.endDate} onChange={(e) => setFormGoal({ ...formGoal, endDate: e.target.value })} className="w-full p-2 bg-gray-900 text-white rounded-md" required />
              </div>
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400">Status</label>
                <select value={formGoal.status} onChange={(e) => setFormGoal({ ...formGoal, status: e.target.value })} className="w-full p-2 bg-gray-900 text-white rounded-md">
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </form>
            <div className="flex justify-between mt-6">
              <button onClick={() => setActive(null)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
              <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
