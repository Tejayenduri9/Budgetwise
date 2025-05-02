/* eslint-disable no-unused-vars */




//import { fetchData } from "../src/services/firestoreService";

/* eslint-disable no-undef */
console.log('Service Worker: firebase-messaging-sw.js loaded');
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
    "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
  );
  
  // Initialize the Firebase app in the service worker
  // "Default" Firebase configuration (prevents errors)
  const firebaseConfig = {
    apiKey: "AIzaSyDvTsOhhD-l7hraJ0IOIpMZ-29abL_oYNo",
    authDomain: "budgetwise-c3cd9.firebaseapp.com",
    projectId: "budgetwise-c3cd9",
    storageBucket: "budgetwise-c3cd9.appspot.com",
    messagingSenderId: "938092216026",
    appId: "1:938092216026:web:b7e183e7526bf5e81f2fe3",
    measurementId: "G-PFYM2TRDMR"
  };
  
  firebase.initializeApp(firebaseConfig);
  
  // Retrieve firebase messaging
  const messaging = firebase.messaging();
  

  messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.image,
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });

  self.addEventListener('install', function (event) {
    console.log('Service Worker installed.');
  });
  
  self.addEventListener('activate', function (event) {
    console.log('Service Worker activated.');
  });
  let userUID = null; // To store the user UID

// Listen for incoming messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_USER_UID') {
    userUID = event.data.uid;
    console.log('User UID received in service worker:', userUID);
  }
});

let cachedData = { categories: [], transactions: [], payments: [] };

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'UPDATE_DATA') {
    cachedData = event.data.payload;
  }
});
  self.addEventListener('sync', function (event) {
    if (event.tag === 'payment-reminder') {
      event.waitUntil(displayPaymentReminder());
    }
  });
  

  async function checkCategoryLimits() {
    const { categories, transactions } = cachedData;

    categories.forEach((category) => {
        const categoryTransactions = transactions.filter(
          (transaction) => transaction.category === category.name
        );
    
        const totalExpense = categoryTransactions.reduce((acc, transaction) => acc + parseInt(transaction.amount), 0);
    
        if (totalExpense >= 0.8 * category.limit && category.notifyOnLimit) { // 80% threshold
            const notificationTitle = 'Approaching Limit ';
            const notificationOptions = {
            body: `Limit reached for ${category.name} You have spent ${totalExpense}, exceeding your limit of ${category.limit}`,
            icon: '/images/payment-icon.png',
            };
            //sendNotification(`Limit reached for ${category.name}`, `You have spent ${category.expenses}, exceeding your limit of ${category.limit}`);
            self.registration.showNotification(notificationTitle, notificationOptions);
        }
      });
  
  }
  
  // Helper function to add months
function addMonths(date, months) {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

// Helper function to calculate difference in months
function differenceInMonths(date1, date2) {
  return (
    date1.getFullYear() * 12 +
    date1.getMonth() -
    (date2.getFullYear() * 12 + date2.getMonth())
  );
}

  
  async function checkRecurringPayments() {
    const { payments } = cachedData;
    console.log(payments);
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    console.log("oneday"+oneDayFromNow);
    payments.forEach((payment) => {
      const startDate = new Date(payment.startDate);
  
      // Calculate months difference from current date to start date
      const monthsDifference = differenceInMonths(now, startDate);
      const dueDate = addMonths(startDate, monthsDifference);
      console.log("monthsdiff"+monthsDifference);
      console.log("duedate"+dueDate);
      console.log(payment.reminderDuration);
      console.log(dueDate <= oneDayFromNow)
      console.log(dueDate >= now)
      // Show notification if the months difference is less than or equal to the reminderDuration
      if (monthsDifference <= parseInt(payment.reminderDuration) && dueDate <= oneDayFromNow && dueDate >= now) {
        const notificationTitle = "Payment Date";
        const notificationOptions = {
          body: `Upcoming payment for ${payment.name}. Your payment of $${payment.amount} is due on ${dueDate}`,
          icon: "/images/payment-icon.png",
        };
        
        self.registration.showNotification(notificationTitle, notificationOptions);
      }
    });
  }


  async function displayPaymentReminder() {
    // Here you can fetch payments that are due and send notifications
    console.log('display notification')
    setInterval(() =>{
    checkRecurringPayments();
    checkCategoryLimits();

    }, 10 *1000);
  }
  