import { useState } from "react";
import { Mail, Loader2, Copy, Download, Sparkles } from "lucide-react"; // Added Sparkles for consistency
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
// - Accent Gradient: Blue-500 to Emerald-500
// - Tips/Info Accent: Amber

export default function AiEmailAssistant() {
  const [prompt, setPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
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
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // --- Core logic functions (handleGenerate, handleCopy, etc.) are unchanged ---
  const handleGenerateEmail = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a description for the email you need.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedEmail(""); // Clear previous result

    try {
      const emailPrompt = `Draft a professional email based on the following request: "${prompt}". Ensure it's polite, clear, well-structured, and ready to send.`;
      const payload = {
        contents: [{ role: "user", parts: [{ text: emailPrompt }] }],
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
        setGeneratedEmail(text);
        toast({
          title: "Email Drafted!",
          description: "Your new email is ready below.",
        });
      } else {
        console.error("Unexpected API response structure:", result);
        toast({
          title: "Generation Failed",
          description: "Could not draft the email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating email:", error);
      toast({
        title: "Generation Error",
        description: "An error occurred while contacting the AI. Please try again.",
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
      toast({ title: "Copied!", description: "Email content copied to clipboard." });
    } catch (error) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          toast({
            title: "Copied!",
            description: "Email content copied to clipboard (fallback).",
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

  const handleDownload = (text: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-generated-email.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Email saved as a .txt file.",
    });
  };

  return (
    <ToolLayout
      title="AI Email Assistant"
      description="Draft professional emails and responses in seconds with AI."
      icon={<Mail className="text-white" />}
      iconBg="bg-gradient-to-br from-blue-500 to-emerald-500"
    >
      <div className="space-y-8">
        {/* Input Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-blue-500/10">
            <CardHeader>
              <CardTitle className="text-blue-600">
                What's this email about?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="email-prompt-textarea" className="font-medium text-slate-700">
                  Describe the email you want to send or the one you need to respond to:
                </Label>
                <Textarea
                  id="email-prompt-textarea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Write an email to my team about the new project deadline' or 'Respond to a customer asking for a refund for a damaged product, offer a replacement.'"
                  rows={6}
                  className="w-full bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 rounded-md"
                />
              </div>
              <div className="mt-6 text-center">
                <Button
                  onClick={handleGenerateEmail}
                  disabled={isGenerating || !prompt.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white shadow-lg shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Drafting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Draft Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Email Output Card */}
        <AnimatePresence mode="wait">
          {(isGenerating || generatedEmail) && (
            <motion.div
              key="result-card"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
            >
              <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-emerald-500/10">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="text-emerald-700">
                    Generated Email
                  </CardTitle>
                  <div className="flex gap-2">
                     <Button onClick={() => handleCopy(generatedEmail)} disabled={!generatedEmail || isGenerating} size="sm" variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-full">
                        <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                    <Button onClick={() => handleDownload(generatedEmail)} disabled={!generatedEmail || isGenerating} size="sm" variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-full">
                        <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[200px] p-4 bg-slate-50/70 border border-slate-200 rounded-lg max-h-[600px] overflow-y-auto">
                    <AnimatePresence mode="wait">
                      {isGenerating && !generatedEmail ? (
                         <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center min-h-[200px] text-slate-500"
                        >
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                            <p className="font-semibold text-lg">Drafting your email...</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="content"
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={resultVariants}
                          className="prose prose-sm lg:prose-base prose-slate max-w-none whitespace-pre-wrap"
                        >
                          {generatedEmail}
                        </motion.div>
                      )}
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
          <Card className="bg-amber-50 border border-amber-200/80 rounded-xl shadow-lg shadow-amber-500/10">
            <CardContent className="p-6">
                <h4 className="font-semibold text-amber-700 mb-3 text-lg">
                  Tips for Best Results
                </h4>
                <ul className="text-amber-900/80 space-y-2 text-sm list-disc list-outside ml-4">
                  <li>Be specific about the purpose and recipient of the email.</li>
                  <li>Mention the desired tone (e.g., formal, casual, urgent).</li>
                  <li>Include key information or questions that need to be addressed.</li>
                  <li>For responses, you can paste the original email for context.</li>
                  <li><strong>Note:</strong> Always review the generated email before sending!</li>
                </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}