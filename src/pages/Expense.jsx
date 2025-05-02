import { useState, useEffect } from 'react';
import AddExpenseCard from '../components/AddExpenseCard';
import { db } from '../firebase';
import { collection, query, where, getDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const Expenses = () => {
  const [user] = useAuthState(auth);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showAddExpenseCard, setShowAddExpenseCard] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchExpenses = async () => {
      const expensesRef = collection(db, 'expenses');
      const expenseQuery = query(expensesRef, where('payerIds', 'array-contains', user.uid));
      const snapshot = await getDocs(expenseQuery);
      const fetchedExpenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(fetchedExpenses);
      setLoading(false);
    };

    fetchExpenses();
  }, [user]);

  const handleSettle = async (expenseId, userId) => {
    try {
      const expenseRef = doc(db, 'expenses', expenseId);
      const expenseDoc = await getDoc(expenseRef);

      if (expenseDoc.exists()) {
        const expenseData = expenseDoc.data();
        const updatedPayers = expenseData.payers.map(payer =>
          payer.userId === userId ? { ...payer, settled: true } : payer
        );

        await updateDoc(expenseRef, {
          payers: updatedPayers,
        });

        setExpenses(prevExpenses =>
          prevExpenses.map(expense =>
            expense.id === expenseId
              ? {
                  ...expense,
                  payers: expense.payers.map(payer =>
                    payer.userId === userId ? { ...payer, settled: true } : payer
                  ),
                }
              : expense
          )
        );
      }
    } catch (error) {
      console.error('Error settling expense:', error);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowAddExpenseCard(true);
  };

  const handleSaveExpense = (updatedExpense) => {
    setExpenses(prevExpenses =>
      prevExpenses.map(expense =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
    setShowAddExpenseCard(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-400 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6 text-blue-400">Your Expenses</h2>
        
        <div className="grid gap-6">
          {expenses.map((expense) => {
            const hasSettled = expense.payers.some((payer) => payer.settled);
            const sortedPayers = [...expense.payers].sort((a, b) => a.name.localeCompare(b.name));

            return (
              <div
                key={expense.id}
                className="bg-gray-800 rounded-lg shadow-lg transition transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-blue-300">
                      {expense.description}
                    </h3>
                    <div className="text-2xl font-bold text-green-400">
                      ${expense.amount.toFixed(2)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-4">
                    Created by: {expense.createdBy === user.uid ? 'You' : expense.createdByName}
                  </p>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-300 mb-3">Participants</h4>
                    <div className="space-y-3">
                      {sortedPayers.map((payer) => (
                        <div
                          key={payer.userId}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800 hover:bg-gray-600"
                        >
                          <span className="text-gray-200 font-medium w-1/3">{payer.name}</span>
                          <div className="flex items-center space-x-4 w-2/3 justify-end">
                            {payer.settled ? (
                              <span className="px-3 py-1 bg-green-600 text-gray-100 rounded-full text-sm">
                                Settled
                              </span>
                            ) : (
                              <>
                                <span className="text-red-400 font-medium text-sm w-24 text-right">
                                  Owes ${payer.share.toFixed(2)}
                                </span>
                                {payer.userId === user.uid && (
                                  <button
                                    onClick={() => handleSettle(expense.id, payer.userId)}
                                    className="px-4 py-2 bg-blue-500 text-sm font-medium rounded-lg text-white hover:bg-blue-600"
                                  >
                                    Settle Up
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!hasSettled && expense.createdBy === user.uid && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="px-4 py-2 bg-gray-600 text-sm font-medium text-white rounded-lg hover:bg-gray-500"
                      >
                        Edit Expense
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {showAddExpenseCard && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <AddExpenseCard
              editingExpense={editingExpense}
              onSave={handleSaveExpense}
              onClose={() => setShowAddExpenseCard(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
