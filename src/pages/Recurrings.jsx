// import { AnimatePresence, motion } from "framer-motion";
// import { useEffect, useState } from "react";
// import { fetchData, createData, deleteData, editData } from "../services/firestoreService"; // Firestore service
// import { useAuthState } from "react-firebase-hooks/auth";
// import { auth } from "../firebase"; // Firebase Authentication
// import { format, addMonths } from "date-fns"; // For date formatting and manipulation

// import { collection, getDocs, query, where } from "firebase/firestore";
// import { db } from "../firebase";

// export default function Recurrings() {
//   const [user] = useAuthState(auth); // Get the current authenticated user
//   const [loading, setLoading] = useState(true);
//   const [recurringPayments, setRecurringPayments] = useState([]);
//   const [formRecurringPayment, setFormRecurringPayment] = useState({
//     name: '',
//     description: '',
//     amount: '',
//     startDate: '',
//     reminderDate: '',
//     duration: 'Monthly',
//     icon: '',
//   });
//   const [active, setActive] = useState(null); // For showing add/edit form

//   useEffect(() => {
//     if (user) {
//       const loadPayments = async () => {
//         const payments = await fetchData("recurringPayments", user.uid);
//         setRecurringPayments(payments);
//         setLoading(false);
//       };
//       loadPayments(); // Fetch payments
//     }
//   }, [user]);
//   useEffect(() => {
//     checkDuePayments();
//   },[recurringPayments])
//   // Function to check if any payments are due and create transaction entries
//   const checkDuePayments = async () => {
//     const today = new Date();

//     recurringPayments.forEach(async (payment) => {
//       const startDate = new Date(payment.startDate);
//       const { duration } = payment;

//       // Determine the next due date based on duration
//       let nextDueDate = startDate;
//       while (format(nextDueDate, 'yyyy-MM-dd') <= format(today, 'yyyy-MM-dd')) {
//         // Create transaction if due
//         if (format(nextDueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
//           const transactionExists = await checkIfTransactionExists(
//             format(nextDueDate, 'yyyy-MM-dd'),
//             user.uid
//           );
//           if (!transactionExists) {
//           await createData("transactions", {
//             category: "Recurring Payment",
//             name: payment.name,
//             amount: payment.amount,
//             date: format(today, 'yyyy-MM-dd'),
//             monthYear: format(today,'MM-yyyy')
//           },user.uid);
//         }
//         }

//         // Update next due date based on duration
//         nextDueDate = getNextDueDate(nextDueDate, duration);
//       }
//     });
//   };

//   const checkIfTransactionExists = async ( date, userId) => {
//     try {
//       const transactionsRef = collection(db, "transactions");
//       const q = query(
//         transactionsRef,
//         where("date", "==", date),
//         where("userId", "==", userId)
//       );
//       const snapshot = await getDocs(q);
//       console.log("payment exists"+snapshot);
//       return !snapshot.empty; // Returns true if a matching transaction exists
//     } catch (error) {
//       console.error("Error checking transaction existence: ", error);
//       return false;
//     }
//   };
//   // Helper function to calculate the next due date
//   const getNextDueDate = (date, duration) => {
//     switch (duration) {
//       case "Weekly":
//         return addMonths(date, 0.25);
//       case "Biweekly":
//         return addMonths(date, 0.5);
//       case "Monthly":
//         return addMonths(date, 1);
//       case "Yearly":
//         return addMonths(date, 12);
//       default:
//         return date;
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormRecurringPayment((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSave = async () => {
//     if (active.type === "edit") {
//       await editData("recurringPayments", active.id, formRecurringPayment);
//       setRecurringPayments(
//         recurringPayments.map((payment) =>
//           payment.id === active.id ? { ...payment, ...formRecurringPayment } : payment
//         )
//       );
//     } else {
//       await createData("recurringPayments", formRecurringPayment, user.uid);
//       setRecurringPayments([...recurringPayments, { ...formRecurringPayment, userId: user.uid }]);
//     }
//     setActive(null); // Close the form after saving
//   };

//   const handleDelete = async (paymentId) => {
//     await deleteData("recurringPayments", paymentId);
//     setRecurringPayments(recurringPayments.filter((payment) => payment.id !== paymentId));
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <>
//       <div className="relative">
//         <motion.h1
//           initial={{ opacity: 0, y: -30 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-4xl font-extrabold text-center text-indigo-400 mt-8 mb-6"
//         >
//           <span className="text-white">Manage Your</span> Recurring Payments 🔄
//         </motion.h1>

//         {/* Add Recurring Payment Button */}
//         <div className="flex justify-end">
//           <button
//             onClick={() => {
//               setActive({ type: "add" });
//               setFormRecurringPayment({
//                 name: '',
//                 description: '',
//                 amount: '',
//                 startDate: '',
//                 reminderDate: '',
//                 duration: 'Monthly',
//                 icon: '',
//               });
//             }}
//             className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
//           >
//             Add Recurring Payment
//           </button>
//         </div>
//       </div>

//       <AnimatePresence>
//         {active && (
//           <div className="fixed inset-0 grid place-items-center z-[100]">
//             <motion.div className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl">
//               <div className="p-6">
//                 <motion.h3 className="font-bold text-neutral-700 dark:text-neutral-200">
//                   {active.type === "edit" ? `Edit Recurring Payment` : "Add New Recurring Payment"}
//                 </motion.h3>
//                 <form className="space-y-4 mt-4">
//                   <div>
//                     <label className="block text-neutral-600 dark:text-neutral-400">Name</label>
//                     <input
//                       type="text"
//                       name="name"
//                       value={formRecurringPayment.name}
//                       onChange={handleChange}
//                       className="w-full p-2 bg-gray-900 text-white rounded-md"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-neutral-600 dark:text-neutral-400">Description</label>
//                     <input
//                       type="text"
//                       name="description"
//                       value={formRecurringPayment.description}
//                       onChange={handleChange}
//                       className="w-full p-2 bg-gray-900 text-white rounded-md"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-neutral-600 dark:text-neutral-400">Amount</label>
//                     <input
//                       type="number"
//                       name="amount"
//                       value={formRecurringPayment.amount}
//                       onChange={handleChange}
//                       className="w-full p-2 bg-gray-900 text-white rounded-md"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-neutral-600 dark:text-neutral-400">Start Date</label>
//                     <input
//                       type="date"
//                       name="startDate"
//                       value={formRecurringPayment.startDate}
//                       onChange={handleChange}
//                       className="w-full p-2 bg-gray-900 text-white rounded-md"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-neutral-600 dark:text-neutral-400">Reminder Date</label>
//                     <input
//                       type="date"
//                       name="reminderDate"
//                       value={formRecurringPayment.reminderDate}
//                       onChange={handleChange}
//                       className="w-full p-2 bg-gray-900 text-white rounded-md"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-neutral-600 dark:text-neutral-400">Icon</label>
//                     <input
//                       type="text"
//                       name="icon"
//                       value={formRecurringPayment.icon}
//                       onChange={handleChange}
//                       placeholder="Enter emoji or icon name"
//                       className="w-full p-2 bg-gray-900 text-white rounded-md"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-neutral-600 dark:text-neutral-400">Duration</label>
//                     <select
//                       name="duration"
//                       value={formRecurringPayment.duration}
//                       onChange={handleChange}
//                       className="w-full p-2 bg-gray-900 text-white rounded-md"
//                     >
//                       <option value="Weekly">Weekly</option>
//                       <option value="Biweekly">Biweekly</option>
//                       <option value="Monthly">Monthly</option>
//                       <option value="Yearly">Yearly</option>
//                     </select>
//                   </div>
//                 </form>

//                 <div className="mt-6 flex justify-between">
//                   <button
//                     onClick={() => setActive(null)}
//                     className="px-4 py-2 text-sm rounded-full font-bold bg-red-600 text-white"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleSave}
//                     className="px-4 py-2 text-sm rounded-full font-bold bg-green-600 text-white"
//                   >
//                     Save
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Recurring Payments List */}
//       <ul className="max-w-2xl mx-auto w-full gap-4 mt-6">
//         {recurringPayments.map((payment) => {
//           const startDate = new Date(payment.startDate);
//           const day = format(startDate, "d");
//           const monthShort = format(startDate, "MMM");

//           return (
//             <motion.div
//               key={payment.id}
//               className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
//             >
//               <div className="flex gap-4 items-center">
//                 <span className="text-4xl">{payment.icon}</span>
//                 <div>
//                   <div className="text-3xl font-bold text-indigo-500">{day}</div>
//                   <div className="text-sm text-neutral-500 uppercase">{monthShort}</div>
//                 </div>
//                 <div className="ml-4">
//                   <h3 className="font-medium text-neutral-800 dark:text-neutral-200">
//                     {payment.name}
//                   </h3>
//                   <p className="text-neutral-600 dark:text-neutral-400">
//                     {payment.description}
//                   </p>
//                   <p className="text-neutral-800 dark:text-neutral-200 font-semibold">
//                     Amount: ${payment.amount}
//                   </p>
//                   <p className="text-neutral-800 dark:text-neutral-200 font-semibold">
//                     Duration: {payment.duration}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-blue-500 hover:text-white text-black mt-4 md:mt-0"
//                   onClick={() => {
//                     setActive({ type: "edit", id: payment.id });
//                     setFormRecurringPayment(payment);
//                   }}
//                 >
//                   Edit
//                 </button>
//                 <button
//                   className="px-4 py-2 text-sm rounded-full font-bold bg-red-500 hover:bg-red-600 text-white mt-4 md:mt-0"
//                   onClick={() => handleDelete(payment.id)}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </motion.div>
//           );
//         })}
//       </ul>
//     </>
//   );
// }

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchData, createData, deleteData, editData } from "../services/firestoreService";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase"; // Firebase Authentication
import { format, addMonths } from "date-fns"; // For date formatting and manipulation

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export default function Recurrings() {
  const [user] = useAuthState(auth); // Get the current authenticated user
  const [loading, setLoading] = useState(true);
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [categories, setCategories] = useState([]); // Categories for the dropdown
  const [formRecurringPayment, setFormRecurringPayment] = useState({
    name: '',
    description: '',
    amount: '',
    startDate: '',
    reminderDuration: 1, // Reminder duration in months
    duration: 'Monthly',
    icon: '',
    category: '', // New category field
  });
  const [active, setActive] = useState(null); // For showing add/edit form

  useEffect(() => {
    if (user) {
      const loadPayments = async () => {
        const payments = await fetchData("recurringPayments", user.uid);
        const fetchedCategories = await fetchData("categories", user.uid); // Fetch categories
        setRecurringPayments(payments);
        setCategories(fetchedCategories);
        setLoading(false);
      };
      loadPayments(); // Fetch payments and categories
    }
  }, [user]);

  useEffect(() => {
    checkDuePayments();
  }, [recurringPayments]);

  // Function to check if any payments are due and create transaction entries
  const checkDuePayments = async () => {
    const today = new Date();

    recurringPayments.forEach(async (payment) => {
      const startDate = new Date(payment.startDate);
      const { duration } = payment;

      // Determine the next due date based on duration
      let nextDueDate = startDate;
      while (format(nextDueDate, 'yyyy-MM-dd') <= format(today, 'yyyy-MM-dd')) {
        if (format(nextDueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        const transactionExists = await checkIfTransactionExists(
          format(nextDueDate, 'yyyy-MM-dd'),
          user.uid
        );
        if (!transactionExists) {
          await createData("transactions", {
            category: payment.category || "Recurring Payment",
            name: payment.name,
            amount: payment.amount,
            date: format(today, 'yyyy-MM-dd'),
            monthYear: format(today, 'MM-yyyy')
          }, user.uid);
        }
      }

        // Update next due date based on duration
        nextDueDate = getNextDueDate(nextDueDate, duration);
      }
    });
  };

  const checkIfTransactionExists = async (date, userId) => {
    try {
      const transactionsRef = collection(db, "transactions");
      const q = query(
        transactionsRef,
        where("date", "==", date),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty; // Returns true if a matching transaction exists
    } catch (error) {
      console.error("Error checking transaction existence: ", error);
      return false;
    }
  };

  const getNextDueDate = (date, duration) => {
    switch (duration) {
      case "Weekly":
        return addMonths(date, 0.25);
      case "Biweekly":
        return addMonths(date, 0.5);
      case "Monthly":
        return addMonths(date, 1);
      case "Yearly":
        return addMonths(date, 12);
      default:
        return date;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormRecurringPayment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (active.type === "edit") {
      await editData("recurringPayments", active.id, formRecurringPayment);
      setRecurringPayments(
        recurringPayments.map((payment) =>
          payment.id === active.id ? { ...payment, ...formRecurringPayment } : payment
        )
      );
    } else {
      await createData("recurringPayments", formRecurringPayment, user.uid);
      setRecurringPayments([...recurringPayments, { ...formRecurringPayment, userId: user.uid }]);
    }
    setActive(null); // Close the form after saving
  };

  const handleDelete = async (paymentId) => {
    await deleteData("recurringPayments", paymentId);
    setRecurringPayments(recurringPayments.filter((payment) => payment.id !== paymentId));
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
          className="text-6xl font-extrabold text-center text-indigo-400 mt-8 mb-6"
        >
          <span className="text-white">Manage Your</span> Recurring Payments 🔄
        </motion.h1>

        {/* Add Recurring Payment Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setActive({ type: "add" });
              setFormRecurringPayment({
                name: '',
                description: '',
                amount: '',
                startDate: '',
                reminderDuration: 1,
                duration: 'Monthly',
                icon: '',
                category: '',
              });
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Add Recurring Payment
          </button>
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.div className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl">
              <div className="p-6 h-[700px] overflow-scroll">
                <motion.h3 className="font-bold text-neutral-700 dark:text-neutral-200">
                  {active.type === "edit" ? `Edit Recurring Payment` : "Add New Recurring Payment"}
                </motion.h3>
                <form className="space-y-4 mt-4">
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formRecurringPayment.name}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={formRecurringPayment.description}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={formRecurringPayment.amount}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formRecurringPayment.startDate}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Reminder Duration (months)</label>
                    <input
                      type="number"
                      name="reminderDuration"
                      value={formRecurringPayment.reminderDuration}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Category</label>
                    <select
                      name="category"
                      value={formRecurringPayment.category}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                      required
                    >
                      <option value="">Select a Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Icon</label>
                    <input
                      type="text"
                      name="icon"
                      value={formRecurringPayment.icon}
                      onChange={handleChange}
                      placeholder="Enter emoji or icon name"
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Duration</label>
                    <select
                      name="duration"
                      value={formRecurringPayment.duration}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Biweekly">Biweekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
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

      {/* Recurring Payments List */}
      <ul className="max-w-2xl mx-auto w-full gap-4 mt-6">
        {recurringPayments.map((payment) => {
          const startDate = new Date(payment.startDate);
          const day = format(startDate, "d");
          const monthShort = format(startDate, "MMM");

          return (
            <motion.div
              key={payment.id}
              className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
            >
              <div className="flex gap-4 items-center">
                <span className="text-4xl">{payment.icon}</span>
                <div>
                  <div className="text-3xl font-bold text-indigo-500">{day}</div>
                  <div className="text-sm text-neutral-500 uppercase">{monthShort}</div>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-200">
                    {payment.name}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {payment.description}
                  </p>
                  <p className="text-neutral-800 dark:text-neutral-200 font-semibold">
                    Amount: ${payment.amount}
                  </p>
                  <p className="text-neutral-800 dark:text-neutral-200 font-semibold">
                    Duration: {payment.duration}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-blue-500 hover:text-white text-black mt-4 md:mt-0"
                  onClick={() => {
                    setActive({ type: "edit", id: payment.id });
                    setFormRecurringPayment(payment);
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-2 text-sm rounded-full font-bold bg-red-500 hover:bg-red-600 text-white mt-4 md:mt-0"
                  onClick={() => handleDelete(payment.id)}
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
