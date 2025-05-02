import { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import axios from 'axios';
import { format, addMonths } from 'date-fns';
import { fetchAllExpensesByCategory } from "../services/firestoreService";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { getAuth, onAuthStateChanged } from "firebase/auth"; 

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, ArcElement, Title, Tooltip, Legend);

const months = Array.from({ length: 12 }, (_, index) => format(addMonths(new Date(), -index), "MMMM yyyy")).reverse();
const categories = ["Food", "Housing", "Utilities", "Transportation", "Entertainment", "Recurring Payments", "Miscellaneous", "Healthcare", "Savings", "Taxes"];

const ExpensePredictor = () => {
  const [userId, setUserId] = useState(null);
  const [expenseData, setExpenseData] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [chartType, setChartType] = useState("Bar");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const getExpensesData = async () => {
      try {
        const data = await fetchAllExpensesByCategory(userId);
        setExpenseData(data);
      } catch (error) {
        console.error("Error fetching expenses by category and month:", error);
      }
    };

    if (userId) {
      getExpensesData();
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!expenseData.data || expenseData.data.length === 0) {
      console.error("No expense data available to send for prediction.");
      return;
    }

    try {
      const response = await axios.post('http://52.91.96.86:8000/api/predict-expense/', {
        data: expenseData.data
      });
      setPredictions(response.data.prediction);
    } catch (error) {
      console.error("Error sending data for prediction:", error);
    }
  };

  // Generate the next three months for labels
  const upcomingMonths = Array.from({ length: 3 }, (_, i) => 
    format(addMonths(new Date(), i + 1), "MMMM")
  );

  // Prepare chart data for each month
  const getChartData = (monthIndex) => ({
    labels: categories,
    datasets: [{
      label: `Predictions for ${upcomingMonths[monthIndex]}`,
      data: predictions ? predictions[monthIndex] : Array(categories.length).fill(0),
      backgroundColor: chartType === "Pie" ? categories.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`) : 'rgba(75, 192, 192, 0.8)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
    }]
  });

  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          padding: 15,
          color: '#ffffff', // Set label color here
        },
      },
      title: {
        display: true,
        //text: `Predicted Expenses for ${upcomingMonths.join(", ")}`,
      },
    },
    scales: chartType === "Line" || chartType === "Bar" ? {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#ffffff', // Set y-axis label color here
        },
      },
      x: {
        ticks: {
          color: '#ffffff', // Set x-axis label color here
        },
      },
    } : {}
  };
  


  // Render the appropriate chart based on selected chart type
  const renderChart = (data) => {
    const chartStyle = chartType === "Pie" ? { maxWidth: "600px", maxHeight: "600px", margin: "0 auto" } : {}; // Smaller size for Pie chart
    switch (chartType) {
      case "Pie":
        return <Pie data={data} options={chartOptions} style={chartStyle} />;
      case "Line":
        return <Line data={data} options={chartOptions} />;
      default:
        return <Bar data={data} options={chartOptions} />;
    }
  };

  return (
    <div className="p-8 bg-black w-full min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Predicted Expenses</h1>
      
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto mb-8">
        <label className="block text-white mb-2">Select Chart Type</label>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="w-full p-2 bg-gray-900 text-white rounded-md mb-4"
        >
          <option value="Bar">Bar Chart</option>
          <option value="Pie">Pie Chart</option>
          <option value="Line">Line Chart</option>
        </select>

        <button
          type="submit"
          className="w-full p-2 mt-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
        >
          Predict
        </button>
      </form>

      {predictions && (
        <div className="space-y-6">
          {upcomingMonths.map((month, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-indigo-400 mb-4 text-center">
                Prediction for {month}
              </h2>
              <div style={{ display: "flex", justifyContent: "center" }}>
                {renderChart(getChartData(index))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpensePredictor;
