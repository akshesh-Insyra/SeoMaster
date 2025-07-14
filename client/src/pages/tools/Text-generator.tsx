import { useState, useRef } from "react";
import { Sparkles, Loader2, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function TextGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Framer Motion variants for section entrance
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Framer Motion variants for card entrance on scroll
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  // Framer Motion variants for generated text change
  const generatedTextVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const handleGenerateText = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter some text to generate from.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedText(""); // Clear previous result for animation

    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      //   const response02 = await axios.post(apiUrl, payload).then((res)=>{
      //     console.log(res, "res");
      //     // return res;
      //   }).catch((err)=>{
      //     console.log(err, 'error')
      //   });

      //   console.log(response02, "response02");

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const text = result.candidates[0].content.parts[0].text;
        setGeneratedText(text);
        toast({
          title: "Success!",
          description: "Text generated successfully.",
        });
      } else {
        console.error("Unexpected API response structure:", result);
        toast({
          title: "Generation Failed",
          description: "Could not generate text. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating text:", error);
      toast({
        title: "Generation Error",
        description:
          "An error occurred while connecting to the AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: `${type} copied to clipboard.` });
    } catch (error) {
      // Fallback for older browsers or iframes without clipboard API access
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast({
          title: "Copied!",
          description: `${type} copied to clipboard (fallback).`,
        });
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Unable to copy to clipboard.",
          variant: "destructive",
        });
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleDownload = (text: string, filename: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Text file downloaded successfully.",
    });
  };

  return (
    <ToolLayout
      title="AI Text Generator"
      description="Generate creative and meaningful text using advanced AI."
      icon={<Sparkles className="text-white text-2xl" />}
      iconBg="bg-gradient-to-br from-[#00A389] to-[#FFD700]" // Theme accent
      //   className="bg-[#1A1C2C] text-white" // Main background
    >
      <div className="space-y-6">
        {/* Input Prompt Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#00A389]/10 text-white">
            <CardHeader>
              <CardTitle className="text-[#00A389]">Your Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <Label
                htmlFor="prompt-textarea"
                className="text-slate-400 mb-2 block"
              >
                Enter your topic, keywords, or initial idea:
              </Label>
              <Textarea
                id="prompt-textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Write a short story about a robot discovering emotions' or 'Generate a catchy slogan for a coffee shop'"
                rows={6}
                className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00A389]/50 focus:border-[#00A389] rounded-md shadow-sm"
              />
              <div className="mt-4 text-center">
                <Button
                  onClick={handleGenerateText}
                  disabled={isGenerating || !prompt.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-[#00A389] to-[#FFD700] hover:from-[#008C75] hover:to-[#E6C200] text-white shadow-lg shadow-[#00A389]/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate Text
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Text Output Card */}
        <AnimatePresence mode="wait">
          {generatedText && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#AF00C3]/10 text-white">
                <CardHeader>
                  <CardTitle className="text-[#AF00C3]">
                    Generated Text
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[150px] p-4 bg-[#141624] border border-[#363A4D] rounded-md text-white whitespace-pre-wrap break-words overflow-auto max-h-96">
                    <AnimatePresence mode="wait">
                      {isGenerating ? (
                        <motion.div
                          key="loading-output"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-center h-full text-slate-400"
                        >
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating text...
                        </motion.div>
                      ) : (
                        <motion.p
                          key={generatedText} // Key changes to trigger animation on text change
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={generatedTextVariants}
                        >
                          {generatedText}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      onClick={() =>
                        handleCopy(generatedText, "Generated text")
                      }
                      size="sm"
                      className="bg-gradient-to-r from-[#00A389] to-[#FFD700] hover:from-[#008C75] hover:to-[#E6C200] text-white shadow-md shadow-[#00A389]/30 transition-all duration-200 rounded-full px-4 py-2"
                      disabled={!generatedText}
                    >
                      <Copy className="w-4 h-4 mr-1" /> Copy
                    </Button>
                    <Button
                      onClick={() =>
                        handleDownload(generatedText, "generated-text.txt")
                      }
                      size="sm"
                      className="bg-gradient-to-r from-[#FFD700] to-[#00A389] text-black font-semibold hover:from-[#E6C200] hover:to-[#008C75] shadow-md shadow-[#FFD700]/30 transition-all duration-200 rounded-full px-4 py-2"
                      disabled={!generatedText}
                    >
                      <Download className="w-4 h-4 mr-1" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions/Tips Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#FFD700]/10 text-white">
            <CardContent className="p-6">
              <h4 className="font-semibold text-[#FFD700] mb-3 text-lg">
                Tips for Best Results:
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside">
                <li>Be specific with your prompt to guide the AI.</li>
                <li>Experiment with different keywords and phrases.</li>
                <li>
                  You can ask for various formats: stories, poems, emails,
                  summaries, etc.
                </li>
                <li>
                  The AI generates text based on patterns it has learned;
                  results may vary.
                </li>
              </ul>
              <p className="text-[#00A389] text-sm mt-4">
                <strong>Note:</strong> This tool uses generative AI. While
                powerful, always review the output for accuracy and suitability.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
