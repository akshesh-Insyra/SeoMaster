import { useState } from "react";
import {
  Mail,
  Loader2,
  Sparkles,
  RefreshCw,
  Copy,
  Download,
  Send,
} from "lucide-react"; // Added Send icon
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

export default function AiColdEmailGenerator() {
  const [purpose, setPurpose] = useState("Networking"); // Default purpose
  const [recipientContext, setRecipientContext] = useState(""); // Details about recipient/company
  const [senderContext, setSenderContext] = useState(""); // Details about sender/what they offer
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
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

  const handleGenerateEmail = async () => {
    if (!purpose.trim() || !recipientContext.trim() || !senderContext.trim()) {
      toast({
        title: "Missing Information",
        description:
          "Please select a purpose and provide details about both the recipient and yourself.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedEmail(null); // Clear previous result

    try {
      const prompt = `Generate a professional and compelling cold email for the purpose of "${purpose}".

      Here is some context about the recipient/company: "${recipientContext}".
      Here is some context about me/my offering: "${senderContext}".

      Structure the email with a clear subject line, a personalized opening (e.g., "Dear [Recipient Name],"), a concise body explaining the purpose and value proposition, and a clear call to action.
      Keep it brief, impactful, and professional. Avoid overly generic phrases.`;

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
        const emailText =
          geminiResult.candidates[0].content.parts[0].text.trim();
        setGeneratedEmail(emailText);
        toast({
          title: "Email Generated!",
          description: "Your cold email is ready.",
        });
      } else {
        console.error("Unexpected API response structure:", geminiResult);
        toast({
          title: "Generation Failed",
          description: "Could not generate email. Please try again.",
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

  const handleCopyEmail = async () => {
    if (!generatedEmail) return;
    try {
      await navigator.clipboard.writeText(generatedEmail);
      toast({
        title: "Copied!",
        description: "Generated email copied to clipboard.",
      });
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = generatedEmail;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast({
          title: "Copied!",
          description: "Email copied to clipboard (fallback).",
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

  const handleDownloadEmail = () => {
    if (!generatedEmail) return;
    const blob = new Blob([generatedEmail], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cold-email-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Email text file downloaded successfully.",
    });
  };

  const handleReset = () => {
    setPurpose("Networking");
    setRecipientContext("");
    setSenderContext("");
    setGeneratedEmail(null);
    setIsGenerating(false);
    toast({
      title: "Tool Reset",
      description: "Ready to generate a new cold email.",
    });
  };

  return (
    <ToolLayout
      title="AI Cold Email Generator"
      description="Craft compelling and personalized cold emails for networking, sales, or job inquiries using AI."
      icon={<Send className="text-white text-2xl" />} // Using Send icon
      iconBg="bg-gradient-to-br from-purple-600 to-red-500" // A new vibrant gradient
    >
      <div className="space-y-6">
        {/* Input Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-purple-600/10 text-white">
            <CardHeader>
              <CardTitle className="text-purple-400">
                Generate Your Cold Email
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                {" "}
                {/* Purpose takes full width */}
                <Label htmlFor="purpose-select" className="text-slate-400">
                  Purpose of the Email
                </Label>
                <Select
                  value={purpose}
                  onValueChange={setPurpose}
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    id="purpose-select"
                    className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 rounded-md shadow-sm"
                  >
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#202230] text-white border border-[#363A4D]">
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Job Inquiry">Job Inquiry</SelectItem>
                    <SelectItem value="Sales Outreach">
                      Sales Outreach
                    </SelectItem>
                    <SelectItem value="Partnership Proposal">
                      Partnership Proposal
                    </SelectItem>
                    <SelectItem value="Information Request">
                      Information Request
                    </SelectItem>
                    <SelectItem value="Event Invitation">
                      Event Invitation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="recipient-context-textarea"
                  className="text-slate-400"
                >
                  About the Recipient / Company
                </Label>
                <Textarea
                  id="recipient-context-textarea"
                  value={recipientContext}
                  onChange={(e) => setRecipientContext(e.target.value)}
                  placeholder="e.g., 'Recipient is a Senior Product Manager at Google, company recently launched a new AI product.', 'Company is a startup in sustainable energy, I admire their work on solar panels.'"
                  rows={6}
                  className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 rounded-md shadow-sm"
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="sender-context-textarea"
                  className="text-slate-400"
                >
                  About Me / My Offering
                </Label>
                <Textarea
                  id="sender-context-textarea"
                  value={senderContext}
                  onChange={(e) => setSenderContext(e.target.value)}
                  placeholder="e.g., 'I am a software engineer with 5 years of experience in AI/ML.', 'My company offers a new SaaS tool that boosts team productivity by 30%.', 'I'm looking for mentorship in product management.'"
                  rows={6}
                  className="w-full font-sans text-base bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 rounded-md shadow-sm"
                  disabled={isGenerating}
                />
              </div>
              <div className="md:col-span-2 text-center">
                <Button
                  onClick={handleGenerateEmail}
                  disabled={
                    isGenerating ||
                    !purpose.trim() ||
                    !recipientContext.trim() ||
                    !senderContext.trim()
                  }
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-red-500 hover:from-purple-700 hover:to-red-600 text-white shadow-lg shadow-purple-600/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate Cold Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated Email Result Card */}
        <AnimatePresence mode="wait">
          {(generatedEmail || isGenerating) && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-red-500/10 text-white">
                <CardHeader>
                  <CardTitle className="text-red-400">
                    Your Generated Cold Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="min-h-[200px] flex items-center justify-center text-slate-400">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Drafting
                      your email...
                    </div>
                  ) : (
                    <div className="min-h-[200px] p-4 bg-[#141624] border border-[#363A4D] rounded-md text-white whitespace-pre-wrap break-words overflow-auto max-h-[600px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={generatedEmail || "empty"}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={resultVariants}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {generatedEmail || ""}
                          </ReactMarkdown>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      onClick={handleCopyEmail}
                      disabled={!generatedEmail || isGenerating}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-red-500 hover:from-purple-700 hover:to-red-600 text-white shadow-md transition-all duration-200 rounded-full px-4 py-2"
                    >
                      <Copy className="w-4 h-4 mr-1" /> Copy
                    </Button>
                    <Button
                      onClick={handleDownloadEmail}
                      disabled={!generatedEmail || isGenerating}
                      size="sm"
                      className="bg-gradient-to-r from-red-500 to-purple-600 text-black font-semibold hover:from-red-600 hover:to-purple-700 shadow-md transition-all duration-200 rounded-full px-4 py-2"
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
                      <RefreshCw className="mr-2 h-4 w-4" /> Generate New Email
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
                Tips for Effective Cold Emails
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-disc list-inside">
                <li>
                  Be highly specific about the recipient and your
                  connection/reason for outreach.
                </li>
                <li>
                  Clearly state your purpose and value proposition early in the
                  email.
                </li>
                <li>Keep it concise; respect the recipient's time.</li>
                <li>Include a clear, low-friction call to action.</li>
                <li>
                  Personalize the generated email with specific names and
                  details before sending.
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
