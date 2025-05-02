import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const FinScore = () => {
  const [income, setIncome] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Replace this mock fetch with your actual backend or Firebase call
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
      setIncome(5000); // Replace with real data
      setExpenses(2800); // Replace with real data
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (income !== null && expenses !== null) {
      const savings = income - expenses;
      const calculatedScore = calculateScore(income, expenses, savings);
      setScore(calculatedScore);
    }
  }, [income, expenses]);

  useEffect(() => {
    setDisplayScore(score);
  }, [score]);

  const calculateScore = (totalIncome, totalExpenses, totalSavings) => {
    if (totalIncome === 0) return 0;
    const savingsRate = totalSavings / totalIncome;
    const expenseRate = totalExpenses / totalIncome;
    const savingsToExpenseRatio = totalExpenses ? totalSavings / totalExpenses : 0;

    const savingsRateScore = savingsRate * 100;
    const expenseRateScore = (1 - expenseRate) * 100;
    const savingsToExpenseScore = savingsToExpenseRatio * 100;

    let finalScore =
      savingsRateScore * 0.4 +
      expenseRateScore * 0.35 +
      savingsToExpenseScore * 0.25;
    return Math.min(100, Math.max(0, Math.round(finalScore)));
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-6xl font-bold text-center mb-6 text-white">
        Financial Health Score
      </h2>

      {income !== null && expenses !== null ? (
        <>
          {/* Score Bar */}
          <div className="relative w-full h-10 rounded-full bg-gray-200 mb-8">
            {/* Gradient Bar */}
            <div className="absolute w-full h-full bg-gradient-to-r from-orange-500 via-purple-600 to-blue-600 opacity-80 rounded-full"></div>

            {/* Range Labels */}
            <div className="flex justify-between px-4 text-white font-semibold absolute w-full top-full mt-2 text-xs">
              {[...Array(11).keys()].map((i) => (
                <span key={i}>{i * 10}</span>
              ))}
            </div>

            {/* Descriptions */}
            <div className="flex justify-between absolute w-full text-xs font-semibold text-center text-white -top-8">
              <span className="w-1/3 text-orange-500">Financially Vulnerable</span>
              <span className="w-1/3 text-purple-500">Financially Coping</span>
              <span className="w-1/3 text-blue-500">Financially Healthy</span>
            </div>

            {/* Animated Pointer */}
            <motion.div
              className="absolute top-0 w-6 h-6 bg-white rounded-full transform -translate-y-1/2"
              initial={{ left: "0%" }}
              animate={{ left: `${displayScore === 100 ? 97 : displayScore}%` }}
              transition={{ duration: 1 }}
            >
              <span className="text-white text-xl font-bold absolute left-1/2 transform -translate-x-1/2 -translate-y-6">
                {score}
              </span>
            </motion.div>
          </div>

          {/* Interpretation */}
          <div className="text-center mt-12 text-2xl">
            <span className="text-white mr-2">Result:</span>
            {score < 40 && <span className="text-orange-500">Financially Vulnerable</span>}
            {score >= 40 && score < 80 && <span className="text-purple-500">Financially Coping</span>}
            {score >= 80 && <span className="text-blue-500">Financially Healthy</span>}
          </div>
        </>
      ) : (
        <div className="text-center text-white text-lg">Loading financial data...</div>
      )}
    </div>
  );
};

export default FinScore;
