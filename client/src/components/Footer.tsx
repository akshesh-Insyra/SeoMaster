import { Link } from "wouter";
import { motion } from "framer-motion";
import { Twitter, Linkedin } from "lucide-react";
import { useState, useEffect } from "react"; // Import useState and useEffect

export default function Footer() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      // Get the position relative to the footer itself
      const footer = document.querySelector('footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    const footerElement = document.querySelector('footer');
    if (footerElement) {
      footerElement.addEventListener('mousemove', handleMouseMove);
    } else {
      // Fallback if footer is not immediately available on mount
      // This might make the flare appear across the whole body until footer loads
      document.body.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (footerElement) {
        footerElement.removeEventListener('mousemove', handleMouseMove);
      } else {
        document.body.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden bg-gradient-to-br from-[#1A1C2C] via-[#141624] to-[#0E101A] text-white py-12 border-t border-[#202230] footer-glossy-effect"
      style={{
        '--mouse-x': `${mousePosition.x}px`,
        '--mouse-y': `${mousePosition.y}px`,
      }}
    >
      {/* Flare Cursor Element */}
      <div className="footer-flare-cursor"></div>

      {/* Ensure content is above the flare and glossy overlay */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Branding */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-extrabold mb-4 tracking-wide">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00A389] to-[#FFD700]">
                INSYRA Tools
              </span>
            </h3>
            <p className="text-slate-400 mb-4 text-sm">
              Free online utilities to boost your productivity. Client-side,
              fast, and secure.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Twitter, url: "https://twitter.com" },
                { icon: Linkedin, url: "https://linkedin.com" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[#202230] text-slate-300 hover:text-[#00A389] hover:shadow-lg transition-all duration-200"
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring" }}
                  >
                    <social.icon size={20} />
                  </motion.div>
                </a>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#00A389]">
              Tools
            </h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              {[
                { label: "PDF Merger", href: "/merge-pdf" },
                { label: "Password Remover", href: "/pdf-password-remover" },
                { label: "Invoice Generator", href: "/invoice-generator" },
                { label: "Text Converter", href: "/text-case-converter" },
                { label: "Code Comments", href: "/code-commenting-tool" },
                { label: "Image Converter", href: "/image-converter" },
              ].map((tool, idx) => (
                <li key={idx}>
                  <motion.div whileHover={{ x: 4 }}>
                    <Link
                      href={tool.href}
                      className="hover:text-[#00A389] transition-colors"
                    >
                      {tool.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#AF00C3]">
              Support
            </h4>
            <ul className="space-y-2 text-slate-300 text-sm">
              {[
                "Help Center",
                "Privacy Policy",
                "Terms of Service",
                "Contact Us",
              ].map((item, idx) => (
                <li key={idx}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block"
                  >
                    <a href="#" className="hover:text-[#AF00C3] transition-colors">
                      {item}
                    </a>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 border-t border-[#202230] pt-6 text-center"
        >
          <p className="text-slate-500 text-sm">
            &copy; 2025{" "}
            <span className="text-[#FFD700] font-medium">INSYRA Tools</span>.
            All rights reserved.
          </p>
        </motion.div>
      </div>

      {/* Custom CSS for glossy effect and flare cursor */}
      <style jsx>{`
        /* Glossy Effect (subtle top highlight) */
        .footer-glossy-effect::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 50%; /* Adjust height for desired highlight size */
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.05), /* Subtle white light at top */
            transparent
          );
          pointer-events: none; /* Allows clicks to pass through */
          z-index: 0; /* Ensure it's behind the content but above the base background */
        }

        /* Flare Cursor Effect */
        .footer-flare-cursor {
          --size: 400px; /* Size of the flare */
          --gradient-color-1: rgba(0, 163, 137, 0.4); /* Green accent */
          --gradient-color-2: rgba(175, 0, 195, 0.4); /* Purple accent */
          --gradient-color-3: transparent;

          position: absolute;
          left: var(--mouse-x);
          top: var(--mouse-y);
          width: var(--size);
          height: var(--size);
          transform: translate(-50%, -50%); /* Center the flare on the cursor */
          background: radial-gradient(
            circle at center,
            var(--gradient-color-1) 0%,
            var(--gradient-color-2) 30%,
            var(--gradient-color-3) 70%
          );
          opacity: 0.2; /* Adjust opacity for desired intensity */
          mix-blend-mode: screen; /* Blends nicely with dark background */
          filter: blur(80px); /* Adjust blur for softness */
          border-radius: 50%;
          pointer-events: none; /* Critical: allows mouse events to pass through */
          z-index: 1; /* Ensure it's above the glossy effect, below content */
        }
      `}</style>
    </motion.footer>
  );
}