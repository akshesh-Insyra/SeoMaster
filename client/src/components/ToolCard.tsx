import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion"; // Import motion for animations

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  // iconBg is less critical now as we'll use a consistent gradient
  iconBg: string; // Keeping it for compatibility but not directly used for background color
}

export default function ToolCard({ title, description, icon, href, iconBg }: ToolCardProps) {
  return (
    <motion.div
      // Card base style: light background, subtle border, rounded corners, shadow
      className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden"
      // Attractive hover effects for the entire card
      whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }} // Slightly larger shadow and scale
      transition={{ type: "spring", stiffness: 300, damping: 20 }} // Smooth, bouncy transition
    >
      <Card className="h-full"> {/* Ensure Card fills its motion.div */}
        <CardContent className="p-6 flex flex-col h-full"> {/* Use flex-col and h-full for layout */}
          {/* Tool Icon - Vibrant Gradient Background */}
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 
            bg-gradient-to-br from-blue-500 to-purple-600 shadow-md flex-shrink-0`} // Consistent brand gradient
          >
            {/* Icon color set to white for contrast against the gradient */}
            <span className="text-white text-2xl">{icon}</span>
          </div>

          {/* Title - Dark and Readable */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
            {title}
          </h3>

          {/* Description - Softer Dark Gray */}
          <p className="text-gray-600 text-sm mb-4 flex-grow"> {/* flex-grow ensures button aligns at bottom */}
            {description}
          </p>

          {/* Button - Colorful with Attractive Hovers */}
          <Link href={href}>
            <Button
              className="w-full text-lg py-2 rounded-lg font-semibold
                         bg-emerald-500 text-white
                         hover:bg-emerald-600 hover:shadow-lg
                         transition-all duration-300 transform hover:-translate-y-0.5" // Subtle lift and shadow
            >
              Open Tool
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}