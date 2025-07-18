import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react"; // Make sure lucide-react is installed

const testimonials = [
  {
    category: "NEW ARRIVAL",
    text: "This drill machine isn't just powerful, it's precision engineered. It exceeded my expectations for home projects.",
    name: "John Carter",
    role: "Professional Carpenter",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1570295999919-edce4d5494c0?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replaced local path with Unsplash for demo
  },
  {
    category: "TOP RATED PRODUCT",
    text: "The wrench set saved me hours of work; truly a game-changer. Every mechanic should have this in their kit.",
    name: "Emily Watson",
    role: "Auto Mechanic",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replaced local path with Unsplash for demo
  },
  {
    category: "CUSTOMER REVIEW",
    text: "This hammer isn't just durable, it feels perfectly balanced. It's now my go-to tool for any construction job.",
    name: "Michael Brown",
    role: "Construction Worker",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1507003211169-e695c5b0542e?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replaced local path with Unsplash for demo
  },
  {
    category: "TOOL RECOMMENDATION",
    text: "The screwdriver kit is versatile and solidly built. Highly recommended for both professionals and DIY enthusiasts!",
    name: "Sophia Lee",
    role: "DIY Enthusiast",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29329?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replaced local path with Unsplash for demo
  },
  {
    category: "PRO APPROVED",
    text: "Exceptional quality and ergonomic design. These tools make a difference in everyday tasks.",
    name: "Chris Evans",
    role: "Industrial Designer",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1547425260-76bc0fa66b9f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const products = [
  { image: "https://images.unsplash.com/photo-1596436889129-a182a4d7d357?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", name: "Power Drill" }, // Placeholder for drill
  { image: "https://images.unsplash.com/photo-1596436889129-a182a4d7d357?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", name: "Wrench Set" }, // Placeholder for wrench
  { image: "https://images.unsplash.com/photo-1596436889129-a182a4d7d357?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", name: "Claw Hammer" }, // Placeholder for hammer
  { image: "https://images.unsplash.com/photo-1596436889129-a182a4d7d357?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", name: "Screwdriver Kit" }, // Placeholder for screwdriver
  { image: "https://images.unsplash.com/photo-1596436889129-a182a4d7d357?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", name: "Portable Toolbox" }, // Placeholder for toolbox
];

export default function ToolTestimonials() {
  const [index, setIndex] = useState(0);

  const nextSlide = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  // Determine which testimonials to display (up to 3, looping)
  const displayedTestimonials = [];
  for (let i = 0; i < 3; i++) {
    displayedTestimonials.push(testimonials[(index + i) % testimonials.length]);
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 text-center">
      {/* Testimonials Carousel Section */}
      <div className="relative flex justify-center gap-6 mb-8 overflow-hidden py-4"> {/* Added py-4 for space during animation */}
        <AnimatePresence initial={false}> {/* Set initial to false to prevent initial animation */}
          {displayedTestimonials.map((item, i) => (
            <motion.div
              key={item.name} // Use a stable key like item.name or unique ID
              initial={{ opacity: 0, y: 30, x: i * 260 - 260 }} // Initial position for animation
              animate={{ opacity: 1, y: 0, x: i * 0 }} // Animate to visible, aligned
              exit={{ opacity: 0, y: -30 }} // Exit animation
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex-shrink-0 bg-white rounded-xl shadow-md p-5 w-64 text-left border border-gray-100"
            >
              <p className="text-xs uppercase text-gray-500 mb-2 font-semibold">{item.category}</p>
              <p className="text-gray-800 font-medium mb-4 text-base leading-snug">"{item.text}"</p>
              <div className="flex items-center gap-3 mb-2"> {/* Increased gap */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 shadow-sm" // Larger avatar, subtle border
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p> {/* Darker text */}
                  <p className="text-xs text-gray-600">{item.role}</p> {/* Darker text */}
                </div>
              </div>
              <div className="flex items-center mt-2 text-yellow-500">
                {[...Array(5)].map((_, starIdx) => (
                  <Star key={starIdx} size={16} className={starIdx < Math.floor(item.rating) ? "fill-yellow-500 text-yellow-500" : "text-gray-300"} /> // Larger stars
                ))}
                <span className="ml-1 text-sm font-semibold text-gray-700">{item.rating}</span> {/* Larger text */}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Slider Buttons */}
      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={prevSlide}
          className="px-4 py-2 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-600 transition-colors duration-200 transform hover:scale-105" // Themed buttons
        >
          ‹
        </button>
        <button
          onClick={nextSlide}
          className="px-4 py-2 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-600 transition-colors duration-200 transform hover:scale-105" // Themed buttons
        >
          ›
        </button>
      </div>

      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold mb-8">
        Plus <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">250+ professional tools</span> trusted by experts!
      </h2>

      {/* Circular Product Display */}
      <div className="flex justify-center flex-wrap gap-6 md:gap-8"> {/* Increased gap */}
        {products.map((product, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-md bg-gradient-to-br from-blue-100 to-purple-100 border border-gray-100 flex items-center justify-center"> {/* Larger, themed product circles */}
              <img src={product.image} alt={product.name} className="w-2/3 h-2/3 object-contain" /> {/* object-contain for logos */}
            </div>
            <p className="text-sm mt-3 font-medium text-gray-800">{product.name}</p> {/* Darker text */}
          </div>
        ))}
      </div>
    </div>
  );
}
