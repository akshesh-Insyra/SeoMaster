import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function NotFound() {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 20,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Animated Gradient Blobs Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-blue-300/50 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-purple-300/50 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        className="w-full max-w-lg"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/80">
          <CardContent className="p-8 sm:p-12 text-center">
            <motion.div
              className="flex justify-center mb-6"
              variants={itemVariants}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-rose-500 shadow-lg">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
              variants={itemVariants}
            >
              404 - Page Not Found
            </motion.h1>

            <motion.p
              className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed max-w-sm mx-auto"
              variants={itemVariants}
            >
              The page you are looking for might have been removed or is temporarily unavailable.
            </motion.p>
            
            <motion.div
              className="mt-8"
              variants={itemVariants}
            >
              <Link href="/">
                <motion.button 
                  className="bg-indigo-600 text-white rounded-full px-8 py-3 font-semibold shadow-lg hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Return to Homepage
                </motion.button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
