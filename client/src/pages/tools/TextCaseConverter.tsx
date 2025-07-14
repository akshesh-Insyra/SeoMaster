import { useState } from "react";
import { Type, Copy, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence
import {
  convertToUpperCase,
  convertToLowerCase,
  convertToSentenceCase,
  convertToTitleCase,
  convertToCamelCase,
  convertToKebabCase,
} from "@/utils/textUtils"; // Assuming these utility functions are available

export default function TextCaseConverter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [activeConversion, setActiveConversion] = useState<string>("");
  const { toast } = useToast();

  const conversions = [
    {
      id: "upper",
      label: "UPPERCASE",
      func: convertToUpperCase,
      className:
        "bg-gradient-to-r from-blue-600 to-cyan-500 hover:brightness-110 shadow-lg shadow-blue-500/30", // Brighter
    },
    {
      id: "lower",
      label: "lowercase",
      func: convertToLowerCase,
      className:
        "bg-gradient-to-r from-gray-600 to-gray-700 hover:brightness-110 shadow-lg shadow-gray-500/30", // Brighter
    },
    {
      id: "sentence",
      label: "Sentence case",
      func: convertToSentenceCase,
      className:
        "bg-gradient-to-r from-green-600 to-emerald-500 hover:brightness-110 shadow-lg shadow-green-500/30", // Brighter
    },
    {
      id: "title",
      label: "Title Case",
      func: convertToTitleCase,
      className:
        "bg-gradient-to-r from-purple-600 to-pink-500 hover:brightness-110 shadow-lg shadow-purple-500/30", // Brighter
    },
    {
      id: "camel",
      label: "camelCase",
      func: convertToCamelCase,
      className:
        "bg-gradient-to-r from-yellow-500 to-orange-500 hover:brightness-110 shadow-lg shadow-yellow-500/30", // Brighter
    },
    {
      id: "kebab",
      label: "kebab-case",
      func: convertToKebabCase,
      className:
        "bg-gradient-to-r from-cyan-600 to-blue-700 hover:brightness-110 shadow-lg shadow-cyan-500/30", // Brighter
    },
  ];

  const handleConvert = (conversion: any) => {
    if (!inputText.trim()) {
      toast({
        title: "No text to convert",
        description: "Please enter some text first.",
        variant: "destructive",
      });
      return;
    }

    const result = conversion.func(inputText);
    setOutputText(result);
    setActiveConversion(conversion.id);
  };

  const handleCopy = async () => {
    if (!outputText) {
      toast({
        title: "Nothing to copy",
        description: "Please convert some text first.",
        variant: "destructive",
      });
      return;
    }

    try {
      document.execCommand('copy'); // Using document.execCommand for clipboard access in iframes
      toast({
        title: "Copied!",
        description: "Text copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy text to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setActiveConversion("");
  };

  const handleDownload = () => {
    if (!outputText) {
      toast({
        title: "Nothing to download",
        description: "Please convert some text first.",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-text-${activeConversion || "output"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Text file downloaded successfully.",
    });
  };

  // Framer Motion variants for section entrance
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // Framer Motion variants for card entrance on scroll
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  // Framer Motion variants for button group (staggered)
  const buttonGroupVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  // Framer Motion variants for individual buttons
  const buttonItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Framer Motion variants for output text change
  const outputTextVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <ToolLayout
      title="Text Case Converter"
      description="Convert text between different cases instantly"
      icon={<Type className="text-white text-2xl" />} // Adjusted icon color for better contrast on dark background
      iconBg="bg-gray-800" // Consistent dark background for tool icon
    >
      <div className="space-y-6">
        {/* Input Text */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1a1c2c]/60 border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-indigo-500/10 text-white">
            <CardHeader>
              <CardTitle className="text-indigo-400">Input Text</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your text here..."
                rows={6}
                className="w-full rounded-lg bg-[#181A20] border border-[#2d314d] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-500 transition-all duration-200"
              />
              <div className="mt-2 text-sm text-gray-400">
                Characters: {inputText.length} | Words:{" "}
                {inputText.trim().split(/\s+/).filter((word) => word.length > 0).length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conversion Buttons */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1a1c2c]/60 border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-blue-900/10 text-white">
            <CardHeader>
              <CardTitle className="text-white">Convert To</CardTitle> {/* Changed to white for brighter look */}
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4" // Responsive grid
                variants={buttonGroupVariants}
              >
                {conversions.map((conversion) => (
                  <motion.div key={conversion.id} variants={buttonItemVariants}>
                    <Button
                      onClick={() => handleConvert(conversion)}
                      className={`${conversion.className} text-white text-sm py-3 px-4 rounded-lg transition-all duration-200 w-full transform hover:scale-105 ${
                        activeConversion === conversion.id
                          ? "ring-2 ring-offset-2 ring-offset-[#1a1c2c] ring-cyan-400" // Added ring-offset for better visibility
                          : ""
                      }`}
                    >
                      {conversion.label}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Output Text */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1a1c2c]/60 border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-cyan-500/10 text-white">
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <CardTitle className="text-cyan-400">Output</CardTitle>
                <div className="flex gap-2">
                  {/* Copy Button */}
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-white shadow-md shadow-cyan-400/30 transition-all duration-200 rounded-full px-4 py-2"
                    disabled={!outputText}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>

                  {/* Download Button */}
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:brightness-110 text-black font-semibold shadow-md shadow-yellow-400/30 transition-all duration-200 rounded-full px-4 py-2"
                    disabled={!outputText}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <AnimatePresence mode="wait"> {/* Use AnimatePresence with mode="wait" */}
                <motion.div
                  key={outputText} // Key changes to trigger animation on outputText change
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={outputTextVariants}
                  className="w-full min-h-32 p-4 bg-[#181A20] border border-[#2d314d] rounded-lg font-mono text-sm text-gray-100 break-words"
                >
                  {outputText || "Converted text will appear here..."}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1a1c2c]/60 border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-yellow-400/10 text-white">
            <CardHeader>
              <CardTitle className="text-yellow-400">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleClear}
                  size="sm"
                  className="bg-gradient-to-r from-red-500 to-rose-500 hover:brightness-110 text-white shadow-md shadow-red-400/30 rounded-full px-4 py-2"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Clear All
                </Button>

                <Button
                  onClick={() =>
                    setInputText(
                      "This is a sample text for testing the case converter tool."
                    )
                  }
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:brightness-110 text-white shadow-md shadow-blue-400/30 rounded-full px-4 py-2"
                >
                  Load Sample Text
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
