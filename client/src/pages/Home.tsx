import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// HeroMockup import removed as it's not part of this specific hero redesign scope
// import HeroMockup from "@/components/HeroMockup";

import {
  Sparkles,
  FileText,
  Code,
  Image as ImageIcon,
  Layers,
  UploadCloud,
  PlayCircle,
  DownloadCloud,
  Quote,
  ChevronLeft,
  ChevronRight,
  UserRound,
  Wallet,
  CalendarDays,
  LineChart,
} from "lucide-react";

// Reusing ToolCard and FeatureCard (no changes needed for this request)
const ToolCard = ({ icon: Icon, title, description, href }) => (
  <motion.div
    className="bg-[#202230] rounded-2xl border border-[#363A4D] shadow-lg p-6 flex flex-col items-center text-center hover:shadow-[0_0_24px_#00A389]/30 hover:-translate-y-2 transition-all duration-300"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
  >
    <div className="p-4 rounded-full bg-gradient-to-br from-[#00A389] to-[#FFD700] mb-4 shadow-lg">
      <Icon size={32} className="text-white" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm mb-4">{description}</p>
    <Link href={href}>
      <button className="bg-gradient-to-r from-[#00A389] to-[#FFD700] hover:brightness-110 text-black font-semibold px-6 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-xl">
        Use Tool
      </button>
    </Link>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, description, iconBgClass }) => (
  <motion.div
    className="bg-[#202230] rounded-2xl border border-[#363A4D] shadow-lg p-6 flex flex-col items-center text-center"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <div className={`p-4 rounded-full mb-4 shadow-lg ${iconBgClass}`}>
      <Icon size={32} className="text-white" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm">{description}</p>
  </motion.div>
);

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [direction, setDirection] = useState(0);

  // State for hero section cursor flare
  const [heroMousePosition, setHeroMousePosition] = useState({ x: 0, y: 0 });
  const [isHeroHovering, setIsHeroHovering] = useState(false);

  // Effect to handle mouse movement for hero flare
  useEffect(() => {
    const heroSection = document.getElementById("hero-section"); // Get the hero section element
    const handleMouseMove = (event) => {
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        setHeroMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    const handleMouseEnter = () => setIsHeroHovering(true);
    const handleMouseLeave = () => setIsHeroHovering(false);

    if (heroSection) {
      heroSection.addEventListener("mousemove", handleMouseMove);
      heroSection.addEventListener("mouseenter", handleMouseEnter);
      heroSection.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (heroSection) {
        heroSection.removeEventListener("mousemove", handleMouseMove);
        heroSection.removeEventListener("mouseenter", handleMouseEnter);
        heroSection.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []); // Run once on mount

  const featuredTools = [
    {
      icon: FileText,
      title: "PDF Converter",
      description: "Convert PDFs to various formats and vice versa with ease.",
      href: "/tools/pdf-converter",
    },
    {
      icon: Code,
      title: "Code Formatter",
      description: "Beautify and optimize your code for better readability.",
      href: "/tools/code-formatter",
    },
    {
      icon: ImageIcon,
      title: "Image Resizer",
      description: "Quickly resize and compress images without losing quality.",
      href: "/tools/image-resizer",
    },
    {
      icon: Layers,
      title: "Unit Converter",
      description: "Convert between different units of measurement instantly.",
      href: "/tools/unit-converter",
    },
    {
      icon: Sparkles,
      title: "Text Generator",
      description: "Generate creative text using AI for various purposes.",
      href: "/tools/text-generator",
    },
    {
      icon: FileText,
      title: "JSON Formatter",
      description: "Format and validate JSON data for easy debugging.",
      href: "/tools/json-formatter",
    },
  ];

  const testimonials = [
    {
      quote:
        "INSYRA Tools has revolutionized my workflow! The PDF merger is incredibly fast and reliable. A must-have for anyone dealing with documents daily.",
      author: "Jane Doe",
      title: "Marketing Manager",
      avatar: "https://placehold.co/100x100/6f00ff/ffffff?text=JD",
    },
    {
      quote:
        "As a developer, the Code Commenting Tool saves me hours. It's accurate, intelligent, and integrates seamlessly into my routine. Highly recommended!",
      author: "John Smith",
      title: "Software Engineer",
      avatar: "https://placehold.co/100x100/ff00c3/ffffff?text=JS",
    },
    {
      quote:
        "I frequently need to resize images for our website, and INSYRA's Image Resizer is a lifesaver. Simple, efficient, and maintains quality.",
      author: "Emily White",
      title: "Web Designer",
      avatar: "https://placehold.co/100x100/00FFD1/ffffff?text=EW",
    },
  ];

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentTestimonial(
      (prev) =>
        (prev + newDirection + testimonials.length) % testimonials.length
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentTestimonial]);

  const heroVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut", delay: 0.7 },
    },
  };

  const sectionHeaderVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const processStepVariants = {
    hidden: { opacity: 0, scale: 0.7, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const testimonialVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1500 : -1500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
    exit: (direction) => ({
      x: direction < 0 ? 1500 : -1500,
      opacity: 0,
      transition: { duration: 1, ease: "easeOut" },
    }),
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden flex flex-col mt-[-50vh] pt-[50vh]">
      {/* Absolute positioned background layer for the base color */}
      <div className="absolute inset-0 bg-[#0E101A] z-0"></div>

      {/* Background glowing blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#00A389] rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob z-0"></div>
      <div className="absolute top-10 right-0 w-72 h-72 bg-[#AF00C3] rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-2000 z-0"></div>

      {/* Main content wrapper, now with the backdrop-blur effect */}
      <div className="relative z-10 flex flex-col flex-1 bg-[#0E101A]/80 backdrop-blur-sm">
        {/* Hero Section - With only flare cursor */}
        <section
          id="hero-section" // Add ID for mouse tracking
          className="py-20 md:py-32 relative overflow-hidden flex items-center justify-center min-h-[80vh] text-center"
          style={{
            "--mouse-x": `${heroMousePosition.x}px`,
            "--mouse-y": `${heroMousePosition.y}px`,
          }}
        >
          {/* Hero Section Flare Cursor */}
          {isHeroHovering && <div className="hero-flare-cursor"></div>}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {" "}
            {/* Content wrapper */}
            <div className="text-center">
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-tight"
                variants={heroVariants}
                initial="hidden"
                animate="visible"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A389] to-[#FFD700]">
                  INSYRA
                </span>{" "}
                Tools
              </motion.h1>
              <motion.p
                className="text-xl sm:text-2xl text-slate-300 mb-4 max-w-4xl mx-auto"
                variants={heroVariants}
                initial="hidden"
                animate="visible"
                transition={{ ...heroVariants.visible.transition, delay: 0.2 }}
              >
                Free Online Utilities for a Smarter Workflow.
              </motion.p>
              <motion.p
                className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10"
                variants={heroVariants}
                initial="hidden"
                animate="visible"
                transition={{ ...heroVariants.visible.transition, delay: 0.4 }}
              >
                Unlock peak productivity with our comprehensive suite of
                powerful, free online tools. From seamless PDF management to
                intelligent code optimization and creative text generation, we
                provide everything you need to streamline your digital tasks.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
              >
                <Link href="/services">
                  <button className="bg-[#00A389] hover:bg-[#008F79] text-white font-semibold px-10 py-4 rounded-full transition-all duration-300 shadow-md hover:shadow-xl">
                    Get Started
                  </button>
                </Link>
                <Button
                  variant="outline"
                  className="border-2 border-[#AF00C3] text-[#AF00C3] hover:bg-[#AF00C3]/20 hover:text-white rounded-full px-10 py-6  text-lg transition-all duration-300"
                >
                  Learn More
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.h2
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionHeaderVariants}
              >
                Featured Tools
              </motion.h2>
              <motion.p
                className="text-slate-400 max-w-2xl mx-auto text-lg"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionHeaderVariants}
                transition={{
                  ...sectionHeaderVariants.visible.transition,
                  delay: 0.2,
                }}
              >
                Discover our most popular and essential productivity tools,
                meticulously crafted to save you time and maximize your
                efficiency.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {featuredTools.map((tool) => (
                <ToolCard key={tool.title} {...tool} />
              ))}
            </div>

            <div className="text-center mt-12 md:mt-16">
              <Link href="/services">
                <button className="bg-gradient-to-r from-[#00A389] to-[#FFD700] hover:brightness-110 text-black font-semibold px-8 py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-xl">
                  View All Tools
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-[#1a1c2c]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.h2
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionHeaderVariants}
              >
                How It Works
              </motion.h2>
              <motion.p
                className="text-slate-400 max-w-2xl mx-auto text-lg"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionHeaderVariants}
                transition={{
                  ...sectionHeaderVariants.visible.transition,
                  delay: 0.2,
                }}
              >
                Experience seamless productivity in just a few simple steps.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <motion.div
                className="flex flex-col items-center p-6 bg-[#202230] rounded-2xl border border-[#363A4D] shadow-xl"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={processStepVariants}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00A389] to-[#FFD700] flex items-center justify-center mb-4 shadow-lg">
                  <UploadCloud size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  1. Upload Your File
                </h3>
                <p className="text-slate-400">
                  Drag and drop or select files from your device.
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center p-6 bg-[#202230] rounded-2xl border border-[#363A4D] shadow-xl"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={processStepVariants}
                transition={{
                  ...processStepVariants.visible.transition,
                  delay: 0.2,
                }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] to-[#AF00C3] flex items-center justify-center mb-4 shadow-lg">
                  <PlayCircle size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  2. Process Instantly
                </h3>
                <p className="text-slate-400">
                  Our tools process your data securely in seconds.
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center p-6 bg-[#202230] rounded-2xl border border-[#363A4D] shadow-xl"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={processStepVariants}
                transition={{
                  ...processStepVariants.visible.transition,
                  delay: 0.4,
                }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#AF00C3] to-[#00A389] flex items-center justify-center mb-4 shadow-lg">
                  <DownloadCloud size={40} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  3. Download Your Result
                </h3>
                <p className="text-slate-400">
                  Get your processed file or text instantly.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.h2
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionHeaderVariants}
              >
                What Our Users Say
              </motion.h2>
              <motion.p
                className="text-slate-400 max-w-2xl mx-auto text-lg"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionHeaderVariants}
                transition={{
                  ...sectionHeaderVariants.visible.transition,
                  delay: 0.2,
                }}
              >
                Hear from satisfied users who boost their productivity with
                INSYRA Tools.
              </motion.p>
            </div>

            <div className="relative w-full h-[300px] sm:h-[350px] md:h-[400px] overflow-hidden rounded-2xl bg-[#202230] border border-[#363A4D] shadow-xl p-8 flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentTestimonial}
                  custom={direction}
                  variants={testimonialVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                >
                  <Quote size={48} className="text-[#00A389] mb-6 opacity-70" />
                  <p className="text-xl sm:text-2xl italic text-slate-300 mb-6 leading-relaxed max-w-2xl">
                    "{testimonials[currentTestimonial].quote}"
                  </p>
                  <img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].author}
                    className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-[#FFD700]"
                  />
                  <p className="font-semibold text-white text-lg">
                    {testimonials[currentTestimonial].author}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {testimonials[currentTestimonial].title}
                  </p>
                </motion.div>
              </AnimatePresence>

              <button
                onClick={() => paginate(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-[#00A389]"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={24} className="text-white" />
              </button>
              <button
                onClick={() => paginate(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-[#00A389]"
                aria-label="Next testimonial"
              >
                <ChevronRight size={24} className="text-white" />
              </button>

              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentTestimonial ? 1 : -1);
                      setCurrentTestimonial(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? "bg-[#00A389] w-6"
                        : "bg-slate-600"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 bg-gradient-to-r from-[#00A389] to-[#FFD700] text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              className="text-4xl sm:text-5xl font-bold text-black mb-6 leading-tight"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={sectionHeaderVariants}
            >
              Ready to Boost Your Productivity?
            </motion.h2>
            <motion.p
              className="text-xl text-black opacity-90 mb-8 max-w-3xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={sectionHeaderVariants}
              transition={{
                ...sectionHeaderVariants.visible.transition,
                delay: 0.2,
              }}
            >
              Explore our full suite of free online tools designed to make your
              daily tasks easier and faster. Join thousands of satisfied users
              today!
            </motion.p>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={buttonVariants}
            >
              <Link href="/services">
                <Button className="bg-[#202230] text-[#00A389] hover:bg-[#363A4D] rounded-full px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Get Started Now
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>

      <style jsx>{`
        /* Global Blob Animation (used in main container) */
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0.4, 1);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }

        /* Hero Section Flare Cursor */
        .hero-flare-cursor {
          --size: 500px; /* Larger flare for hero */
          --gradient-color-1: rgba(0, 163, 137, 0.2); /* Green accent */
          --gradient-color-2: rgba(255, 215, 0, 0.2); /* Yellow accent */
          --gradient-color-3: transparent;

          position: absolute;
          left: var(--mouse-x);
          top: var(--mouse-y);
          width: var(--size);
          height: var(--size);
          transform: translate(-50%, -50%);
          background: radial-gradient(
            circle at center,
            var(--gradient-color-1) 0%,
            var(--gradient-color-2) 30%,
            var(--gradient-color-3) 70%
          );
          opacity: 0; /* Initially hidden */
          transition: opacity 0.3s ease; /* Smooth fade in/out */
          mix-blend-mode: screen;
          filter: blur(100px); /* Soft blur */
          border-radius: 50%;
          pointer-events: none; /* Allows clicks to pass through */
          z-index: 0; /* Behind main content, above background layers */
        }
        /* Show flare only when hovering hero section */
        #hero-section:hover > .hero-flare-cursor {
          opacity: 0.3; /* Increased opacity when hovered */
        }
      `}</style>
    </div>
  );
}
