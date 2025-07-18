import AdSlot from "@/components/AdSlot"; // Assuming AdSlot is available
import { motion } from "framer-motion"; // Import motion for animations
import { CheckCircle } from "lucide-react"; // Import CheckCircle for features list

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string; // This prop will now be used for the base background of the icon container
}

export default function ToolLayout({
  children,
  title,
  description,
  icon,
  iconBg, // This prop might become less relevant if we use fixed gradients
}: ToolLayoutProps) {
  // Framer Motion variants for section entrance
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    // Changed main background to a very light one
    // Adjusted mt-[-50vh] pt-[50vh] to mt-0 pt-16 for normal page flow with fixed header
    <div className="min-h-screen bg-gray-50 text-gray-800 pt-16">
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tool Header */}
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <div
              // Dynamic gradient for icon background, matching your brand colors
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg`}
            >
              {/* Icon color adjusted for light background, assuming it's an SVG or Lucide icon */}
              {/* If the icon itself is a component, you might need to pass `className="text-white"` to it */}
              <span className="text-white">{icon}</span>
            </div>
            {/* Title and description text colors adjusted for light background */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              {description}
            </p>
          </motion.div>

          {/* Top Banner Ad */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            transition={{ ...sectionVariants.visible.transition, delay: 0.2 }}
          >
            <AdSlot slotName="Top Banner Ad" className="mb-8" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {children}{" "}
              {/* This is where the tool-specific content will be rendered */}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                transition={{
                  ...sectionVariants.visible.transition,
                  delay: 0.3,
                }}
              >
                <AdSlot
                  slotName="Side Square Ad"
                  size="300x250"
                  className="mb-6"
                />

                {/* Tool Features - Changed background to light, border to subtle, text to dark/accent */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                  <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                    Tool Features
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-center">
                      {/* CheckCircle icon color matching the vibrant green */}
                      <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
                      Unlimited file size
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
                      Secure processing
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
                      No registration required
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
                      100% free to use
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Ad */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            transition={{ ...sectionVariants.visible.transition, delay: 0.4 }}
          >
            <AdSlot slotName="Bottom Ad" className="mt-8" />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
