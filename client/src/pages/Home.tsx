import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header"; // Assuming you have this component
import Footer from "@/components/Footer"; // Assuming you have this component

import {
  Sparkles,
  FileText,
  Code,
  Image as ImageIcon,
  Layers,
  ChevronDown,
  Quote,
  Star,
  Send,
} from "lucide-react";

//==================================================================
// NEW: Redesigned Masonry Grid Testimonials Section
//==================================================================

const testimonials = [
  {
    name: "David Lee",
    stars: 4,
    quote:
      "From generating quick ad copy to converting reports, Insyra is my go-to toolkit. Saves me from ad-filled websites.",
    theme: {
      // From white to a vibrant blue gradient
      bg: "bg-gradient-to-br from-sky-500 to-indigo-600",
      text: "text-white",
    },
  },
  {
    name: "Maria Garcia",
    stars: 5,
    quote:
      "The Unit Converter and Text Generator are lifesavers for my assignments. Everything is in one place and super fast.",
    theme: {
      // From lime to a warm orange gradient
      bg: "bg-gradient-to-br from-amber-400 to-orange-500",
      text: "text-white",
    },
  },
  {
    name: "Alex Rivera", // Changed name for variety
    stars: 4,
    quote:
      "I rely on these tools daily. The efficiency and clean interface are top-notch. A must-have for any professional.", // Slightly different quote for variety
    theme: {
      // Kept the purple but made it a gradient
      bg: "bg-gradient-to-br from-fuchsia-500 to-purple-600",
      text: "text-white",
    },
  },
  {
    name: "Kenji Tanaka",
    stars: 5,
    quote:
      "The suite of formatters is indispensable. Clean, fast, and no nonsense. A beautifully designed set of tools.",
    theme: {
      // From white to a sleek dark gradient
      bg: "bg-gradient-to-br from-slate-700 to-gray-900",
      text: "text-white",
    },
  },
  {
    name: "Emily White",
    stars: 5,
    quote:
      "As a writer, the Text Generator is a fantastic source of inspiration. The tools are simple, elegant, and just work.",
    theme: {
      // Kept the rose but made it a gradient
      bg: "bg-gradient-to-br from-pink-500 to-rose-500",
      text: "text-white",
    },
  },
  {
    name: "Chris Peters",
    stars: 5,
    quote:
      "As a writer, the Text Generator is a fantastic source of inspiration. The tools are simple, elegant, and just work.",
    theme: {
      // Added a new green gradient
      bg: "bg-gradient-to-br from-green-400 to-teal-500",
      text: "text-white",
    },
  },
];

const StarRating = ({ count, color }) => (
  <div className="flex gap-1 mb-2">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={20}
        className={i < count ? color : "text-gray-300"}
        fill={i < count ? "currentColor" : "none"}
      />
    ))}
  </div>
);

const TestimonialCard = ({ testimonial, variants }) => {
  const { quote, name, stars, theme } = testimonial;
  const starColor =
    theme.bg === "bg-white" || theme.bg === "bg-lime-300"
      ? "text-yellow-400"
      : "text-yellow-300";

  return (
    <motion.div
      variants={variants}
      className={`p-6 rounded-2xl shadow-lg cursor-pointer break-inside-avoid mb-8 ${theme.bg} ${theme.text}`}
    >
      <StarRating count={stars} color={starColor} />
      <p className="text-base md:text-lg mb-4">"{quote}"</p>
      <p className="font-bold text-sm md:text-base">- {name}</p>
    </motion.div>
  );
};

const ToolTestimonials = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="py-24 md:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={itemVariants}
        >
          <p className="text-indigo-600 font-semibold mb-2">Rating & Reviews</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Trusted by People
          </h2>
        </motion.div>

        <motion.div
          className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
        >
          {testimonials.map((testimonial, i) => (
            <TestimonialCard
              key={i}
              testimonial={testimonial}
              variants={itemVariants}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const ToolCard = ({ icon: Icon, title, description, href, theme }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.03 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
    className="h-full"
  >
    <Link href={href} className="h-full block">
      <div
        className={`relative w-full h-full rounded-3xl p-8 flex flex-col items-center text-center overflow-hidden transition-shadow duration-300 ${theme.gradient} ${theme.shadow}`}
      >
        <div
          className="absolute -inset-2 bg-no-repeat bg-center opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${theme.iconBg}`}
        >
          <Icon size={40} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 z-10">{title}</h3>
        <p className="text-white/80 text-base mb-8 flex-grow z-10">
          {description}
        </p>
        <div
          className={`w-full py-3 px-5 rounded-xl font-semibold text-lg text-white shadow-md z-10 ${theme.gradient}`}
        >
          Use Tool
        </div>
      </div>
    </Link>
  </motion.div>
);

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const heroSection = document.getElementById("hero-section");
    const handleMouseMove = (e) => {
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };
    heroSection?.addEventListener("mousemove", handleMouseMove);
    return () => {
      heroSection?.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const featuredTools = [
    {
      icon: FileText,
      title: "PDF Converter",
      description: "Convert PDFs to various formats and vice versa with ease.",
      href: "/pdf-converter",
      theme: {
        gradient: "bg-gradient-to-br from-blue-500 to-purple-600",
        iconBg: "bg-blue-600",
        shadow: "hover:shadow-2xl hover:shadow-purple-500/30",
      },
    },
    {
      icon: Code,
      title: "Code Formatter",
      description: "Beautify and optimize your code for better readability.",
      href: "/code-formatter",
      theme: {
        gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
        iconBg: "bg-emerald-600",
        shadow: "hover:shadow-2xl hover:shadow-teal-500/30",
      },
    },
    {
      icon: ImageIcon,
      title: "Image Resizer",
      description: "Quickly resize and compress images without losing quality.",
      href: "/image-resizer",
      theme: {
        gradient: "bg-gradient-to-br from-rose-500 to-pink-600",
        iconBg: "bg-rose-600",
        shadow: "hover:shadow-2xl hover:shadow-pink-500/30",
      },
    },
    {
      icon: Layers,
      title: "Unit Converter",
      description: "Convert between different units of measurement instantly.",
      href: "/unit-converter",
      theme: {
        gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
        iconBg: "bg-amber-600",
        shadow: "hover:shadow-2xl hover:shadow-orange-500/30",
      },
    },
    {
      icon: Sparkles,
      title: "Text Generator",
      description: "Generate creative text using AI for various purposes.",
      href: "/text-generator",
      theme: {
        gradient: "bg-gradient-to-br from-indigo-500 to-cyan-500",
        iconBg: "bg-indigo-600",
        shadow: "hover:shadow-2xl hover:shadow-cyan-500/30",
      },
    },
    {
      icon: Send,
      title: "AI Cold Email Generator",
      description: "Create personalized cold emails for sales and outreach.",
      href: "/ai-cold-email-generator",
      theme: {
        gradient: "bg-gradient-to-br from-slate-600 to-gray-800",
        iconBg: "bg-slate-700",
        shadow: "hover:shadow-2xl hover:shadow-gray-500/30",
      },
    },
  ];

  const faqs = [
    {
      q: "What tools do you offer?",
      a: "We offer a comprehensive suite of free online utilities including PDF converters, code formatters, image resizers, unit converters, and more!",
    },
    {
      q: "Are the tools client-side and secure?",
      a: "Yes, all our tools run client-side in your browser, ensuring your data is processed locally and securely.",
    },
    {
      q: "Is registration required?",
      a: "No, absolutely not! All tools are 100% free to use with no registration required.",
    },
    {
      q: "How can I suggest a new tool?",
      a: "We'd love to hear your ideas! Please use the 'Contact Us' link in the footer to send us your suggestions.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col bg-slate-50 text-gray-800">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-blue-300/50 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 -right-1/4 w-96 h-96 bg-purple-300/50 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-300/50 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <main className="flex-1">
        <section
          id="hero-section"
          className="relative py-28 md:py-40 flex items-center justify-center text-center overflow-hidden"
          style={{
            "--mouse-x": `${mousePosition.x}px`,
            "--mouse-y": `${mousePosition.y}px`,
          }}
        >
          <div className="hero-flare" />
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.h1
              className="text-5xl md:text-7xl font-extrabold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span className="text-gray-900">INSYRA</span>{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Tools
              </span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            >
              Free, Fast, & Secure Online Utilities for a Smarter Workflow.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 12,
                delay: 0.4,
              }}
            >
              <Link href="/services">
                <Button
                  size="lg"
                  className="bg-indigo-600 text-white rounded-full px-10 py-6 text-lg font-semibold shadow-lg hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  Explore All Tools
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="py-24 md:py-32 bg-white/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={itemVariants}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Featured Tools
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our most popular tools, meticulously crafted to boost your
                productivity.
              </p>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={containerVariants}
            >
              {featuredTools.map((tool, i) => (
                <motion.div key={i} variants={itemVariants} className="h-full">
                  <ToolCard {...tool} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <ToolTestimonials />

        <section className="py-24 md:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={itemVariants}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                FAQs
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Quick answers to common questions.
              </p>
            </motion.div>
            <motion.div
              className="space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={containerVariants}
            >
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden"
                  variants={itemVariants}
                >
                  <button
                    className="w-full flex justify-between items-center text-left p-6 text-lg font-medium text-gray-800"
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                  >
                    <span>{faq.q}</span>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                    >
                      <ChevronDown size={24} />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openIndex === index && (
                      <motion.div
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                          open: { opacity: 1, height: "auto" },
                          collapsed: { opacity: 0, height: 0 },
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="px-6 pb-6 text-gray-600"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
