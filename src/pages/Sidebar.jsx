/* eslint-disable react/prop-types */
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../components/sidebar";
import {
  IconBrandTabler,
  IconTag,
  IconRepeat,
  IconStack2,
  IconLocationDollar,
  IconTarget,
  IconMoneybag,
  IconUser,
  IconChecklist,
  IconGraph,
  IconLicense,
  IconFriends,
  IconUsersGroup,
  IconActivity,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

// Sidebar links for BudgetWise
const budgetWiseLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Incomes",
    href: "/incomes",
    icon: <IconMoneybag className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Expenses",
    href: "/transactions",
    icon: <IconStack2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Categories",
    href: "/categories",
    icon: <IconTag className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Recurrings",
    href: "/recurrings",
    icon: <IconRepeat className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Goals",
    href: "/goals",
    icon: <IconTarget className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "FinScore",
    href: "/finscore",
    icon: <IconGraph className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Loan Checker",
    href: "/loancheck",
    icon: <IconChecklist className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Expense Predictor",
    href: "/predict",
    icon: <IconLicense className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
];

// Sidebar links for SplitWise
const splitWiseLinks = [
  {
    label: "Dashboard",
    href: "/swdashboard",
    icon: <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Friends",
    href: "/friends",
    icon: <IconFriends className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Groups",
    href: "/groups",
    icon: <IconUsersGroup className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Activity",
    href: "/activity",
    icon: <IconActivity className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Group Prediction",
    href: "/gPrediction",
    icon: <IconLicense className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
  },
];

export function SidebarPage() {
  const [open, setOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState("BudgetWise");

  // Conditionally set links based on the selected app
  const links = selectedApp === "BudgetWise" ? budgetWiseLinks : splitWiseLinks;

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-slate-950 w-max h-[100vh] flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden fixed left-0 top-0 z-10"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex items-center  py-2">
              {/* {open ? <Logo selectedApp={selectedApp} /> : <LogoIcon />} */}
              
              <LogoIcon />
              <select
                className="text-black dark:text-white bg-transparent border-none outline-none"
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
              >
                <option value="BudgetWise">BudgetWise</option>
                <option value="SplitWise">SplitWise</option>
              </select>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "My Profile",
                href: "/profile",
                icon: <IconUser className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

export const Logo = ({ selectedApp }) => {
  return (
    <Link href="#" className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <IconLocationDollar stroke={2} className="text-center text-2xl h-8 w-8 text-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        {selectedApp}
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link href="#" className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <IconLocationDollar stroke={2} className="text-center text-2xl h-8 w-8 text-white" />
    </Link>
  );
};

