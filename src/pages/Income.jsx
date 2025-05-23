import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchData, createData, deleteData, editData } from "../services/firestoreService";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { format } from "date-fns";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";

export default function Incomes() {
  const [active, setActive] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const [filterDate, setFilterDate] = useState("");

  const [formBudget, setFormBudget] = useState({
    amount: "",
    date: "",
    category: "Rental income",
  });

  const categories = ["Rental income", "Job", "Crypto", "Stock"];

  useEffect(() => {
    if (user) {
      const loadBudgets = async () => {
        setLoading(true);
        let fetchedBudgets = [];

        if (filterDate) {
          const normalizedDate = new Date(filterDate).toISOString().slice(0, 10); // ✅ normalize to YYYY-MM-DD
          fetchedBudgets = await fetchIncomesByDate(user.uid, normalizedDate);
        } else {
          fetchedBudgets = await fetchData("incomes", user.uid);
        }

        setBudgets(fetchedBudgets);
        setLoading(false);
      };

      loadBudgets();
    }
  }, [user, filterDate]);

  const fetchIncomesByDate = async (userId, dateStr) => {
    try {
      const dateObj = new Date(dateStr);
  
      const startUTC = new Date(dateObj);
      startUTC.setUTCHours(0, 0, 0, 0); // ✅ force to 00:00 UTC
  
      const endUTC = new Date(dateObj);
      endUTC.setUTCHours(24, 0, 0, 0); // ✅ force to 24:00 UTC
  
      const incomesRef = collection(db, "incomes");
      const q = query(
        incomesRef,
        where("userId", "==", userId),
        where("date", ">=", Timestamp.fromDate(startUTC)),
        where("date", "<", Timestamp.fromDate(endUTC))
      );
  
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching incomes by date:", error);
      return [];
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormBudget((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const [year, month, day] = formBudget.date.split("-");
    const selectedDate = new Date(year, month - 1, day);
    const firestoreDate = Timestamp.fromDate(selectedDate);
    const monthYear = format(selectedDate, "MM-yyyy");

    const budgetWithMonthYear = {
      ...formBudget,
      date: firestoreDate,
      monthYear,
    };

    if (active?.type === "edit") {
      await editData("incomes", active.id, budgetWithMonthYear);
      setBudgets(
        budgets.map((budget) =>
          budget.id === active.id ? { ...budget, ...budgetWithMonthYear } : budget
        )
      );
    } else {
      await createData("incomes", budgetWithMonthYear, user.uid);
      setBudgets([...budgets, { ...budgetWithMonthYear, userId: user.uid }]);
    }

    setActive(null);
  };

  const handleDelete = async (budgetId) => {
    await deleteData("incomes", budgetId);
    setBudgets(budgets.filter((budget) => budget.id !== budgetId));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="relative">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-extrabold text-center text-indigo-400 mt-8 mb-6"
        >
          <span className="text-white">Manage Your</span> Incomes 💰
        </motion.h1>

        <div className="flex justify-end">
          <button
            onClick={() => {
              setActive({ type: "add" });
              setFormBudget({ amount: "", date: "", category: "Rental income" });
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Add Income
          </button>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col items-center mt-6">
          <div className="flex items-center gap-2 bg-neutral-800 text-white px-4 py-2 rounded-xl shadow-md">
            <label className="text-sm font-medium text-gray-300">Filter by Date:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-neutral-700 text-white px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="mt-2 text-sm text-red-500 hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.div className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden">
              <div className="p-6">
                <motion.h3 className="font-bold text-neutral-700 dark:text-neutral-200">
                  {active.type === "edit" ? `Edit Income` : "Add New Income"}
                </motion.h3>
                <form className="space-y-4 mt-4">
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={formBudget.amount}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formBudget.date}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Category</label>
                    <select
                      name="category"
                      value={formBudget.category}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setActive(null)}
                    className="px-4 py-2 text-sm rounded-full font-bold bg-red-600 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm rounded-full font-bold bg-green-600 text-white"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Income List */}
      <ul className="max-w-2xl mx-auto w-full gap-4 mt-6">
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const budgetDate = budget.date?.toDate?.() ?? new Date(budget.date);
            const day = format(budgetDate, "d");
            const monthShort = format(budgetDate, "MMM");

            return (
              <motion.div
                key={budget.id}
                className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                style={{ borderLeft: "5px solid green" }}
              >
                <div className="flex gap-4 items-center">
                  <div>
                    <div className="text-3xl font-bold text-indigo-500">{day}</div>
                    <div className="text-sm text-neutral-500 uppercase">{monthShort}</div>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-neutral-800 dark:text-neutral-200">
                      {budget.category}
                    </h3>
                    <p className="text-neutral-800 dark:text-neutral-200 font-semibold">
                      Amount: ${budget.amount}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-blue-500 hover:text-white text-black mt-4 md:mt-0"
                    onClick={() => {
                      setActive({ type: "edit", id: budget.id });
                      setFormBudget({
                        ...budget,
                        date: format(
                          budget.date?.toDate?.() ?? new Date(budget.date),
                          "yyyy-MM-dd"
                        ),
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-2 text-sm rounded-full font-bold bg-red-500 hover:bg-red-600 text-white mt-4 md:mt-0"
                    onClick={() => handleDelete(budget.id)}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-center mt-6">
            No incomes found{filterDate ? " for the selected date." : "."}
          </p>
        )}
      </ul>
    </>
  );
}
