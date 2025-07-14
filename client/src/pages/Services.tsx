import { useState, useMemo } from "react"; // Import useMemo for performance optimization
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  FileText,
  Unlock,
  Receipt,
  Type,
  Code,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Users,
  Wallet,
  CalendarDays,
  AreaChart,
  Palette,
  Mail,
  Mic,
  Search, // New: Import Search icon for the search bar
  Lightbulb,
  BookOpen,
  ImageOff, // For suggestions if needed, or other generic tips
} from "lucide-react";

// Assuming you have this Input component available
import { Input } from "@/components/ui/input";
import { title } from "process";

// The ToolCard component needs to accept an iconBgClass prop
const ToolCard = ({ icon: Icon, title, description, href, iconBgClass }) => (
  <motion.div
    className="bg-[#202230] rounded-2xl border border-[#363A4D] shadow-lg p-6 flex flex-col items-center text-center hover:shadow-[0_0_24px_#00A389]/30 hover:-translate-y-2 transition-all duration-300"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
  >
    {/* Use the dynamically passed iconBgClass here */}
    <div className={`p-4 rounded-full ${iconBgClass} mb-4 shadow-lg`}>
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

// Define the full list of tools
const allTools = [
  {
    title: "PDF Merger",
    description:
      "Combine multiple PDF files into one document with drag-and-drop functionality.",
    icon: FileText,
    href: "/merge-pdf",
    iconBgClass: "bg-gradient-to-br from-cyan-500 to-blue-500",
  },
  {
    title: "PDF Password Remover",
    description:
      "Remove passwords from PDF files you own. Secure and client-side processing.",
    icon: Unlock,
    href: "/pdf-password-remover",
    iconBgClass: "bg-gradient-to-br from-red-500 to-orange-500",
  },
  {
    title: "Invoice Generator",
    description:
      "Create professional invoices with automatic calculations and PDF export.",
    icon: Receipt,
    href: "/invoice-generator",
    iconBgClass: "bg-gradient-to-br from-lime-500 to-green-500",
  },
  {
    title: "Text Case Converter",
    description:
      "Convert text between uppercase, lowercase, sentence case, and title case.",
    icon: Type,
    href: "/text-case-converter",
    iconBgClass: "bg-gradient-to-br from-teal-500 to-emerald-500",
  },
  {
    title: "Code Commenting Tool",
    description:
      "Automatically add meaningful comments to your code for better documentation.",
    icon: Code,
    href: "/code-commenting-tool",
    iconBgClass: "bg-gradient-to-br from-fuchsia-500 to-pink-500",
  },
  {
    title: "Image Converter",
    description:
      "Convert HEIC images to JPG or PNG format for universal compatibility.",
    icon: ImageIcon,
    href: "/image-converter",
    iconBgClass: "bg-gradient-to-br from-blue-500 to-purple-500",
  },
  {
    title: "Text Generator",
    description: "Generate creative text using AI for various purposes.",
    icon: Sparkles,
    href: "/text-generator",
    iconBgClass: "bg-gradient-to-br from-rose-500 to-red-500",
  },
  {
    title: "Unit Converter",
    description: "Convert between different units of measurement instantly.",
    icon: Layers,
    href: "/unit-converter",
    iconBgClass: "bg-gradient-to-br from-indigo-500 to-blue-500",
  },
  {
    title: "AI Email Assistant",
    description: "Draft professional emails and responses quickly with AI.",
    icon: Mail,
    href: "/email-assistant",
    iconBgClass: "bg-gradient-to-br from-purple-600 to-indigo-600",
  },
  {
    title: "AI Color Palette Generator",
    description:
      "Generate harmonious color palettes based on moods, themes, or keywords using AI.",
    icon: Palette,
    href: "/color-palette",
    iconBgClass: "bg-gradient-to-br from-yellow-500 to-orange-500",
  },
  {
    title: "AI Interview Practice",
    description:
      "Practice interview questions specific to your job role and get AI feedback.",
    icon: Mic,
    href: "/interview-practice",
    iconBgClass: "bg-gradient-to-br from-blue-400 to-sky-500",
  },
  {
    title: "AI Interview Study Guide",
    description:
      "Get comprehensive theoretical concepts and questions for any tech topic.",
    icon: BookOpen,
    href: "/interview-study-guide",
    iconBgClass: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    title: "Character Counter",
    description: "Count characters, words, and lines in your text.",
    icon: FileText,
    href: "/character-counter",
    iconBgClass: "bg-gradient-to-br from-teal-400 to-cyan-500",
  },
  {
    title: "Plagiarism Checker",
    description:
      "Check for semantic similarity and potential rephrasing using AI.",
    icon: Search,
    href: "/plagiarism-checker",
    iconBgClass: "bg-gradient-to-br from-green-500 to-teal-500",
  },
  {
    title: "AI Idea Generator",
    description: "Generate creative ideas for projects, content, and more.",
    icon: Lightbulb,
    href: "/ai-idea-generator",
    iconBgClass: "bg-gradient-to-br from-yellow-500 to-orange-500",
  },
  {
    title: "Watermark Remover",
    description: "Remove watermarks from images using advanced AI techniques.",
    icon: ImageOff,
    href: "/watermark-remover",
    iconBgClass: "bg-gradient-to-br from-red-500 to-orange-500",
  },
  {
    title: "Cover Letter Generator",
    description:
      "Create personalized cover letters tailored to specific job applications.",
    icon: Mail,
    href: "/cover-letter-generator",
    iconBgClass: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    title: "AI Recruiter Message Generator",
    description:
      "Generate professional messages for recruiters to enhance your job search.",
    icon: Users,
    href: "/ai-recruiter-message-generator",
    iconBgClass: "bg-gradient-to-br from-blue-500 to-indigo-500",
  },
  {
    title: "AI Brainstorming Assistant",
    description:
      "Collaborate with AI to brainstorm ideas, solve problems, and enhance creativity.",
    icon: Lightbulb,
    href: "/ai-brainstorming-assistant",
    iconBgClass: "bg-gradient-to-br from-green-500 to-lime-500",
  },
  {
    title: "AI Cold Email Generator",
    description:
      "Generate personalized cold emails to engage potential clients or partners.",
    icon: Mail,
    href: "/ai-cold-email-generator",
    iconBgClass: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    title: "AI Content Humanizer",
    description:
      "Transform AI-generated content into more human-like, engaging text.",
    icon: Type,
    href: "/ai-content-humanizer",
    iconBgClass: "bg-gradient-to-br from-blue-500 to-purple-500",
  },
];

export default function Services() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTools = useMemo(() => {
    if (!searchTerm) {
      return allTools;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return allTools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(lowercasedSearchTerm) ||
        tool.description.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [searchTerm]);

  const suggestedTools = useMemo(() => {
    if (!searchTerm) {
      return allTools.slice(0, 4);
    }
    return [];
  }, [searchTerm]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden flex flex-col mt-[-50vh] pt-[50vh]">
      <div className="absolute inset-0 bg-[#0E101A] z-0"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#00A389] rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob z-0"></div>
      <div className="absolute top-10 right-0 w-72 h-72 bg-[#AF00C3] rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-blob animation-delay-2000 z-0"></div>

      {/* Main content wrapper, now with the backdrop-blur effect */}
      <div className="relative z-10 flex flex-col flex-1 bg-[#0E101A]/80 backdrop-blur-sm">
        <main className="py-20 flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.h1
                className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00A389] to-[#FFD700]"
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
              >
                All Tools
              </motion.h1>
              <motion.p
                className="text-slate-400 max-w-2xl mx-auto text-lg"
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                transition={{
                  ...sectionVariants.visible.transition,
                  delay: 0.2,
                }}
              >
                Complete collection of productivity tools to streamline your
                workflow and boost efficiency.
              </motion.p>
            </div>

            {/* Search Bar */}
            <motion.div
              className="max-w-xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for tools... (e.g., PDF, AI, Text, Converter)"
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00A389]/50 focus:border-[#00A389] shadow-sm text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </motion.div>

            {/* Display Filtered Tools or All Tools */}
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.title} {...tool} />
                ))}
              </div>
            ) : (
              <motion.div
                className="text-center text-slate-400 text-lg py-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p>No tools found matching "{searchTerm}".</p>
                <p>Please try a different search term.</p>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Blob and Gradient Animation styles */}
      <style>{`
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
      `}</style>
    </div>
  );
}
