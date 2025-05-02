import { useEffect, useState } from "react";
import { fetchTransactionsByMonth, checkCategoryLimits } from "../services/firestoreService"; // Firestore functions
import { fetchData, createData } from "../services/firestoreService"; // For fetching and creating budget/income
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase"; // Firebase Authentication
import { format } from "date-fns";

export default function Summary() {
  const [user] = useAuthState(auth); // Get the current authenticated user
  const [transactions, setTransactions] = useState({});
  const [categories, setCategories] = useState([]);
  const [budget, setBudget] = useState(0);
  const [income, setIncome] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MM-yyyy")); // Current month

  const groupExpensesByMonth = (transactions) => {
    return transactions.reduce((acc, transaction) => {
      const month = format(new Date(transaction.date), "MMMM yyyy");
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(transaction);
      return acc;
    }, {});
  };
  useEffect(() => {
    if (user) {
      // Fetch transactions and categories for the selected month
      const loadData = async () => {
        const monthTransactions = await fetchTransactionsByMonth(user.uid, selectedMonth);
        const fetchedCategories = await fetchData("categories", user.uid);
        setTransactions(groupExpensesByMonth(monthTransactions)); // Group transactions by month
        setCategories(fetchedCategories);
        console.log(categories);
        // Check if any category limits are approaching
        const newAlerts = checkCategoryLimits(monthTransactions, fetchedCategories);
        setAlerts(newAlerts);
        setLoading(false);
      };

      loadData();
    }
  }, [user, selectedMonth]);

  // Handle setting budget and income for a specific month
  const handleSaveBudget = async () => {
    const budgetData = { budget, income, month: selectedMonth };
    await createData("budgets", budgetData, user.uid); // Save budget in Firestore
    alert("Budget and income saved for the month.");
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-indigo-600">Monthly Budget Tracker</h1>

      {/* Month Selector */}
      <div className="flex justify-center mt-4">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Budget and Income Input */}
      <div className="flex justify-center mt-4">
        <div className="flex flex-col items-start">
          <label className="text-lg">Set Budget for {selectedMonth}</label>
          <input
            type="number"
            placeholder="Budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="p-2 border border-gray-300 rounded mt-2"
          />
          <input
            type="number"
            placeholder="Income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="p-2 border border-gray-300 rounded mt-2"
          />
          <button onClick={handleSaveBudget} className="bg-green-500 text-white py-2 px-4 mt-4 rounded">
            Save Budget & Income
          </button>
        </div>
      </div>

      {/* Display Alerts */}
      {alerts.length > 0 && (
        <div className="mt-4 bg-red-100 text-red-800 p-4 rounded">
          <h2 className="font-bold">Alerts:</h2>
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Grouped Transactions */}
      {Object.keys(transactions).map((month) => (
        <div key={month} className="mt-8">
          <h2 className="text-2xl font-bold text-indigo-600">{month}</h2>
          <div className="mt-4">
            {transactions[month].map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 border-l-4 mb-2"
                style={{
                  borderColor: transaction.type === "Expense" ? "green" : "red",
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold">${transaction.amount}</p>
                    <p>{transaction.category} - {transaction.type}</p>
                  </div>
                  <p>{format(new Date(transaction.date), "MM/dd/yyyy")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
