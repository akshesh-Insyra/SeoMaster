// src/pages/AiRecruiterMessageGenerator.tsx

import { useState } from "react";
import {
  Mail,
  Loader2,
  Sparkles,
  RefreshCw,
  Copy,
  Download,
  MessageSquareText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

// For rendering Markdown results
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AiRecruiterMessageGenerator() {
  const [messagePurpose, setMessagePurpose] = useState(
    "Follow-up after interview"
  );
  const [keyDetails, setKeyDetails] = useState(""); // Contextual details for the message
  const [recipientName, setRecipientName] = useState(""); // Optional recipient name
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
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

  const handleGenerateMessage = async () => {
    if (!messagePurpose.trim() || !keyDetails.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a message purpose and provide key details.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedMessage(null); // Clear previous result

    try {
      let prompt = `Generate a professional message to a recruiter.
      
      The purpose of the message is: "${messagePurpose}".
      
      Here are the key details/context: "${keyDetails}".`;

      if (recipientName.trim()) {
        prompt += ` The recipient's name is "${recipientName.trim()}". Address them appropriately.`;
      } else {
        prompt += ` Address the recruiter generally if the name is not known (e.g., "Dear Hiring Team," or "Hello,").`;
      }

      prompt += ` Ensure the message is concise, clear, and professional.`;

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
        const messageText =
          geminiResult.candidates[0].content.parts[0].text.trim();
        setGeneratedMessage(messageText);
        toast({
          title: "Message Generated!",
          description: "Your message is ready.",
        });
      } else {
        console.error("Unexpected API response structure:", geminiResult);
        toast({
          title: "Generation Failed",
          description: "Could not generate message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating message:", error);
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

  const handleCopyMessage = async () => {
    if (!generatedMessage) return;
    try {
      await navigator.clipboard.writeText(generatedMessage);
      toast({
        title: "Copied!",
        description: "Generated message copied to clipboard.",
      });
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = generatedMessage;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast({
          title: "Copied!",
          description: "Message copied to clipboard (fallback).",
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

  const handleDownloadMessage = () => {
    if (!generatedMessage) return;
    const blob = new Blob([generatedMessage], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recruiter-message-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Message text file downloaded successfully.",
    });
  };

  const handleReset = () => {
    setMessagePurpose("Follow-up after interview");
    setKeyDetails("");
    setRecipientName("");
    setGeneratedMessage(null);
    setIsGenerating(false);
    toast({
      title: "Tool Reset",
      description: "Ready to generate a new message.",
    });
  };

  return (
    <ToolLayout
      title="AI Recruiter Message Generator"
      description="Craft professional and tailored messages to recruiters for various purposes using AI."
      icon={<MessageSquareText className="text-white text-2xl" />}
      iconBg="bg-gradient-to-br from-blue-400 to-purple-400" // A new gradient
    >
      <div className="space-y-6">
        {/* Input Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-blue-400/10 text-white">
            <CardHeader>
              <CardTitle className="text-blue-300">
                Generate Your Message
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="message-purpose-select"
                  className="text-slate-400"
                >
                  Purpose of Message
                </Label>
                <Select
                  value={messagePurpose}
                  onValueChange={setMessagePurpose}
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    id="message-purpose-select"
                    className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#202230] text-white border border-[#363A4D]">
                    <SelectItem value="Follow-up after interview">
                      Follow-up after interview
                    </SelectItem>
                    <SelectItem value="Expressing interest in a job">
                      Expressing interest in a job
                    </SelectItem>
                    <SelectItem value="Networking inquiry">
                      Networking inquiry
                    </SelectItem>
                    <SelectItem value="Thank you note">
                      Thank you note
                    </SelectItem>
                    <SelectItem value="Asking for referral">
                      Asking for referral
                    </SelectItem>
                    <SelectItem value="Accepting job offer">
                      Accepting job offer
                    </SelectItem>
                    <SelectItem value="Declining job offer">
                      Declining job offer
                    </SelectItem>
                    <SelectItem value="General inquiry">
                      General inquiry
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="recipient-name-input"
                  className="text-slate-400"
                >
                  Recipient's Name (Optional)
                </Label>
                <Input
                  id="recipient-name-input"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g., 'Jane Doe' or 'Hiring Team'"
                  className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 rounded-md shadow-sm"
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="key-details-textarea"
                  className="text-slate-400"
                >
                  Key Details / Context
                </Label>
                <Textarea
                  id="key-details-textarea"
                  value={keyDetails}
                  onChange={(e) => setKeyDetails(e.target.value)}
                  placeholder="e.g., 'Interview for Software Engineer on Monday', 'Job ID: 12345', 'My skills in React and Node.js', 'We met at the tech conference'"
                  rows={6}
                  className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 rounded-md shadow-sm"
                  disabled={isGenerating}
                />
              </div>
              <div className="md:col-span-2 text-center">
                <Button
                  onClick={handleGenerateMessage}
                  disabled={
                    isGenerating || !messagePurpose.trim() || !keyDetails.trim()
                  }
                  size="lg"
                  className="bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-400/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate Message
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Message Result Card */}
        <AnimatePresence mode="wait">
          {(generatedMessage || isGenerating) && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-purple-400/10 text-white">
                <CardHeader>
                  <CardTitle className="text-purple-300">
                    Your Generated Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="min-h-[200px] flex items-center justify-center text-slate-400">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Crafting
                      your message...
                    </div>
                  ) : (
                    <div className="min-h-[200px] p-4 bg-[#141624] border border-[#363A4D] rounded-md text-white whitespace-pre-wrap break-words overflow-auto max-h-[600px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={generatedMessage || "empty"}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={resultVariants}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {generatedMessage || ""}
                          </ReactMarkdown>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      onClick={handleCopyMessage}
                      disabled={!generatedMessage || isGenerating}
                      size="sm"
                      className="bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white shadow-md transition-all duration-200 rounded-full px-4 py-2"
                    >
                      <Copy className="w-4 h-4 mr-1" /> Copy
                    </Button>
                    <Button
                      onClick={handleDownloadMessage}
                      disabled={!generatedMessage || isGenerating}
                      size="sm"
                      className="bg-gradient-to-r from-purple-400 to-blue-400 text-black font-semibold hover:from-purple-500 hover:to-blue-500 shadow-md transition-all duration-200 rounded-full px-4 py-2"
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
                      <RefreshCw className="mr-2 h-4 w-4" /> Generate New
                      Message
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
                Tips for Messaging Recruiters
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside">
                <li>
                  Be specific about the job, company, or interaction you're
                  referencing.
                </li>
                <li>Keep your message concise and to the point.</li>
                <li>
                  Always proofread for typos and grammatical errors before
                  sending.
                </li>
                <li>
                  Personalize the message as much as possible, even if
                  AI-generated.
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
