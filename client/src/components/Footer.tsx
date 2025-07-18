import { Link } from "wouter";
import { motion } from "framer-motion";
import { Twitter, Linkedin, Heart } from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      const footer = document.getElementById("main-footer");
      if (footer) {
        const rect = footer.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const footerLinks = {
    tools: [
      { label: "PDF Merger", href: "/merge-pdf" },
      { label: "Password Remover", href: "/pdf-password-remover" },
      { label: "Invoice Generator", href: "/invoice-generator" },
      { label: "Text Converter", href: "/text-case-converter" },
      { label: "Image Converter", href: "/image-converter" },
    ],
    support: [
      { label: "Help Center", href: "/help" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact Us", href: "/contact" },
    ],
  };

  return (
    <motion.footer
      id="main-footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative overflow-hidden bg-white text-gray-800 py-16 border-t border-gray-200"
      style={{
        "--mouse-x": `${mousePosition.x}px`,
        "--mouse-y": `${mousePosition.y}px`,
      }}
    >
      {/* Aurora Background Effect for Light Theme */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="aurora-bg-light"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Branding Section */}
          <div className="md:col-span-2">
            <h3 className="text-3xl font-extrabold mb-4 text-gray-900">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                INSYRA Tools
              </span>
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm">
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
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:text-white transition-all duration-300 hover:bg-indigo-500 shadow-sm hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <social.icon size={20} />
                  </motion.div>
                </a>
              ))}
            </div>
          </div>

          {/* Tools Links */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-emerald-500 tracking-wider">
              Tools
            </h4>
            <ul className="space-y-3">
              {footerLinks.tools.map((tool, idx) => (
                <li key={idx}>
                  <motion.div whileHover={{ x: 4 }}>
                    <Link
                      href={tool.href}
                      className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                    >
                      {tool.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-semibold mb-5 text-amber-500 tracking-wider">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((item, idx) => (
                <li key={idx}>
                  <motion.div whileHover={{ x: 4 }}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-200 pt-8 text-center text-gray-500">
          <p className="flex items-center justify-center gap-2">
            &copy; 2025 INSYRA Tools. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        .aurora-bg-light {
          position: absolute;
          inset: 0;
          background: radial-gradient(
              800px circle at var(--mouse-x) var(--mouse-y),
              rgba(165, 180, 252, 0.2),
              /* Soft Indigo */ transparent 40%
            ),
            radial-gradient(
              600px circle at calc(var(--mouse-x) + 200px)
                calc(var(--mouse-y) + 100px),
              rgba(196, 181, 253, 0.2),
              /* Soft Purple */ transparent 40%
            );
          mix-blend-mode: screen;
          filter: blur(100px);
          transition: background 0.2s ease-out;
        }
      `}</style>
    </motion.footer>
  );
}
