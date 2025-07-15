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
      className="sticky top-0 z-50 bg-transparent backdrop-blur-md border-b border-[#2d314d] shadow-[0_0_30px_#00FFD1]/20"
      initial="hidden"
      animate="visible"
      variants={headerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300"
          >
            <Sparkles
              size={30}
              // Icon color and shadow changed to green accent
              className="text-[#00A389] animate-pulse-slow drop-shadow-[0_0_8px_#00A389]"
            />
            <h1 className="text-3xl font-extrabold">
              <span
                // Text gradient updated to green/yellow, static (removed animate-gradient-move)
                className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A389] to-[#FFD700]"
              >
                INSYRA
              </span>
            </h1>
            {/* Adjusted text color for "Tools" */}
            <span className="text-xs text-slate-400 ml-1 mt-1">Tools</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-300
                  ${
                    location === item.href
                      ? // Active link: green text, border, and shadow (Crickworks accent)
                        "text-[#00A389] border-b-2 border-[#00A389] shadow-[0_0_8px_#00A389]/40"
                      : // Inactive link: softer grey, hover to purple with subtle shadow (Crickworks accent)
                        "text-slate-300 hover:text-[#AF00C3] hover:shadow-[0_0_10px_#AF00C3]/40"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              // Mobile menu icon: softer grey, hover to green (Crickworks accent)
              className="text-slate-300 hover:text-[#00A389] transition-transform duration-300 hover:scale-110"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-[#363A4D] my-2 overflow-hidden bg-[#1A1C2C] backdrop:blur-sm rounded-lg shadow-lg"
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
                      className={`block px-4 py-3 rounded-md text-sm font-medium transition-all duration-200
                        ${
                          location === item.href
                            ? // Active mobile link: background matching cards, green text
                              "bg-[#202230] text-[#00A389] shadow-md"
                            : // Inactive mobile link: softer grey, hover bg slightly lighter
                              "text-slate-300 hover:text-[#AF00C3] hover:bg-[#141624]"
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                {/* Mobile action buttons (optional, moved from desktop nav for mobile view) */}
                <div className="pt-4 flex flex-col space-y-2">
                  
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Animations (kept for consistency with the component's original features) */}
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
      `}</style>
    </motion.header>
  );
}
