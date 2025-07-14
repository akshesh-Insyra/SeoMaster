// src/pages/AiContentHumanizer.tsx

import { useState, useRef, useCallback, lazy, Suspense } from "react"; // Added useCallback, lazy, Suspense
import {
  Loader2,
  Sparkles,
  RefreshCw,
  Copy,
  Download,
  PenSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load ReactMarkdown and remarkGfm for performance
const LazyReactMarkdown = lazy(() => import("react-markdown"));
const LazyRemarkGfm = lazy(() => import("remark-gfm"));

export default function AiContentHumanizer() {
  const [aiContent, setAiContent] = useState("");
  const [humanizedContent, setHumanizedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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

  // Memoize handleHumanizeContent to prevent unnecessary re-creations
  const handleHumanizeContent = useCallback(async () => {
    if (!aiContent.trim()) {
      toast({
        title: "Missing Content",
        description:
          "Please paste the AI-generated content you want to humanize.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setHumanizedContent(null); // Clear previous result
    toast({
      title: "Humanizing...",
      description: "AI is transforming your content.",
      duration: 3000,
    }); // Added toast

    try {
      const prompt = `Rewrite the following AI-generated content to sound more natural, human, and engaging.
      Focus on:
      - Varying sentence structure and length.
      - Injecting a conversational or empathetic tone where appropriate.
      - Removing robotic phrasing, repetition, or overly formal language.
      - Making it flow smoothly as if written by a human.
      - Maintain the original meaning and key information.
      
      ---
      **AI-Generated Content:**
      ${aiContent}
      ---`;

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
        const humanizedText =
          geminiResult.candidates[0].content.parts[0].text.trim();
        setHumanizedContent(humanizedText);
        toast({
          title: "Content Humanized!",
          description: "Your content now sounds more natural.",
        });
      } else {
        console.error("Unexpected API response structure:", geminiResult);
        toast({
          title: "Humanization Failed",
          description:
            "Could not humanize content. Please try again. (Check console for details)",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error humanizing content:", error);
      toast({
        title: "Generation Error",
        description:
          "An error occurred while connecting to the AI. Please try again. (Check console for details)",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [aiContent, toast]); // Dependencies for useCallback

  const handleCopyContent = useCallback(async () => {
    if (!humanizedContent) return;
    try {
      await navigator.clipboard.writeText(humanizedContent);
      toast({
        title: "Copied!",
        description: "Humanized content copied to clipboard.",
      });
    } catch (error) {
      // Fallback for older browsers or iframes without clipboard API access
      const textarea = document.createElement("textarea");
      textarea.value = humanizedContent;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast({
          title: "Copied!",
          description: "Content copied to clipboard (fallback).",
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
  }, [humanizedContent, toast]); // Dependencies for useCallback

  const handleDownloadContent = useCallback(() => {
    if (!humanizedContent) return;
    const blob = new Blob([humanizedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `humanized-content-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Humanized content text file downloaded successfully.",
    });
  }, [humanizedContent, toast]); // Dependencies for useCallback

  const handleReset = useCallback(() => {
    setAiContent("");
    setHumanizedContent(null);
    setIsGenerating(false);
    toast({
      title: "Tool Reset",
      description: "Ready to humanize new content.",
    });
  }, [toast]); // Dependencies for useCallback

  return (
    <ToolLayout
      title="AI Content Humanizer"
      description="Transform AI-generated text into natural, engaging, and human-like content."
      icon={<PenSquare className="text-white text-2xl" />} // Using PenSquare for writing/editing
      iconBg="bg-gradient-to-br from-teal-500 to-cyan-500" // A fresh, natural-feeling gradient
    >
      <div className="space-y-6">
        {/* Input Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-teal-500/10 text-white">
            <CardHeader>
              <CardTitle className="text-teal-400">
                Paste AI-Generated Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label
                htmlFor="ai-content-textarea"
                className="text-slate-400 mb-2 block"
              >
                Paste the content generated by AI here:
              </Label>
              <Textarea
                id="ai-content-textarea"
                value={aiContent}
                onChange={(e) => setAiContent(e.target.value)}
                placeholder="e.g., 'The objective function was optimized through iterative computational processes, yielding a statistically significant enhancement in algorithmic efficiency.'"
                rows={10}
                className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 rounded-md shadow-sm"
                disabled={isGenerating}
              />
              <div className="mt-4 text-center">
                <Button
                  onClick={handleHumanizeContent}
                  disabled={isGenerating || !aiContent.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Humanizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Humanize Content
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Humanized Content Result Card */}
        <AnimatePresence mode="wait">
          {(humanizedContent || isGenerating) && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-cyan-500/10 text-white">
                <CardHeader>
                  <CardTitle className="text-cyan-400">
                    Humanized Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="min-h-[200px] flex items-center justify-center text-slate-400">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Making
                      it sound natural...
                    </div>
                  ) : (
                    <div className="min-h-[200px] p-4 bg-[#141624] border border-[#363A4D] rounded-md text-white whitespace-pre-wrap break-words overflow-auto max-h-[600px]">
                      <Suspense
                        fallback={
                          <div className="text-slate-400">
                            Loading content...
                          </div>
                        }
                      >
                        {" "}
                        {/* Suspense for lazy loaded markdown */}
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={humanizedContent || "empty"}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={resultVariants}
                          >
                            <LazyReactMarkdown remarkPlugins={[LazyRemarkGfm]}>
                              {humanizedContent || ""}
                            </LazyReactMarkdown>
                          </motion.div>
                        </AnimatePresence>
                      </Suspense>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      onClick={handleCopyContent}
                      disabled={!humanizedContent || isGenerating}
                      size="sm"
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md transition-all duration-200 rounded-full px-4 py-2"
                    >
                      <Copy className="w-4 h-4 mr-1" /> Copy
                    </Button>
                    <Button
                      onClick={handleDownloadContent}
                      disabled={!humanizedContent || isGenerating}
                      size="sm"
                      className="bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-semibold hover:from-cyan-600 hover:to-teal-600 shadow-md transition-all duration-200 rounded-full px-4 py-2"
                    >
                      <Download className="w-4 h-4 mr-1" /> Download
                    </Button>
                  </div>
                  <div className="mt-4 text-center">
                    <Button
                      onClick={handleReset}
                      size="lg"
                      className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white shadow-lg shadow-gray-500/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Humanize New
                      Content
                    </Button>
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
                Why Humanize AI-Generated Content?
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside">
                <li>Improve readability and engagement for your audience.</li>
                <li>Avoid sounding robotic or overly formal.</li>
                <li>Add a personal touch and unique voice to your content.</li>
                <li>
                  Enhance SEO by making content more natural and less
                  keyword-stuffed.
                </li>
                <li>Ensure content resonates better with human readers.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
