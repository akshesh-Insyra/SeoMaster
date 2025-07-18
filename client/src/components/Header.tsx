import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/services", label: "All Tools" },
  ];

  const headerVariants = {
    hidden: { y: -60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.3 } },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.header
      // Keep the light, subtle background from the 'Dia' theme
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm"
      initial="hidden"
      animate="visible"
      variants={headerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Colorful and Unique */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
          >
            <Sparkles
              size={30}
              // Vibrant blue-purple icon with a subtle glow, animated
              className="text-indigo-500 animate-pulse-slow drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"
            />
            <h1 className="text-3xl font-extrabold">
              <span
                // Dynamic gradient text: from vibrant blue to electric purple
                className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
              >
                INSYRA
              </span>
            </h1>
            <span className="text-xs text-gray-500 ml-1 mt-1">Tools</span>
          </Link>

          {/* Desktop Nav - Colorful with Attractive Hovers */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-md font-bold rounded-md transition-all duration-300 group
                  ${
                    location === item.href
                      ? // Active link: bright green text, subtle underline, subtle glow
                        "text-emerald-600 after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-[2px] after:bg-emerald-500 after:transition-all after:duration-300 after:-translate-x-1/2 after:w-full shadow-emerald-200/50"
                      : // Inactive link: dark gray, hover to a warm yellow/orange with an underline animation
                        "text-gray-700 hover:text-amber-500 after:absolute after:bottom-0 after:left-1/2 after:w-0 group-hover:after:w-full after:h-[2px] after:bg-amber-400 after:transition-all after:duration-300 after:-translate-x-1/2"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button - Colorful and Animated */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-blue-500 hover:text-purple-600 transition-transform duration-300 hover:scale-110"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu - Light background, colorful items with hovers */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-gray-100 my-2 overflow-hidden bg-white rounded-xl shadow-md"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileMenuVariants}
            >
              <nav className="flex flex-col space-y-2 px-4 py-3">
                {navItems.map((item) => (
                  <motion.div key={item.href} variants={menuItemVariants}>
                    <Link
                      href={item.href}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          location === item.href
                            ? // Active mobile link: subtle light green background, bright green text
                              "bg-emerald-50 text-emerald-700 shadow-sm"
                            : // Inactive mobile link: dark text, hover bg light orange, hover text vibrant orange
                              "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Animations (re-added for desired effects) */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }

        /* Custom underline animation for desktop nav */
        .group:hover .after\\:w-full {
          width: 100%;
        }
      `}</style>
    </motion.header>
  );
}