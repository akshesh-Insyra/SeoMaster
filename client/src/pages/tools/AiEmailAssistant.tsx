import { useState } from "react";
import { Mail, Loader2, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

export default function AiEmailAssistant() {
  const [prompt, setPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Framer Motion variants (reused from your TextGenerator)
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const generatedTextVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const handleGenerateEmail = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a description for your email.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedEmail(""); // Clear previous result for animation

    try {
      let chatHistory = [];
      // Adjust the prompt to guide Gemini for email generation
      const emailPrompt = `Draft a professional email based on the following request: "${prompt}". Ensure it's polite, clear, and well-structured.`;
      chatHistory.push({ role: "user", parts: [{ text: emailPrompt }] });
      const payload = { contents: chatHistory };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Ensure this is correctly set up in your .env
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const text = result.candidates[0].content.parts[0].text;
        setGeneratedEmail(text);
        toast({
          title: "Success!",
          description: "Email drafted successfully.",
        });
      } else {
        console.error("Unexpected API response structure:", result);
        toast({
          title: "Generation Failed",
          description: "Could not draft email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating email:", error);
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
      description: "Email file downloaded successfully.",
    });
  };

  return (
    <ToolLayout
      title="AI Email Assistant"
      description="Draft professional emails and responses quickly with AI."
      icon={<Mail className="text-white text-2xl" />}
      iconBg="bg-gradient-to-br from-[#AF00C3] to-[#FFD700]" // Adjusted theme accent
    >
      <div className="space-y-6">
        {/* Input Prompt Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#AF00C3]/10 text-white">
            <CardHeader>
              <CardTitle className="text-[#AF00C3]">Email Request</CardTitle>
            </CardHeader>
            <CardContent>
              <Label
                htmlFor="email-prompt-textarea"
                className="text-slate-400 mb-2 block"
              >
                Describe the email you want to send or the email you need to
                respond to:
              </Label>
              <Textarea
                id="email-prompt-textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Write an email to my team about the new project deadline' or 'Respond to a customer asking for a refund for a damaged product, offer a replacement.'"
                rows={6}
                className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#AF00C3]/50 focus:border-[#AF00C3] rounded-md shadow-sm"
              />
              <div className="mt-4 text-center">
                <Button
                  onClick={handleGenerateEmail}
                  disabled={isGenerating || !prompt.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-[#AF00C3] to-[#FFD700] hover:from-[#9600AA] hover:to-[#E6C200] text-white shadow-lg shadow-[#AF00C3]/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Drafting...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" /> Draft Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Email Output Card */}
        <AnimatePresence mode="wait">
          {generatedEmail && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#00A389]/10 text-white">
                <CardHeader>
                  <CardTitle className="text-[#00A389]">
                    Generated Email
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
                          Drafting email...
                        </motion.div>
                      ) : (
                        <motion.p
                          key={generatedEmail} // Key changes to trigger animation on text change
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={generatedTextVariants}
                        >
                          {generatedEmail}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      onClick={() =>
                        handleCopy(generatedEmail, "Generated email")
                      }
                      size="sm"
                      className="bg-gradient-to-r from-[#AF00C3] to-[#FFD700] hover:from-[#9600AA] hover:to-[#E6C200] text-white shadow-md shadow-[#AF00C3]/30 transition-all duration-200 rounded-full px-4 py-2"
                      disabled={!generatedEmail}
                    >
                      <Copy className="w-4 h-4 mr-1" /> Copy
                    </Button>
                    <Button
                      onClick={() =>
                        handleDownload(generatedEmail, "generated-email.txt")
                      }
                      size="sm"
                      className="bg-gradient-to-r from-[#FFD700] to-[#AF00C3] text-black font-semibold hover:from-[#E6C200] hover:to-[#9600AA] shadow-md shadow-[#FFD700]/30 transition-all duration-200 rounded-full px-4 py-2"
                      disabled={!generatedEmail}
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
                <li>
                  Be specific about the purpose and recipient of the email.
                </li>
                <li>
                  Mention the desired tone (e.g., formal, casual, urgent).
                </li>
                <li>
                  Include key information or questions that need to be
                  addressed.
                </li>
                <li>
                  For responses, you can paste the original email for context.
                </li>
              </ul>
              <p className="text-[#AF00C3] text-sm mt-4">
                <strong>Note:</strong> Always review the generated email for
                accuracy, tone, and suitability before sending.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
