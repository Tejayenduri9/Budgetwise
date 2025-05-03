import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  limit,
  arrayRemove,
  arrayUnion
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { subMonths, format } from "date-fns";

const getSafeDate = (date) => date?.toDate?.() ?? new Date(date);

const categories = [
  "Food", "Housing", "Utilities", "Transportation", "Entertainment",
  "Recurring Payments", "Miscellaneous", "Healthcare", "Savings", "Taxes"
];

export const fetchData = async (resourceName, userId) => {
  const dataCollection = collection(db, resourceName);
  const q = query(dataCollection, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const createData = async (resourceName, formData, userId) => {
  const dataCollection = collection(db, resourceName);
  const docRef = await addDoc(dataCollection, { ...formData, userId });
  return docRef.id;
};

export const editData = async (resourceName, docId, updatedData) => {
  const docRef = doc(db, resourceName, docId);
  await updateDoc(docRef, updatedData);
};

export const deleteData = async (resourceName, docId) => {
  const docRef = doc(db, resourceName, docId);
  await deleteDoc(docRef);
};

export const fetchTransactionsByMonth = async (userId, month) => {
  const transactionsRef = collection(db, "transactions");
  const q = query(transactionsRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => doc.data())
    .filter((transaction) => format(getSafeDate(transaction.date), "MM-yyyy") === month);
};

export const checkCategoryLimits = (transactions, categories) => {
  const alerts = [];

  categories.forEach((category) => {
    const categoryTransactions = transactions.filter(
      (transaction) => transaction.category === category.name
    );

    const totalExpense = categoryTransactions.reduce((acc, transaction) => acc + transaction.amount, 0);

    if (totalExpense >= 0.8 * category.limit) {
      alerts.push(`You are approaching the limit for ${category.name}.`);
    }
  });

  return alerts;
};

export const fetchRecentTransactions = async (userId) => {
  const transactionsRef = collection(db, "transactions");
  const q = query(transactionsRef, where("userId", "==", userId), limit(5));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const fetchExpensesByCategory = async (userId, monthYear) => {
  const transactionsRef = collection(db, "transactions");
  const q = query(transactionsRef, where("userId", "==", userId), where("monthYear", "==", monthYear));
  const snapshot = await getDocs(q);

  const expensesByCategory = {};
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (!expensesByCategory[data.category]) expensesByCategory[data.category] = 0;
    expensesByCategory[data.category] += parseInt(data.amount);
  });

  return Object.entries(expensesByCategory)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
};

export const fetchUpcomingRecurringPayments = async (userId) => {
  const ref = collection(db, "recurringPayments");
  const q = query(ref, where("userId", "==", userId), limit(5));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const fetchIncomesByCategory = async (userId, monthYear) => {
  const ref = collection(db, "incomes");
  const q = query(ref, where("userId", "==", userId), where("monthYear", "==", monthYear));
  const snapshot = await getDocs(q);

  const incomeByCategory = {};
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!incomeByCategory[data.category]) incomeByCategory[data.category] = 0;
    incomeByCategory[data.category] += parseInt(data.amount);
  });

  return Object.entries(incomeByCategory).map(([category, total]) => ({ category, total }));
};

export const fetchIncomesByMonth = async (userId, monthYear) => {
  const ref = collection(db, "incomes");
  const q = query(ref, where("userId", "==", userId), where("monthYear", "==", monthYear));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const fetchExpensessByMonth = async (userId, monthYear) => {
  const ref = collection(db, "transactions");
  const q = query(ref, where("userId", "==", userId), where("monthYear", "==", monthYear));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const getPastFiveMonths = (monthYear) => {
  const [month, year] = monthYear.split("-").map(Number);
  const start = new Date(year, month - 1);
  return Array.from({ length: 5 }, (_, i) => format(subMonths(start, i), "MM-yyyy")).reverse();
};

export const fetchPastMonthsExpenses = async (userId, monthYear) => {
  const ref = collection(db, "transactions");
  const q = query(ref, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  const pastMonths = getPastFiveMonths(monthYear);
  const byMonth = Object.fromEntries(pastMonths.map((m) => [m, 0]));

  snapshot.forEach((doc) => {
    const { amount, date } = doc.data();
    const month = format(getSafeDate(date), "MM-yyyy");
    if (byMonth[month] !== undefined) byMonth[month] += parseFloat(amount);
  });

  return pastMonths.map((month) => byMonth[month]);
};

export const fetchPastMonthsIncome = async (userId, monthYear) => {
  const ref = collection(db, "incomes");
  const q = query(ref, where("userId", "==", userId));
  const snapshot = await getDocs(q);

  const pastMonths = getPastFiveMonths(monthYear);
  const byMonth = Object.fromEntries(pastMonths.map((m) => [m, 0]));

  snapshot.forEach((doc) => {
    const { amount, date } = doc.data();
    const month = format(getSafeDate(date), "MM-yyyy");
    if (byMonth[month] !== undefined) byMonth[month] += parseFloat(amount);
  });

  return pastMonths.map((month) => byMonth[month]);
};

export const fetchUsersExceptCurrent = async () => {
  const ref = collection(db, "users");
  const q = query(ref, where("userId", "!=", auth.currentUser.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const fetchGroups = async (userId) => {
  const ref = collection(db, "groups");
  const q = query(ref, where("memberIds", "array-contains", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const settleExpense = async (expenseId, userId) => {
  const ref = doc(db, "expenses", expenseId);
  await updateDoc(ref, {
    payers: arrayUnion({ userId, settled: true }),
  });
};

export const fetchAllExpensesByCategory = async (userId) => {
  const ref = collection(db, "transactions");
  const q = query(ref, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const byMonth = {};

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const month = format(getSafeDate(data.date), "MM-yyyy");

    if (!byMonth[month]) {
      byMonth[month] = Object.fromEntries(categories.map((c) => [c, 0]));
    }

    if (data.category in byMonth[month]) {
      byMonth[month][data.category] += parseFloat(data.amount);
    }
  });

  const sorted = Object.keys(byMonth).sort();
  return { data: sorted.map((m) => Object.values(byMonth[m])) };
};

export const fetchGroupwiseExpensesByCategory = async (userId) => {
  const ref = collection(db, "expenses");
  const q = query(ref, where("payerIds", "array-contains", userId));
  const snapshot = await getDocs(q);
  const byMonth = {};

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const month = format(getSafeDate(data.createdAt), "MM-yyyy");

    if (!byMonth[month]) {
      byMonth[month] = Object.fromEntries(categories.map((c) => [c, 0]));
    }

    const userPayer = data.payers.find((p) => p.userId === userId);
    if (userPayer && data.category in byMonth[month]) {
      byMonth[month][data.category] += parseFloat(userPayer.share || 0);
    }
  });

  const sorted = Object.keys(byMonth).sort();
  return { data: sorted.map((m) => Object.values(byMonth[m])) };
};

export const fetchGroupwiseExpenses = async (userId) => {
  const ref = collection(db, "expenses");
  const q = query(ref, where("payerIds", "array-contains", userId));
  const snapshot = await getDocs(q);

  const months = [
    format(subMonths(new Date(), 2), "MM-yyyy"),
    format(subMonths(new Date(), 1), "MM-yyyy"),
    format(new Date(), "MM-yyyy"),
  ];

  const byMonth = Object.fromEntries(months.map((m) => [m, new Array(10).fill(0)]));

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const month = format(getSafeDate(data.date), "MM-yyyy");
    if (!months.includes(month)) return;

    const index = categories.indexOf(data.category);
    if (index !== -1 && data.payerIds.includes(userId)) {
      const share = parseFloat(data.amount || 0) / data.payerIds.length;
      byMonth[month][index] += share;
    }
  });

  return { data: months.map((m) => byMonth[m]) };
};
