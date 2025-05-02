"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchData, createData, deleteData, editData } from "../services/firestoreService"; 
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase"; 

export default function Categories() {
  const [active, setActive] = useState(null); 
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth); 

  const [formCategory, setFormCategory] = useState({
    name: '',
    description: '',
    limit: 0,
    notifyOnLimit: false,
    icon: '',
    color: '#000000',
  });

  useEffect(() => {
    if (user) {
      const loadCategories = async () => {
        const fetchedCategories = await fetchData("categories", user.uid); // Pass the user's UID
        setCategories(fetchedCategories);
        setLoading(false); 
      };

      loadCategories(); 
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormCategory((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    console.log(active.id);
    if (active.type === "edit") {
      console.log(active.id);
      await editData("categories", active.id, formCategory); 
      setCategories(categories.map((category) => 
        category.id === active.id ? { ...category, ...formCategory } : category
      ));
    } else {
      await createData("categories", formCategory, user.uid); 
      setCategories([...categories, { ...formCategory, userId: user.uid }]); 
    }
    setActive(null); 
  };

  const handleDelete = async (categoryId) => {
    await deleteData("categories", categoryId); 
    setCategories(categories.filter(category => category.id !== categoryId)); 
  };

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <>
      <div className="relative">
        {/* Creative Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-center text-indigo-400 mt-8 mb-6"
        >
          <span className="text-white text-6xl">Manage Your</span> <span className="text-6xl">Categories 🗂️</span>
        </motion.h1>

        {/* Add Category Button (Top Left) */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setActive({ type: "add" });
              setFormCategory({ name: '', description: '', limit: 0, notifyOnLimit: false, icon: '', color: '#000000' }); // Reset form
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Add Category
          </button>
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.div className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden">
              <div className="p-6">
                <motion.h3 className="font-bold text-neutral-700 dark:text-neutral-200">
                  {active.type === "edit" ? `Edit Category` : "Add New Category"}
                </motion.h3>
                <form className="space-y-4 mt-4">
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formCategory.name}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={formCategory.description}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Limit</label>
                    <input
                      type="number"
                      name="limit"
                      value={formCategory.limit}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Icon</label>
                    <input
                      type="text"
                      name="icon"
                      value={formCategory.icon}
                      onChange={handleChange}
                      placeholder="Enter emoji or icon name"
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Color</label>
                    <input
                      type="color"
                      name="color"
                      value={formCategory.color}
                      onChange={handleChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="block text-neutral-600 dark:text-neutral-400 mr-2">Notify on Limit</label>
                    <input
                      type="checkbox"
                      name="notifyOnLimit"
                      checked={formCategory.notifyOnLimit}
                      onChange={handleChange}
                      className="w-5 h-5 bg-gray-900 rounded"
                    />
                  </div>
                </form>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setActive(null)}
                    className="px-4 py-2 text-sm rounded-full font-bold bg-red-600 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm rounded-full font-bold bg-green-600 text-white"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Categories List */}
      <ul className="max-w-2xl mx-auto w-full gap-4 mt-6">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
            style={{ borderLeft: `5px solid ${category.color}` }} 
          >
            <div className="flex gap-4 items-center">
              <span className="text-4xl">{category.icon}</span> 
              <div className="ml-4">
                <h3 className="font-medium text-neutral-800 dark:text-neutral-200">
                  {category.name}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {category.description}
                </p>
                <p className="text-neutral-800 dark:text-neutral-200 font-semibold">
                  Limit: ${category.limit}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Notify on Limit: {category.notifyOnLimit ? "Yes" : "No"}
                </p>
              </div>
            </div>
            {/* Edit and Delete Buttons */}
            <div className="flex gap-2">
              <button
                className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-blue-500 hover:text-white text-black mt-4 md:mt-0"
                onClick={() => {
                  console.log(category.id)
                  setFormCategory(category);
                  setActive({ type: "edit", id: category.id });
                }}
              >
                Edit
              </button>
              <button
                className="px-4 py-2 text-sm rounded-full font-bold bg-red-500 hover:bg-red-600 text-white mt-4 md:mt-0"
                onClick={() => handleDelete(category.id)} 
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </ul>
    </>
  );
}
