import React, { useState } from 'react';
import { getAuth } from "firebase/auth";

const LoanEligibility = () => {
    // Form state initialization
    const [formData, setFormData] = useState({
        gender: "",
        married: "",
        dependents: "",
        education: "",
        selfEmployed: "",
        applicantIncome: "",
        coapplicantIncome: "",
        loanAmount: "",
        loanAmountTerm: "",
        creditHistory: "",
        propertyArea: ""
    });

    const [eligibilityResult, setEligibilityResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const token = await user.getIdToken();

            // Organize data as expected by the backend
            const orderedData = {
                Gender: formData.gender,
                Married: formData.married,
                Dependents: parseInt(formData.dependents, 10),
                Education: formData.education,
                Self_Employed: formData.selfEmployed,
                ApplicantIncome: parseFloat(formData.applicantIncome),
                CoapplicantIncome: parseFloat(formData.coapplicantIncome),
                LoanAmount: parseFloat(formData.loanAmount),
                Loan_Amount_Term: parseFloat(formData.loanAmountTerm),
                Credit_History: parseInt(formData.creditHistory, 10),
                Property_Area: formData.propertyArea,
            };

            console.log(orderedData);

            try {
                // Send data to Django API
                const response = await fetch("http://52.91.96.86:8000/api/predict-loan-eligibility/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(orderedData),
                });

                const result = await response.json();
                if (result.eligibility !== undefined) {
                    setEligibilityResult(result.eligibility);
                    setErrorMessage("");
                    setShowPopup(true);
                } else {
                    setEligibilityResult(null);
                    setErrorMessage("There was an error with the eligibility check.");
                }
            } catch (error) {
                console.error("Error during API call:", error);
                setEligibilityResult(null);
                setErrorMessage("An error occurred. Please try again.");
            }
        } else {
            setErrorMessage("User not authenticated");
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 my-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">Loan Eligibility Form</h2>
            
            {/* {eligibilityResult !== null && !showPopup && (
                <div className="mb-4 p-4 text-center rounded-md bg-green-100 text-green-700">
                    <p className="font-semibold">Eligibility Result:</p>
                    <p>{eligibilityResult === "Eligible" ? "Eligible" : "Not Eligible"}</p>
                </div>
            )} */}

            {errorMessage && (
                <div className="mb-4 p-4 text-center rounded-md bg-red-100 text-red-700">
                    <p>{errorMessage}</p>
                </div>
            )}

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm mx-auto">
                        <h3 className="text-3xl font-bold text-green-600 mb-4">
                            {eligibilityResult === "Eligible" ? "🎉 Congratulations!" : "😞 Sorry!"}
                        </h3>
                        <p className="text-lg mb-6">
                            {eligibilityResult === "Eligible" ? "You are eligible for the loan!" : "You are not eligible for the loan."}
                        </p>
                        <button onClick={closePopup} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
                            Close
                        </button>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 dark:text-gray-200">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-200">Married</label>
                    <select name="married" value={formData.married} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <option value="">Select Marital Status</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-200">Dependents</label>
                    <input type="number" name="dependents" value={formData.dependents} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md" />
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-200">Education</label>
                    <select name="education" value={formData.education} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <option value="">Select Education</option>
                        <option value="Graduate">Graduate</option>
                        <option value="Not Graduate">Not Graduate</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-200">Self Employed</label>
                    <select name="selfEmployed" value={formData.selfEmployed} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <option value="">Select Employment Status</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-200">Applicant Income</label>
                    <input type="number" name="applicantIncome" value={formData.applicantIncome} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md" />
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-200">Coapplicant Income</label>
                    <input type="number" name="coapplicantIncome" value={formData.coapplicantIncome} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md" />
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-200">Loan Amount</label>
                    <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md" />
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-200">Loan Amount Term (months)</label>
                    <input type="number" name="loanAmountTerm" value={formData.loanAmountTerm} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md" />
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-200">Credit History</label>
                    <select name="creditHistory" value={formData.creditHistory} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <option value="">Select Credit History</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-200">Property Area</label>
                    <select name="propertyArea" value={formData.propertyArea} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <option value="">Select Area</option>
                        <option value="Urban">Urban</option>
                        <option value="Semiurban">Semiurban</option>
                        <option value="Rural">Rural</option>
                      </select>
                    </div>

                    <button type="submit" className="w-full p-2 mt-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
                      Check Loan Eligibility
                    </button>
                  </form>
                </div>
              );
          };

export default LoanEligibility;
