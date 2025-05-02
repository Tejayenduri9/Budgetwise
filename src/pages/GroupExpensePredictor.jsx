import { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchGroupwiseExpenses } from "../services/firestoreService";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, ArcElement, Title, Tooltip, Legend);

const categories = [
  "Food",
  "Housing",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Recurring Payments",
  "Miscellaneous",
  "Healthcare",
  "Savings",
  "Taxes",
];

const GroupExpensePredictor = () => {
  const [chartType, setChartType] = useState("Bar");
  const [userId, setUserId] = useState(null);
  const [groupwiseExpenses, setGroupwiseExpenses] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  // Authenticate user and fetch group expenses
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
    const fetchExpenses = async () => {
      try {
        if (!userId) {
          console.warn("No user ID found");
          return;
        }
        console.log("Fetching groupwise expenses for userId:", userId);

        const result = await fetchGroupwiseExpenses(userId);
        setGroupwiseExpenses(result.data);
      } catch (error) {
        console.error("Error fetching groupwise expenses:", error);
      }
    };

    if (userId) {
      fetchExpenses();
    }
  }, [userId]);

  // Fetch predictions
  useEffect(() => {
    const fetchPredictions = async () => {
      if (!groupwiseExpenses || groupwiseExpenses.length === 0) {
        console.warn("No expenses available for prediction.");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.post("http://52.91.96.86:8000/api/predict-group-expense/", {
          data: groupwiseExpenses,
        });
        setPredictions(response.data.prediction);
      } catch (error) {
        console.error("Error fetching predictions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (groupwiseExpenses.length > 0) {
      fetchPredictions();
    }
  }, [groupwiseExpenses]);

  const upcomingMonths = ["December", "January", "February"];

  const getChartData = (monthIndex) => ({
    labels: categories,
    datasets: [
      {
        label: `Predictions for ${upcomingMonths[monthIndex]}`,
        data: predictions ? predictions[monthIndex] : Array(categories.length).fill(0),
        backgroundColor:
          chartType === "Pie"
            ? categories.map(
                () =>
                  `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                    Math.random() * 255
                  )}, ${Math.floor(Math.random() * 255)}, 0.7)`
              )
            : "rgba(75, 192, 192, 0.8)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
            boxWidth: 10,
            padding: 15,
            color: '#ffffff', // Set label color here
          },
      },
      title: {
        display: true,
      },
    },
    scales:
      chartType === "Line" || chartType === "Bar"
        ? {
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
          }
        : {},
  };

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
      <h1 className="text-3xl font-bold mb-6 text-white text-center">
        Group-wise Predicted Expenses
      </h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto mb-8">
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
      </div>

      {loading ? (
        <p className="text-white text-center">Loading predictions...</p>
      ) : predictions ? (
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
      ) : (
        <p className="text-white text-center">No predictions available.</p>
      )}
    </div>
  );
};

export default GroupExpensePredictor;
