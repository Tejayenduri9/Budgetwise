import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { fetchTransactionsByMonth, fetchIncomesByMonth } from '../services/firestoreService';
import { format } from 'date-fns';
import { ShimmerThumbnail } from 'react-shimmer-effects';

const FinScore = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0
  });

  const calculateScore = (totalIncome, totalExpenses, totalSavings) => {
    if (totalIncome === 0) return 0;
    
    const savingsRate = totalIncome ? totalSavings / totalIncome : 0;
    const expenseRate = totalIncome ? totalExpenses / totalIncome : 0;
    const savingsToExpenseRatio = totalExpenses ? totalSavings / totalExpenses : 0;

    const savingsRateScore = savingsRate * 100;
    const expenseRateScore = (1 - expenseRate) * 100;
    const savingsToExpenseScore = savingsToExpenseRatio * 100;

    let finalScore = 
      (savingsRateScore * 0.4) +
      (expenseRateScore * 0.35) +
      (savingsToExpenseScore * 0.25);
    
    finalScore = Math.round(finalScore);
    finalScore = Math.min(100, Math.max(0, finalScore));
    return finalScore;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          setLoading(true);
          const currentMonth = format(new Date(), "MM-yyyy");
          
          // Fetch current month's transactions and income
          const monthTransactions = await fetchTransactionsByMonth(user.uid, currentMonth);
          const monthIncome = await fetchIncomesByMonth(user.uid, currentMonth);
          
          // Calculate totals
          const totalIncome = monthIncome.reduce((total, income) => total + parseInt(income.amount), 0);
          const totalExpenses = monthTransactions.reduce((total, transaction) => total + parseInt(transaction.amount), 0);
          const totalSavings = totalIncome - totalExpenses;
          
          setFinancialData({
            totalIncome,
            totalExpenses,
            totalSavings
          });

          // Calculate and set score
          const calculatedScore = calculateScore(totalIncome, totalExpenses, totalSavings);
          setScore(calculatedScore);
          
          setLoading(false);
        } catch (error) {
          console.error("Error fetching financial data:", error);
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    setDisplayScore(score);
  }, [score]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-6xl font-bold text-center mb-6 text-white">Financial Health Score</h2>
        <div className="flex justify-center mb-[100px]">
          <ShimmerThumbnail height={100} width={400} rounded />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-6xl font-bold text-center mb-6 text-white">Financial Health Score</h2>

      {/* Financial Summary */}
      <div className="flex justify-center gap-8 mb-[100px]">
        <div className="text-center">
          <p className="text-gray-400">Total Income</p>
          <p className="text-2xl font-bold text-white">${financialData.totalIncome}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">Total Expenses</p>
          <p className="text-2xl font-bold text-white">${financialData.totalExpenses}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">Total Savings</p>
          <p className="text-2xl font-bold text-white">${financialData.totalSavings}</p>
        </div>
      </div>

      {/* Score Bar with Description */}
      <div className="relative w-full h-10 rounded-full bg-gray-200">
        {/* Background gradient for the score ranges */}
        <div className="absolute w-full h-full bg-gradient-to-r from-orange-500 via-purple-600 to-blue-600 opacity-80 rounded-full"></div>

        {/* Range Labels */}
        <div className="flex justify-between px-4 text-white font-semibold absolute w-full top-full mt-2 text-xs">
          <span>0</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
          <span>40</span>
          <span>50</span>
          <span>60</span>
          <span>70</span>
          <span>80</span>
          <span>90</span>
          <span>100</span>
        </div>

        {/* Financial Health Descriptions */}
        <div className="flex justify-between absolute w-full text-xs font-semibold text-center text-white -top-8">
          <span className="w-1/3 text-orange-500">Financially Vulnerable</span>
          <span className="w-1/3 text-purple-500">Financially Coping</span>
          <span className="w-1/3 text-blue-500">Financially Healthy</span>
        </div>

        {/* Animated Pointer */}
        <motion.div
          className="absolute top-0 w-6 h-6 bg-white rounded-full transform -translate-y-1/2"
          initial={{ left: "0%" }}
          animate={{ left: `${displayScore === 100 ? displayScore - 3 : displayScore}%` }}
          transition={{ duration: 1 }}
        >
          <span className="text-white text-xl font-bold absolute left-1/2 transform -translate-x-1/2 -translate-y-6">
            {score}
          </span>
        </motion.div>
      </div>

      {/* Score Interpretation */}
      <div className="text-center mt-12 text-2xl">
        <span className="text-white mr-2">Result:</span>
        {score < 40 && <span className="text-orange-500">Financially Vulnerable</span>}
        {score >= 40 && score < 80 && <span className="text-purple-500">Financially Coping</span>}
        {score >= 80 && <span className="text-blue-500">Financially Healthy</span>}
      </div>
    </div>
  );
};

export default FinScore;