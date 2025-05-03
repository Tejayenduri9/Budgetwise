import { useEffect, useState, useRef, useId } from "react";
import { fetchData, createData, deleteData, editData } from "../services/firestoreService";
import { useAuthState } from "react-firebase-hooks/auth";
import { AnimatePresence, motion } from "framer-motion";
import { auth } from "../firebase";
import { format } from "date-fns";
import { useOutsideClick } from "../hooks/use-outside-click";
import { Timestamp, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Transactions() {
  const [active, setActive] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const [filterDate, setFilterDate] = useState("");

  const [formTransaction, setFormTransaction] = useState({
    amount: "",
    category: "",
    date: "",
  });

  useEffect(() => {
    if (user) {
      const loadTransactions = async () => {
        setLoading(true);
        let fetchedTransactions = [];

        if (filterDate) {
          const [year, month, day] = filterDate.split("-").map(Number);
          const start = new Date(year, month - 1, day);
          start.setHours(0, 0, 0, 0);
          const end = new Date(year, month - 1, day);
          end.setHours(23, 59, 59, 999);

          const transactionsRef = collection(db, "transactions");
          const q = query(
            transactionsRef,
            where("userId", "==", user.uid),
            where("date", ">=", Timestamp.fromDate(start)),
            where("date", "<=", Timestamp.fromDate(end))
          );

          const snapshot = await getDocs(q);
          fetchedTransactions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        } else {
          const allData = await fetchData("transactions", user.uid);
          fetchedTransactions = allData.map((doc) => ({
            id: doc.id,
            ...doc,
          }));
        }

        setTransactions(fetchedTransactions);
        setLoading(false);
      };

      const loadCategories = async () => {
        const fetchedCategories = await fetchData("categories", user.uid);
        setCategories(fetchedCategories);
      };

      loadTransactions();
      loadCategories();
    }
  }, [user, active, filterDate]);

  const ref = useRef(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    document.body.style.overflow = active && typeof active === "object" ? "hidden" : "auto";
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormTransaction((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const [year, month, day] = formTransaction.date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const firestoreDate = Timestamp.fromDate(localDate);
    const monthYear = format(localDate, "MM-yyyy");

    const transactionWithMonthYear = { ...formTransaction, date: firestoreDate, monthYear };

    if (active?.type === "edit") {
      await editData("transactions", active.id, transactionWithMonthYear);
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === active.id
            ? { ...transaction, ...transactionWithMonthYear }
            : transaction
        )
      );
    } else {
      const docRef = await addDoc(collection(db, "transactions"), {
        ...transactionWithMonthYear,
        userId: user.uid,
      });
      setTransactions((prev) => [
        ...prev,
        { ...transactionWithMonthYear, userId: user.uid, id: docRef.id },
      ]);
    }

    setActive(null);
  };

  const handleDelete = async (transactionId) => {
    await deleteData("transactions", transactionId);
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== transactionId));
  };

  const handleFilterChange = (e) => {
    setFilterDate(e.target.value);
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
          <span className="text-white">Track Your</span> Expenses 💸
        </motion.h1>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setActive({ type: "add" });
              setFormTransaction({ amount: "", category: "", date: "" });
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Add Expense
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="flex justify-center items-center gap-2 bg-[#2e2e2e] px-4 py-2 rounded-xl">
            <label htmlFor="filterDate" className="text-gray-300 font-medium">
              Filter by Date:
            </label>
            <div className="relative">
              <input
                type="date"
                id="filterDate"
                value={filterDate}
                onChange={handleFilterChange}
                className="bg-[#3a3a3a] text-white placeholder-white px-4 py-2 rounded-md appearance-none focus:outline-none"
              />
            </div>
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

      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.div className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden">
              <div className="p-6">
                <motion.h3 className="font-bold text-neutral-700 dark:text-neutral-200">
                  {active.type === "edit" ? `Edit Expense` : "Add New Expense"}
                </motion.h3>
                <form className="space-y-4 mt-4">
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={formTransaction.amount}
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
                      value={formTransaction.date}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Category</label>
                    <select
                      name="category"
                      value={formTransaction.category}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
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

      <ul className="max-w-2xl mx-auto w-full gap-4 mt-6">
        {transactions.map((transaction) => {
          const transactionDate =
            transaction.date?.toDate?.() ?? new Date(transaction.date);
          const day = format(transactionDate, "d");
          const monthShort = format(transactionDate, "MMM");

          return (
            <motion.div
              key={transaction.id}
              className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
              style={{ borderLeft: `5px solid red` }}
            >
              <div className="flex gap-4 items-center">
                <div>
                  <div className="text-3xl font-bold text-indigo-500">{day}</div>
                  <div className="text-sm text-neutral-500 uppercase">{monthShort}</div>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-200">
                    ${transaction.amount}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Category: {transaction.category}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-blue-500 hover:text-white text-black mt-4 md:mt-0"
                  onClick={() => {
                    setActive({ type: "edit", id: transaction.id });
                    setFormTransaction({
                      ...transaction,
                      date: format(
                        transaction.date?.toDate?.() ?? new Date(transaction.date),
                        "yyyy-MM-dd"
                      ),
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-2 text-sm rounded-full font-bold bg-red-500 hover:bg-red-600 text-white mt-4 md:mt-0"
                  onClick={() => handleDelete(transaction.id)}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          );
        })}
      </ul>
    </>
  );
}
