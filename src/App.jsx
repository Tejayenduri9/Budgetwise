import './App.css';
import { HeroPage } from './pages/Hero';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Transactions from './pages/Transaction';
import Categories from './pages/Categories';
import Recurrings from './pages/Recurrings';
import { onAuthStateChanged } from 'firebase/auth';
import Summary from './pages/Summary';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';
import { toast, ToastContainer } from 'react-toastify';
import Message from './components/Message';
import 'react-toastify/dist/ReactToastify.css';
import { fetchData } from './services/firestoreService';
import Goals from './pages/Goals';
import Incomes from './pages/Income';
import MyProfile from './pages/MyProfile';
import FinScore from './pages/FInScore';
import LoanEligibility from './pages/LoanEligibility';
import ExpensePredictor from './pages/ExpensePredictor';
import Friends from './pages/Friends';
import Groups from './pages/Groups';
import Expenses from './pages/Expense';
import SWDashboard from './pages/SWDashboard';
import GroupExpensePredictor from './pages/GroupExpensePredictor';



function App() {
  const [user, loading] = useAuthState(auth);
  const [initializing, setInitializing] = useState(true);

  // Function to request permission for push notifications
  async function requestPermission() {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BOyNwNOJiqx-Ix425RB-mqszpGXZ-94JWEipOsVoOYLHaGei2ApW_2Aj0y02KwMGRwlsGVL1f5cEAXE9ojBQmGc", 
      });
      console.log("Token generated: ", token);
    } else {
      console.warn("Notification permission denied");
    }
  }

  // Register service worker and sync event
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
    }
  }, []);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setInitializing(false);
      if (user) {
        requestPermission(); // Request permission after login
      }
    });
    return () => unsubscribe(); // Clean up on unmount
  }, []);

  // Register background sync when service worker is ready
  useEffect(() => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.sync.register('payment-reminder')
        .then(() => {
          console.log('Payment reminder sync event registered');
        })
        .catch((err) => {
          console.error('Failed to register payment reminder sync event:', err);
        });
    });
  }, []);

  // Send user data to the service worker
  useEffect(() => {
    if (user && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SET_USER_UID',
        uid: user.uid,
      });
    }
  }, [user]);

  // Fetch and update data for the service worker
  useEffect(() => {
    if (user) {
      navigator.serviceWorker.ready.then((registration) => {
        fetchDataFromFirestore(user.uid).then((data) => {
          registration.active.postMessage({
            type: 'UPDATE_DATA',
            payload: data,
          });
        });
      });
    }
  }, [user]);

  // Background message listener
  useEffect(() => {
    onMessage(messaging, (payload) => {
      console.log("Incoming message", payload);
      toast(<Message notification={payload.notification} />);
    });
  }, []);

  // Fetching categories, transactions, and payments for the service worker
  async function fetchDataFromFirestore(userId) {
    const categories = await fetchData("categories", userId);
    const transactions = await fetchData("transactions", userId);
    const payments = await fetchData("recurringPayments", userId);
    return { categories, transactions, payments };
  }

  if (loading || initializing) return <div>Loading...</div>;

  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/auth" />} />
        <Route path="/incomes" element={user ? <Layout><Incomes /></Layout> : <Navigate to="/auth" />} />
        <Route path="/transactions" element={user ? <Layout><Transactions /></Layout> : <Navigate to="/auth" />} />
        <Route path="/categories" element={user ? <Layout><Categories /></Layout> : <Navigate to="/auth" />} />
        <Route path="/recurrings" element={user ? <Layout><Recurrings /></Layout> : <Navigate to="/auth" />} />
        <Route path="/summary" element={user ? <Layout><Summary /></Layout> : <Navigate to="/auth" />} />
        <Route path="/goals" element={user ? <Layout><Goals /></Layout> : <Navigate to="/auth" />} />
        <Route path="/finscore" element={user ? <Layout><FinScore /></Layout> : <Navigate to="/auth" />} />
        <Route path="/loancheck" element={user ? <Layout><LoanEligibility /></Layout> : <Navigate to="/auth" />} />
        <Route path="/predict" element={user ? <Layout><ExpensePredictor /></Layout> : <Navigate to="/auth" />} />
        <Route path="/profile" element={user ? <Layout><MyProfile /></Layout> : <Navigate to="/auth" />} />
        <Route path="/friends" element={user ? <Layout><Friends /></Layout> : <Navigate to="/auth" />} />
        <Route path="/groups" element={user ? <Layout><Groups /></Layout> : <Navigate to="/auth" />} />
        <Route path="/activity" element={user ? <Layout><Expenses /></Layout> : <Navigate to="/auth" />} />
        <Route path="/swdashboard" element={user ? <Layout><SWDashboard /></Layout> : <Navigate to="/auth" />} />
        <Route path="/gPrediction" element={user ? <Layout><GroupExpensePredictor /></Layout> : <Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;
