"use client";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "../components/HeroHighlight";
import {ContainerScroll} from "../components/container-scroll-animation";
import { BentoGrid, BentoGridItem } from "../components/BentoGrid";
import { BackgroundBeams } from "../components/background-beams";
import { cn } from "../../utils/cn";
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  IconBoxAlignRightFilled,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
  IconLocationDollar,
  IconReload,
  IconCalendarMonth,
  IconClockPause,
  IconChartBar,
  IconChartPie
} from "@tabler/icons-react";

function Header() {
  const [user] = useAuthState(auth);
  return (
    <div className="w-full h-20 text-gray-100 bg-black flex justify-between py-6 px-8 align-middle sticky">
      <div className="flex text-center">
      <IconLocationDollar stroke={2} className="text-center text-2xl h-12 w-12"/><span className="text-center text-2xl ml-5 mt-2">Budget Wise</span>
      </div>
      
      <Link to={user ? "/dashboard" : "/auth" }>
      <button className="relative inline-flex h-12 w-[100px] overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
         {user ? "Dashboard" : "Login"}
        </span>
      </button>
      </Link>
    </div>
  )
}
import heroImage from '../assets/hero.png'; 

function Section2() {
  return (
    <div className="flex flex-col overflow-hidden">
      <div className="bg-black pt-14 text-center">
        <span className="text-6xl font-bold text-white text-center leading-[7rem]">
          Track Your Spendings and
        </span>
        <br />
        <span className="text-6xl font-bold bg-black text-white text-center leading-[7rem]">
          boost your Savings
        </span>
      </div>
      <ContainerScroll>
        <img
          src={heroImage}
          alt="hero"
          height="200%"
          width="100%"
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
        />
      </ContainerScroll>
    </div>
  );
}


function Section3(){

  return (

    <div className="w-full dark:bg-black text-center">
      <span className='text-6xl font-bold bg-black text-white'>
  Best in Class Features.
</span>
    <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem] dark:bg-black mt-16 pb-20 pt-10">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={cn("[&>p:text-lg]", item.className)}
          icon={item.icon} />
      ))}
    </BentoGrid>
    </div>
  );
}

function Section4(){
return (
  <div className="h-[40rem] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
      Gain Peace of mind
      </h1>
      <p></p>
      <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
      Manage your money effortlessly and stress-free. Track your spending, stay on top of your budget, and save smarter with complete financial clarity.
      </p>
    </div>
    <BackgroundBeams />
  </div>
);
}

const SkeletonOne = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    (<motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2">
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2  items-center space-x-2 bg-white dark:bg-black">
        <div
          className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
        <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center space-x-2 w-3/4 ml-auto bg-white dark:bg-black">
        <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
        <div
          className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
      </motion.div>
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center space-x-2 bg-white dark:bg-black">
        <div
          className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
        <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
      </motion.div>
    </motion.div>)
  );
};
const SkeletonTwo = () => {
  const variants = {
    initial: {
      width: 0,
    },
    animate: {
      width: "100%",
      transition: {
        duration: 0.2,
      },
    },
    hover: {
      width: ["0%", "100%"],
      transition: {
        duration: 2,
      },
    },
  };
  const arr = new Array(6).fill(0);
  return (
    (<motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2">
      {arr.map((_, i) => (
        <motion.div
          key={"skelenton-two" + i}
          variants={variants}
          style={{
            maxWidth: Math.random() * (100 - 40) + 40 + "%",
            backgroundColor : i%2==0 ? "#00E676" : "#D32F2F"
          }}
          className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2  items-center space-x-2 bg-neutral-100 dark:bg-black w-full h-4"></motion.div>
      ))}
    </motion.div>)
  );
};
const SkeletonThree = () => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    (<motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] rounded-lg bg-dot-black/[0.2] flex-col space-y-2"
      style={{
        background:
          "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
      }}>
      <motion.div className="h-full w-full rounded-lg"></motion.div>
    </motion.div>)
  );
};
const SkeletonFour = () => {
  const first = {
    initial: {
      x: 20,
      rotate: -5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  const second = {
    initial: {
      x: -20,
      rotate: 5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  return (
    (<motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-row space-x-2">
      <motion.div
        variants={first}
        className="h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center">
        <IconReload className="w-[40px] h-[40px] text-white"/>
        <p
          className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
          Mark as Recurring
        </p>
        <p
          className="border border-red-500 bg-red-100 dark:bg-red-900/20 text-red-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Mark
        </p>
      </motion.div>
      <motion.div
        className="h-full relative z-20 w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center">
        <IconCalendarMonth  className="w-[40px] h-[40px] text-white"/>
        <p
          className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
          Set A frequency
        </p>
        <p
          className="border border-green-500 bg-green-100 dark:bg-green-900/20 text-green-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Tune
        </p>
      </motion.div>
      <motion.div
        variants={second}
        className="h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center">
        <IconClockPause className="w-[40px] h-[40px] text-white"/>
        <p
          className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
          Pause a recurring
        </p>
        <p
          className="border border-orange-500 bg-orange-100 dark:bg-orange-900/20 text-orange-600 text-xs rounded-full px-2 py-0.5 mt-4">
          Pause
        </p>
      </motion.div>
    </motion.div>)
  );
};
const SkeletonFive = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    (<motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2">
      <motion.div
        variants={variants}
        className="flex flex-row rounded-2xl border border-neutral-100 dark:border-white/[0.2] p-2  items-start space-x-2 bg-white dark:bg-black">
       <IconChartBar className="text-green-400 w-[20px] h-[20px]"/>
        <p className="text-xs text-neutral-500">
         View Expenses in Graphs
        </p>
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center justify-end space-x-2 w-3/4 ml-auto bg-white dark:bg-black">
        <p className="text-xs text-neutral-500">View in Pie Charts</p>
        <IconChartPie
          className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
      </motion.div>
    </motion.div>)
  );
};
const items = [
  {
    title: "Simple Categorization",
    description: (
      <span className="text-sm">
        Easily group your expenses into clear categories, helping you track spending and savings without the hassle.
      </span>
    ),
    header: <SkeletonOne />,
    className: "md:col-span-1",
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Stay on Top of Your Spendings",
    description: (
      <span className="text-sm">
        Get a clear picture of where your money goes.
      </span>
    ),
    header: <SkeletonTwo />,
    className: "md:col-span-1",
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Get Notified, Stay in Control",
    description: (
      <span className="text-sm">
        Receive instant expense alerts to keep your spending in check
      </span>
    ),
    header: <SkeletonThree />,
    className: "md:col-span-1",
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Manage Recurring Expenses",
    description: (
      <span className="text-sm">
       Easily track and manage recurring bills and subscriptions.
      </span>
    ),
    header: <SkeletonFour />,
    className: "md:col-span-2",
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },

  {
    title: "Multiple views",
    description: (
      <span className="text-sm">
        Detailed Information in multiple views
      </span>
    ),
    header: <SkeletonFive />,
    className: "md:col-span-1",
    icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" />,
  },
];


export function HeroPage() {
  return (
    <>
    <Header />
    <HeroHighlight>
      <motion.h1
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: [20, -5, 0],
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto ">
            <Highlight className="text-black dark:text-white">
            Your Finances, Simplified.
        </Highlight>
        <div className="text-3xl mt-8">
        Plan, save, and spend smarter with a streamlined approach to managing your money. Enjoy complete control and financial peace of mind, all in one place.
        </div>
      </motion.h1>
    </HeroHighlight>
    <Section2 />
    <Section3 />
    <Section4 />
    </>
  );
}
