/* eslint-disable react/prop-types */
import { Label } from "../components/label";
import { Input } from "../components/input";
import { cn } from "../../utils/cn";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth,db } from "../firebase"; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import {
  IconLocationDollar
} from "@tabler/icons-react";
import { doc, setDoc } from 'firebase/firestore'
export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

 
  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Check email format
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Check if passwords match (for signup)
    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', userId), {
        firstName,
        lastName,
        displayName,
        email,
        userId
      });
        console.log("Signup successful:", userCredential.user);
        /*await createData('categories',{
          name: 'Food',
          description: 'Manage food',
          limit: 1000,
          notifyOnLimit: false,
          icon: '🍔',
          color: 'red',
        },userCredential.user.uid);
        await createData('categories',{
          name: 'Housing',
          description: 'Manage housing',
          limit: 1000,
          notifyOnLimit: false,
          icon: '🏠',
          color: 'red',
        },userCredential.user.uid);
        await createData('categories',{
          name: 'Utilities',
          description: 'Manage utilities',
          limit: 1000,
          notifyOnLimit: false,
          icon: '💡',
          color: 'red',
        },userCredential.user.uid);
        // await createData('categories',{
        //   name: 'Transportation',
        //   description: 'Manage transportation',
        //   limit: 1000,
        //   notifyOnLimit: false,
        //   icon: '🚇',
        //   color: 'red',
        // },userCredential.user.uid);
        await createData('categories',{
          name: 'Entertainment',
          description: 'Manage entertainment',
          limit: 1000,
          notifyOnLimit: false,
          icon: '🍿',
          color: 'red',
        },userCredential.user.uid);
        await createData('categories',{
          name: 'Recurring Payments',
          description: 'Manage Recurring Payments',
          limit: 1000,
          notifyOnLimit: false,
          icon: '🔄',
          color: 'red',
        },userCredential.user.uid);
        await createData('categories',{
          name: 'Miscellaneous',
          description: 'Manage Miscellaneous',
          limit: 1000,
          notifyOnLimit: false,
          icon: '💰',
          color: 'red',
        },userCredential.user.uid);
        await createData('categories',{
          name: 'Healthcare',
          description: 'Healthcare',
          limit: 1000,
          notifyOnLimit: false,
          icon: '🩺',
          color: 'green',
        },userCredential.user.uid);
        await createData('categories',{
          name: 'Savings',
          description: 'Savings',
          limit: 2000,
          notifyOnLimit: false,
          icon: '💵',
          color: 'pink',
        },userCredential.user.uid);
        await createData('categories',{
          name: 'Taxes',
          description: 'Taxes',
          limit: 1000,
          notifyOnLimit: false,
          icon: '💲',
          color: 'blue',
        },userCredential.user.uid);*/

      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login successful:", userCredential.user);
      }
      navigate("/dashboard"); 
    } catch (err) {
      console.error("Error:", err.message);
      setError(err.message);
    }
  };

  const toggleAuthMode = () => {
    setIsSignup((prev) => !prev);
    setError(null); 
  };

  return (
    <>
    <div className="w-full text-gray-100 bg-black flex justify-between py-6 px-8 align-middle sticky">
      <div className="flex text-center">
      <Link to="/" className="flex">
      <IconLocationDollar stroke={2} className="text-center text-2xl h-12 w-12"/><span className="text-center text-2xl ml-5 mt-2">Budget Wise</span>
      </Link>
      </div>
    </div>
    <div className="flex dark:bg-black h-[90vh] w-full items-center">
      <div className="max-w-md w-full h-max mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black border-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] border-2">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          {isSignup ? "Create an Account" : "Welcome Back"}
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          {isSignup ? "Sign up for BudgetWise" : "Sign in to your account"}
        </p>
        
        {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
        
        <form className="my-8" onSubmit={handleSubmit}>
          {isSignup && (
            <>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <LabelInputContainer>
                <Label htmlFor="firstname">First name</Label>
                <Input id="firstname" placeholder="Tyler" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="lastname">Last name</Label>
                <Input id="lastname" placeholder="Durden" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </LabelInputContainer>
            </div>
            <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Display Name</Label>
            <Input id="displayname" placeholder="Tyler.durden" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </LabelInputContainer>
          </>
          )}
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" placeholder="projectmayhem@fc.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input id="password" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </LabelInputContainer>
          
          {isSignup && (
            <LabelInputContainer className="mb-4">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" placeholder="••••••••" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </LabelInputContainer>
          )}

          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
          >
            {isSignup ? "Sign up" : "Sign in"} &rarr;
            <BottomGradient />
          </button>
        </form>
        <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <button onClick={toggleAuthMode} className="text-indigo-600 dark:text-indigo-400 font-semibold ml-1">
            {isSignup ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
    </>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
