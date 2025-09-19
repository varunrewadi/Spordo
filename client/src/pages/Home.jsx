import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <Navbar />
      <section className="w-full min-h-screen flex items-start justify-center px-8 py-18 bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 max-w-6xl mx-auto w-full">
          <div>
            <span className="inline-block mb-4 text-xs md:text-sm text-primary font-medium border border-dotted border-primary rounded-full px-3 py-1">
              AI-powered activity
            </span>
            <h3 className="text-4xl md:text-6xl font-semibold text-foreground">
              Your Personal AI Sports Companion
            </h3>
            <p className="text-base md:text-lg text-muted-foreground my-4 md:my-6 max-w-lg">
              Elevate your performance! Get real-time insights, expert coaching,
              and tailored training powered by advanced AI. Stay motivated and
              achieve your goals with ease.
            </p>
            <div className="flex gap-4">
              <Link
                to="/dashboard"
                className="cursor-pointer bg-[var(--chart-3)] text-primary-foreground font-medium py-2 px-4 rounded transition-all hover:bg-primary/90 active:scale-95 flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/gallery"
                className="cursor-pointer bg-secondary text-secondary-foreground font-medium py-2 px-4 rounded transition-all border border-border hover:bg-accent active:scale-95 flex items-center justify-center"
              >
                View Gallery
              </Link>
            </div>
          </div>
          <ShuffleGrid />
        </div>
      </section>
    </>
  );
};

// Utility function to shuffle an array
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

const squareData = [
  {
    id: 1,
    src: "grid/img1.avif",
  },
  {
    id: 2,
    src: "grid/img2.avif",
  },
  {
    id: 3,
    src: "grid/img3.avif",
  },
  {
    id: 4,
    src: "grid/img4.avif",
  },
  {
    id: 5,
    src: "grid/img5.avif",
  },
  {
    id: 6,
    src: "grid/img6.avif",
  },
  {
    id: 7,
    src: "grid/img7.avif",
  },
  {
    id: 8,
    src: "grid/img8.avif",
  },
  {
    id: 9,
    src: "grid/img9.avif",
  },
  {
    id: 10,
    src: "grid/img10.avif",
  },
  {
    id: 11,
    src: "grid/img11.avif",
  },
  {
    id: 12,
    src: "grid/img12.avif",
  },
  {
    id: 13,
    src: "grid/img13.avif",
  },
  {
    id: 14,
    src: "grid/img14.avif",
  },
  {
    id: 15,
    src: "grid/img15.avif",
  },
  {
    id: 16,
    src: "grid/img16.avif",
  },
];

const generateSquares = () => {
  return shuffle(squareData).map((sq) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="w-full h-full"
      style={{
        backgroundImage: `url(${sq.src})`,
        backgroundSize: "cover",
      }}
    ></motion.div>
  ));
};

const ShuffleGrid = () => {
  const timeoutRef = useRef(null);
  const [squares, setSquares] = useState(generateSquares());

  useEffect(() => {
    shuffleSquares();

    return () => clearTimeout(timeoutRef.current);
  }, []);

  const shuffleSquares = () => {
    setSquares(generateSquares());

    timeoutRef.current = setTimeout(shuffleSquares, 3000);
  };

  return (
    <div className="grid grid-cols-4 grid-rows-4 h-[450px] gap-1">
      {squares.map((sq) => sq)}
    </div>
  );
};

export default Home;
