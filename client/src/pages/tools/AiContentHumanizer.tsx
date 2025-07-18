import { useState, useRef, useCallback, lazy, Suspense } from "react";
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

// Lazy load ReactMarkdown for better initial page load
const LazyReactMarkdown = lazy(() => import("react-markdown"));
const remarkGfm = lazy(() => import("remark-gfm"));

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-600 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Orange-500 to Teal-500
// - Tips/Info Accent: Amber

export default function AiContentHumanizer() {
  const [aiContent, setAiContent] = useState("");
  const [humanizedContent, setHumanizedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Framer Motion variants are theme-independent
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const resultVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  // --- Core logic functions (handleHumanizeContent, handleCopy, etc.) are unchanged ---
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
    setHumanizedContent(null);
    toast({
      title: "Humanizing...",
      description: "Our AI is making your content sound more natural.",
    });

    try {
      const prompt = `Rewrite the following AI-generated content to sound more natural, human, and engaging. Focus on varying sentence structure, injecting a conversational tone, and removing robotic phrasing while maintaining the original meaning.
      ---
      AI-Generated Content:
      ${aiContent}
      ---`;

      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const geminiResult = await response.json();

      if (geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) {
        const humanizedText =
          geminiResult.candidates[0].content.parts[0].text.trim();
        setHumanizedContent(humanizedText);
        toast({
          title: "Content Humanized!",
          description: "Your content now has a more natural touch.",
        });
      } else {
        console.error("Unexpected API response structure:", geminiResult);
        toast({
          title: "Humanization Failed",
          description: "Could not process your content. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error humanizing content:", error);
      toast({
        title: "Generation Error",
        description:
          "An error occurred while contacting the AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [aiContent, toast]);

  const handleCopyContent = useCallback(async () => {
    if (!humanizedContent) return;
    try {
      await navigator.clipboard.writeText(humanizedContent);
      toast({
        title: "Copied!",
        description: "Humanized content copied to clipboard.",
      });
    } catch (error) {
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
  }, [humanizedContent, toast]);

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
      description: "Humanized content saved as a .txt file.",
    });
  }, [humanizedContent, toast]);

  const handleReset = useCallback(() => {
    setAiContent("");
    setHumanizedContent(null);
    setIsGenerating(false);
    toast({
      title: "Tool Reset",
      description: "Ready to humanize new content.",
    });
  }, [toast]);

  return (
    <ToolLayout
      title="AI Content Humanizer"
      description="Transform robotic AI text into natural, engaging, and human-like content."
      icon={<PenSquare className="text-white" />}
      iconBg="bg-gradient-to-br from-orange-500 to-teal-500"
    >
      <div className="space-y-8">
        {/* Input & Action Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-orange-500/10">
            <CardHeader>
              <CardTitle className="text-orange-600">
                Paste AI-Generated Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label
                  htmlFor="ai-content-textarea"
                  className="font-medium text-slate-700"
                >
                  Enter the text you want to make more human:
                </Label>
                <Textarea
                  id="ai-content-textarea"
                  value={aiContent}
                  onChange={(e) => setAiContent(e.target.value)}
                  placeholder="e.g., 'The objective function was optimized through iterative computational processes...'"
                  rows={10}
                  className="w-full bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 rounded-md"
                  disabled={isGenerating}
                />
              </div>
              <div className="mt-6 text-center">
                <Button
                  onClick={handleHumanizeContent}
                  disabled={isGenerating || !aiContent.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-teal-500 hover:from-orange-600 hover:to-teal-600 text-white shadow-lg shadow-orange-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Humanizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Humanize Content
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
              key="result-card"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
            >
              <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-teal-500/10">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="text-teal-700">
                    Your Humanized Content
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopyContent}
                      disabled={!humanizedContent || isGenerating}
                      size="sm"
                      variant="outline"
                      className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-full"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                    <Button
                      onClick={handleDownloadContent}
                      disabled={!humanizedContent || isGenerating}
                      size="sm"
                      variant="outline"
                      className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-full"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="min-h-[250px] flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-3" />
                      <p className="font-semibold text-lg">
                        Adding a human touch...
                      </p>
                      <p>This should only take a moment.</p>
                    </div>
                  ) : (
                    <div className="min-h-[250px] p-4 bg-slate-50/70 border border-slate-200 rounded-lg max-h-[600px] overflow-y-auto">
                      <Suspense
                        fallback={
                          <div className="text-slate-500">
                            Loading preview...
                          </div>
                        }
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={humanizedContent || "empty"}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={resultVariants}
                            className="prose prose-sm lg:prose-base prose-slate max-w-none"
                          >
                            <LazyReactMarkdown remarkPlugins={[remarkGfm]}>
                              {humanizedContent || ""}
                            </LazyReactMarkdown>
                          </motion.div>
                        </AnimatePresence>
                      </Suspense>
                    </div>
                  )}
                  <div className="mt-6 text-center">
                    <Button
                      onClick={handleReset}
                      size="lg"
                      variant="ghost"
                      className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-full px-8 py-3 font-semibold"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Start Over
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
}
