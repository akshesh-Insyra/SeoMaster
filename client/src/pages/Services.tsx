import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

import {
  FileText, Unlock, Receipt, CaseUpper, Code2, Image, Scale, PenSquare, Mail,
  Palette, Mic, BookOpen, Baseline, ShieldCheck, Eraser, Lightbulb, FileSignature,
  MessageSquareQuote, Brain, Send, UserRound, Search
} from 'lucide-react';

// Updated ToolCard with a glassmorphism design and enhanced animations
const ToolCard = ({ icon: Icon, title, description, href, iconBgClass }) => (
  <motion.div
    className="relative w-full h-full"
    whileHover="hover"
    variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    }}
  >
    <div className="absolute -inset-px bg-gradient-to-r from-cyan-400 to-purple-500 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    <Link href={href} className="relative h-full block bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-8 flex flex-col items-center text-center overflow-hidden group">
        <motion.div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${iconBgClass}`}
            variants={{ hover: { scale: 1.1, rotate: 10 } }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Icon size={32} className="text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
            {title}
        </h3>
        <p className="text-gray-600 text-sm mb-6 flex-grow">
            {description}
        </p>
        <motion.div
            className="w-full py-3 px-5 rounded-xl font-semibold text-base bg-indigo-600 text-white shadow-md group-hover:bg-indigo-700 transition-all duration-300"
            whileTap={{ scale: 0.95 }}
        >
            Use Tool
        </motion.div>
    </Link>
  </motion.div>
);

const allTools = [
  // PDF Tools
  {
    title: "PDF Merger",
    description: "Combine multiple PDF files into one single document.",
    icon: FileText,
    href: "/merge-pdf",
    iconBgClass: "bg-gradient-to-br from-cyan-400 to-blue-500",
  },
  {
    title: "PDF Password Remover",
    description: "Remove passwords and restrictions from PDF files.",
    icon: Unlock,
    href: "/pdf-password-remover",
    iconBgClass: "bg-gradient-to-br from-red-500 to-orange-400",
  },
  // Document & Utility Tools
  {
    title: "Invoice Generator",
    description: "Create and download professional invoices in minutes.",
    icon: Receipt,
    href: "/invoice-generator",
    iconBgClass: "bg-gradient-to-br from-lime-500 to-green-500",
  },
  {
    title: "Text Case Converter",
    description: "Convert text between uppercase, lowercase, and more.",
    icon: CaseUpper,
    href: "/text-case-converter",
    iconBgClass: "bg-gradient-to-br from-slate-500 to-gray-600",
  },
  {
    title: "Character Counter",
    description: "Count characters, words, sentences, and paragraphs.",
    icon: Baseline,
    href: "/character-counter",
    iconBgClass: "bg-gradient-to-br from-emerald-400 to-teal-500",
  },
  {
    title: "Image Converter",
    description: "Convert images to JPG, PNG, WEBP, and other formats.",
    icon: Image,
    href: "/image-converter",
    iconBgClass: "bg-gradient-to-br from-sky-500 to-purple-500",
  },
  {
    title: "Unit Converter",
    description: "Convert between different units of measurement.",
    icon: Scale,
    href: "/unit-converter",
    iconBgClass: "bg-gradient-to-br from-indigo-400 to-blue-500",
  },
  {
    title: "Plagiarism Checker",
    description: "Check for duplicate content and ensure originality.",
    icon: ShieldCheck,
    href: "/plagiarism-checker",
    iconBgClass: "bg-gradient-to-br from-green-500 to-lime-600",
  },
  // AI Writing & Content Tools
  {
    title: "AI Brainstorming Assistant",
    description: "Generate unique and creative ideas for any topic.",
    icon: Brain,
    href: "/ai-brainstorming-assistant",
    iconBgClass: "bg-gradient-to-br from-teal-400 to-cyan-500",
  },
  {
    title: "AI Content Humanizer",
    description: "Rewrite AI-generated text to sound more human.",
    icon: UserRound,
    href: "/ai-content-humanizer",
    iconBgClass: "bg-gradient-to-br from-orange-500 to-amber-600",
  },
  {
    title: "AI Idea Generator",
    description: "Get new ideas for startups, projects, and more.",
    icon: Lightbulb,
    href: "/ai-idea-generator",
    iconBgClass: "bg-gradient-to-br from-amber-400 to-yellow-500",
  },
  {
    title: "AI Text Generator",
    description: "Generate high-quality articles and content with AI.",
    icon: PenSquare,
    href: "/text-generator",
    iconBgClass: "bg-gradient-to-br from-rose-500 to-red-600",
  },
  {
    title: "AI Code Commenter",
    description: "Automatically add meaningful comments to your code.",
    icon: Code2,
    href: "/code-commenting-tool",
    iconBgClass: "bg-gradient-to-br from-fuchsia-500 to-pink-500",
  },
  {
    title: "AI Color Palette Generator",
    description: "Generate harmonious color schemes from a prompt.",
    icon: Palette,
    href: "/color-palette-generator",
    iconBgClass: "bg-gradient-to-br from-yellow-400 to-orange-500",
  },
  // AI Career & Communication Tools
  {
    title: "AI Email Assistant",
    description: "Draft professional emails and responses quickly.",
    icon: Mail,
    href: "/email-assistant",
    iconBgClass: "bg-gradient-to-br from-purple-500 to-indigo-500",
  },
  {
    title: "AI Cold Email Generator",
    description: "Create personalized cold emails for sales and outreach.",
    icon: Send,
    href: "/ai-cold-email-generator",
    iconBgClass: "bg-gradient-to-br from-blue-500 to-sky-600",
  },
  {
    title: "AI Cover Letter Generator",
    description: "Write tailored cover letters for job applications.",
    icon: FileSignature,
    href: "/cover-letter-generator",
    iconBgClass: "bg-gradient-to-br from-blue-600 to-indigo-700",
  },
  {
    title: "AI Recruiter Message Generator",
    description: "Craft effective messages to recruiters on LinkedIn.",
    icon: MessageSquareQuote,
    href: "/ai-recruiter-message-generator",
    iconBgClass: "bg-gradient-to-br from-sky-600 to-cyan-700",
  },
  {
    title: "AI Interview Practice",
    description: "Practice for interviews and get instant AI feedback.",
    icon: Mic,
    href: "/interview-practice",
    iconBgClass: "bg-gradient-to-br from-blue-400 to-sky-500",
  },
  {
    title: "AI Interview Study Guide",
    description: "Get concepts and questions for any tech topic.",
    icon: BookOpen,
    href: "/interview-study-guide",
    iconBgClass: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
  },
];

export default function Services() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTools = useMemo(() => {
    if (!searchTerm) return allTools;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return allTools.filter(
      (tool) =>
        tool.title.toLowerCase().includes(lowercasedSearchTerm) ||
        tool.description.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [searchTerm]);

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  return (
    <div className="min-h-screen w-full bg-gray-100/50 relative overflow-hidden flex flex-col">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 py-24 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              All Tools
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              A complete collection of productivity tools to streamline your workflow.
            </p>
          </motion.div>

          <motion.div 
            className="max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for tools... (e.g., PDF, AI, Text)"
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white/60 backdrop-blur-sm border-2 border-transparent focus:border-purple-400 focus:ring-0 text-gray-800 placeholder-gray-500 shadow-lg text-base transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </motion.div>

          {filteredTools.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredTools.map((tool) => (
                <ToolCard key={tool.title} {...tool} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center text-gray-600 text-lg py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-2xl font-semibold mb-2">No tools found</p>
              <p>Try searching for something else like "PDF" or "Converter".</p>
            </motion.div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 8s infinite cubic-bezier(0.6, 0.01, 0.4, 1);
        }
        .animation-delay-2000 { animation-delay: -2s; }
        .animation-delay-4000 { animation-delay: -4s; }
      `}</style>
    </div>
  );
}
