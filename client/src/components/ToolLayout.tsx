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
  iconBg,
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
    <div className="min-h-screen bg-gray-900 text-white mt-[-50vh] pt-[50vh]">
      <main className="py-8 sm:py-12 lg:py-16">
        {" "}
        {/* Responsive padding */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tool Header */}
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-[#00A389] to-[#FFD700] shadow-lg`} // Enhanced icon background
            >
              {icon}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {title}
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
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

                {/* Tool Features */}
                <div className="bg-[#1A1C2C] border border-[#2d314d] rounded-xl p-6 shadow-lg">
                  <h4 className="font-semibold text-white mb-4 text-lg">
                    Tool Features
                  </h4>
                  <ul className="space-y-3 text-sm text-slate-400">
                    {" "}
                    {/* Changed text-gray-400 to text-slate-400 */}
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#00A389] mr-2 flex-shrink-0" />{" "}
                      {/* Changed text-purple-400 to text-[#00A389] */}
                      Unlimited file size
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#00A389] mr-2 flex-shrink-0" />{" "}
                      {/* Changed text-purple-400 to text-[#00A389] */}
                      Secure processing
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#00A389] mr-2 flex-shrink-0" />{" "}
                      {/* Changed text-purple-400 to text-[#00A389] */}
                      No registration required
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-[#00A389] mr-2 flex-shrink-0" />{" "}
                      {/* Changed text-purple-400 to text-[#00A389] */}
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
