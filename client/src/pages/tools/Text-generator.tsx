import { useState } from "react";
import { Sparkles, Loader2, Copy, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-700 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Fuchsia-500 to Purple-600
// - Tips/Info Accent: Amber

export default function TextGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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

  // --- Core logic functions (handleGenerate, handleCopy, etc.) are unchanged ---
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
    setGeneratedText("");

    try {
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
      const result = await response.json();

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = result.candidates[0].content.parts[0].text;
        setGeneratedText(text);
        toast({
          title: "Success!",
          description: "Text generated successfully.",
        });
      } else {
        console.error("API Error:", result);
        toast({
          title: "Generation Failed",
          description: "Could not generate text. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to the AI.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Generated text copied to clipboard.",
      });
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast({ title: "Copied!", description: "Copied via fallback." });
      } catch (err) {
        toast({ title: "Copy Failed", variant: "destructive" });
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleDownload = (text: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-text.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Text file saved successfully.",
    });
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedText("");
    setIsGenerating(false);
    toast({ title: "Tool Reset", description: "Ready for a new prompt." });
  };

  return (
    <ToolLayout
      title="AI Text Generator"
      description="Generate creative and compelling text for any purpose using advanced AI."
      icon={<Sparkles className="text-white" />}
      iconBg="bg-gradient-to-br from-fuchsia-500 to-purple-600"
    >
      <div className="space-y-8">
        {/* Input Card */}
        <motion.div
          variants={cardInViewVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-fuchsia-500/10">
            <CardHeader>
              <CardTitle className="text-fuchsia-600">
                Enter Your Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label
                  htmlFor="prompt-textarea"
                  className="font-medium text-slate-700"
                >
                  Describe what you want to generate:
                </Label>
                <Textarea
                  id="prompt-textarea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Write a short story about a robot discovering music' or 'Generate three catchy slogans for a new coffee shop'"
                  rows={6}
                  className="w-full bg-white"
                />
              </div>
              <div className="mt-6 text-center">
                <Button
                  onClick={handleGenerateText}
                  disabled={isGenerating || !prompt.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white shadow-lg shadow-fuchsia-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" /> Generate Text
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Result Card */}
        <AnimatePresence>
          {(isGenerating || generatedText) && (
            <motion.div
              variants={cardInViewVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-purple-500/10">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="text-purple-600">
                    Generated Text
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopy(generatedText)}
                      disabled={!generatedText}
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                    <Button
                      onClick={() => handleDownload(generatedText)}
                      disabled={!generatedText}
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="min-h-[200px] flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500 mb-3" />
                      <p className="font-semibold text-lg">AI is thinking...</p>
                    </div>
                  ) : (
                    <motion.div
                      key={generatedText}
                      variants={resultVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg prose prose-sm lg:prose-base prose-slate max-w-none min-h-[200px]"
                    >
                      {generatedText}
                    </motion.div>
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

        {/* Tips Card */}
        <motion.div
          variants={cardInViewVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-amber-50 border border-amber-200/80 rounded-xl shadow-lg shadow-amber-500/10">
            <CardContent className="p-6">
              <h4 className="font-semibold text-amber-700 mb-3 text-lg">
                Tips for Better Results
              </h4>
              <ul className="text-amber-900/80 space-y-2 text-sm list-disc list-outside ml-4">
                <li>
                  Be as specific as possible in your prompt to guide the AI.
                </li>
                <li>
                  Experiment with different keywords and phrases to see what
                  works best.
                </li>
                <li>
                  You can ask for various formats like stories, poems, emails,
                  or summaries.
                </li>
                <li>
                  Use the generated text as a starting point and add your own
                  creative flair!
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
