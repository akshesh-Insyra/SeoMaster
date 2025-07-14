import { useState } from "react";
import { CopyCheck, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

export default function PlagiarismChecker() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  // Framer Motion variants
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const resultVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const handleCheckPlagiarism = async () => {
    if (!text1.trim() || !text2.trim()) {
      toast({
        title: "Missing Text",
        description: "Please enter text in both fields to compare.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    setResult(null); // Clear previous result

    try {
      // Prompt Gemini to compare the two texts for similarity/rephrasing
      const prompt = `Compare the following two texts for semantic similarity and potential rephrasing.
      Text 1: "${text1}"
      Text 2: "${text2}"
      
      Provide a concise analysis of their similarity, highlighting any phrases or ideas that seem very close or rephrased. Conclude with a percentage estimate of their semantic similarity (e.g., "Estimated semantic similarity: 75%").`;

      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Ensure this is set up
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const geminiResult = await response.json();

      if (
        geminiResult.candidates &&
        geminiResult.candidates.length > 0 &&
        geminiResult.candidates[0].content &&
        geminiResult.candidates[0].content.parts &&
        geminiResult.candidates[0].content.parts.length > 0
      ) {
        const analysis =
          geminiResult.candidates[0].content.parts[0].text.trim();
        setResult(analysis);
        toast({
          title: "Analysis Complete!",
          description: "Review the similarity report below.",
        });
      } else {
        console.error("Unexpected API response structure:", geminiResult);
        toast({
          title: "Analysis Failed",
          description: "Could not perform plagiarism check. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking plagiarism:", error);
      toast({
        title: "Analysis Error",
        description:
          "An error occurred while connecting to the AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <ToolLayout
      title="Basic Plagiarism Checker"
      description="Compare two texts for semantic similarity and potential rephrasing using AI."
      icon={<CopyCheck className="text-white text-2xl" />}
      iconBg="bg-gradient-to-br from-green-500 to-teal-500" // Example gradient
    >
      <div className="space-y-6">
        {/* Input Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-green-500/10 text-white">
            <CardHeader>
              <CardTitle className="text-green-400">
                Enter Texts for Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="text1" className="text-slate-400">
                  Text 1 (Original/Reference)
                </Label>
                <Textarea
                  id="text1"
                  value={text1}
                  onChange={(e) => setText1(e.target.value)}
                  placeholder="Paste the first text here..."
                  rows={8}
                  className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 rounded-md shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text2" className="text-slate-400">
                  Text 2 (To be checked)
                </Label>
                <Textarea
                  id="text2"
                  value={text2}
                  onChange={(e) => setText2(e.target.value)}
                  placeholder="Paste the second text here..."
                  rows={8}
                  className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 rounded-md shadow-sm"
                />
              </div>
              <div className="md:col-span-2 text-center">
                <Button
                  onClick={handleCheckPlagiarism}
                  disabled={isChecking || !text1.trim() || !text2.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg shadow-green-500/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Checking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Analyze Similarity
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Result Card */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-teal-500/10 text-white">
                <CardHeader>
                  <CardTitle className="text-teal-400">
                    Similarity Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[100px] p-4 bg-[#141624] border border-[#363A4D] rounded-md text-white whitespace-pre-wrap break-words overflow-auto max-h-96">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={result}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={resultVariants}
                      >
                        {result}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#FFD700]/10 text-white">
            <CardContent className="p-6">
              <h4 className="font-semibold text-[#FFD700] mb-3 text-lg">
                About this Basic Plagiarism Checker
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside">
                <li>
                  This tool uses AI to compare the *semantic meaning* of two
                  texts you provide.
                </li>
                <li>
                  It can help identify rephrased content or very similar ideas
                  between two specific documents.
                </li>
                <li>
                  It does NOT scan the internet or a large database for
                  plagiarism.
                </li>
                <li>
                  For comprehensive plagiarism detection, specialized services
                  are required.
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
