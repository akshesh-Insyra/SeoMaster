import { Card, CardContent } from "@/components/ui/card"; // Assuming these components are available
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion"; // Import motion from framer-motion
import { Link } from "wouter"; // Assuming wouter is used for routing

export default function NotFound() {
  // Framer Motion variants for the card animation
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren", // Animate card before its children
      },
    },
  };

  // Framer Motion variants for text elements inside the card
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-[120vh] w-full flex items-center justify-center bg-[#1A1C2C] mt-[-50vh] pt-[50vh]"> {/* Apply main background color */}
      <motion.div
        className="w-full max-w-md mx-auto" // mx-auto for horizontal centering
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="bg-[#1A1C2C] rounded-xl shadow-2xl border border-[#2d314d] text-white"> {/* Card background and border */}
          <CardContent className="pt-6 p-6 sm:p-8">
            <motion.div
              className="flex items-center mb-4 gap-3"
              variants={textVariants}
            >
              <AlertCircle className="h-9 w-9 text-[#FFD700]" />{" "} {/* Icon color changed to yellow accent */}
              <h1 className="text-3xl font-bold text-white">
                404 Page Not Found
              </h1>
            </motion.div>
            <motion.p
              className="mt-4 text-base text-slate-400 leading-relaxed" // Text color changed to slate-400
              variants={textVariants}
              transition={{ ...textVariants.visible.transition, delay: 0.2 }}
            >
              The page you are looking for might have been removed, had its name
              changed, or is temporarily unavailable. Please check the URL or
              return to the homepage.
            </motion.p>
            <motion.div
              className="mt-8 text-center"
              variants={textVariants}
              transition={{ ...textVariants.visible.transition, delay: 0.4 }}
            >
              <Link href="/">
                <button className="bg-gradient-to-r from-[#00A389] to-[#FFD700] hover:from-[#008C75] hover:to-[#E6C200] text-white rounded-full px-8 py-3 shadow-md hover:shadow-lg transition-all duration-300 font-semibold"> {/* Button gradient updated */}
                  Go to Homepage
                </button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}