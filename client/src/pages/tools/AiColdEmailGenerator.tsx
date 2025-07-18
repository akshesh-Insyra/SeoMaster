import { useState } from "react";
import {
  Mail,
  Loader2,
  Sparkles,
  RefreshCw,
  Copy,
  Download,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-600 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Sky-500 to Indigo-500
// - Tips/Info Accent: Amber

export default function AiColdEmailGenerator() {
  const [purpose, setPurpose] = useState("Networking");
  const [recipientContext, setRecipientContext] = useState("");
  const [senderContext, setSenderContext] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Framer Motion variants are theme-independent and remain the same
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

  // --- Core logic functions (handleGenerate, handleCopy, handleDownload, handleReset) are unchanged ---
  const handleGenerateEmail = async () => {
    if (!purpose.trim() || !recipientContext.trim() || !senderContext.trim()) {
      toast({
        title: "Missing Information",
        description:
          "Please provide details for all fields to generate an email.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedEmail(null);

    try {
      const prompt = `Generate a professional and compelling cold email for the purpose of "${purpose}".

        Here is some context about the recipient/company: "${recipientContext}".
        Here is some context about me/my offering: "${senderContext}".

        Structure the email with a clear subject line, a personalized opening (e.g., "Dear [Recipient Name],"), a concise body explaining the purpose and value proposition, and a clear call to action.
        Keep it brief, impactful, and professional. Avoid overly generic phrases. Format the output as clean Markdown.`;

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
        const emailText =
          geminiResult.candidates[0].content.parts[0].text.trim();
        setGeneratedEmail(emailText);
        toast({
          title: "Email Generated!",
          description: "Your new cold email is ready below.",
        });
      } else {
        console.error("Unexpected API response structure:", geminiResult);
        toast({
          title: "Generation Failed",
          description: "Could not generate an email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating email:", error);
      toast({
        title: "Generation Error",
        description:
          "An error occurred while contacting the AI. Please check your connection and try again.",
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
      // Fallback for older browsers
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
      icon={<Send className="text-white" />}
      iconBg="bg-gradient-to-br from-sky-500 to-indigo-500"
    >
      <div className="space-y-8">
        {/* Input Card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-sky-500/10">
            <CardHeader>
              <CardTitle className="text-sky-700">Craft Your Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="purpose-select"
                  className="font-medium text-slate-700"
                >
                  Purpose of the Email
                </Label>
                <Select
                  value={purpose}
                  onValueChange={setPurpose}
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    id="purpose-select"
                    className="w-full bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 rounded-md"
                  >
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-slate-800 border-slate-200">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="recipient-context-textarea"
                    className="font-medium text-slate-700"
                  >
                    About the Recipient / Company
                  </Label>
                  <Textarea
                    id="recipient-context-textarea"
                    value={recipientContext}
                    onChange={(e) => setRecipientContext(e.target.value)}
                    placeholder="e.g., 'A Senior PM at Google, company recently launched a new AI product.'"
                    rows={6}
                    className="w-full bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 rounded-md"
                    disabled={isGenerating}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="sender-context-textarea"
                    className="font-medium text-slate-700"
                  >
                    About Me / My Offering
                  </Label>
                  <Textarea
                    id="sender-context-textarea"
                    value={senderContext}
                    onChange={(e) => setSenderContext(e.target.value)}
                    placeholder="e.g., 'I run a SaaS tool that boosts team productivity by 30%.'"
                    rows={6}
                    className="w-full bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 rounded-md"
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <div className="pt-2 text-center">
                <Button
                  onClick={handleGenerateEmail}
                  disabled={
                    isGenerating ||
                    !purpose ||
                    !recipientContext ||
                    !senderContext
                  }
                  size="lg"
                  className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white shadow-lg shadow-sky-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Cold Email
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
              key="result-card"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
            >
              <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-indigo-500/10">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="text-indigo-700">
                    Your Generated Email
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCopyEmail}
                      disabled={!generatedEmail || isGenerating}
                      size="sm"
                      variant="outline"
                      className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-full"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                    <Button
                      onClick={handleDownloadEmail}
                      disabled={!generatedEmail || isGenerating}
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
                      <Loader2 className="h-8 w-8 animate-spin text-sky-500 mb-3" />
                      <p className="font-semibold text-lg">
                        Drafting your email...
                      </p>
                      <p>This should only take a moment.</p>
                    </div>
                  ) : (
                    <div className="min-h-[250px] p-4 bg-slate-50/70 border border-slate-200 rounded-lg max-h-[600px] overflow-y-auto">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={generatedEmail || "empty"}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          variants={resultVariants}
                          className="prose prose-sm lg:prose-base prose-slate max-w-none"
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {generatedEmail || ""}
                          </ReactMarkdown>
                        </motion.div>
                      </AnimatePresence>
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
                Tips for Effective Cold Emails
              </h4>
              <ul className="text-amber-900/80 space-y-2 text-sm list-disc list-outside ml-4">
                <li>
                  Be highly specific about why you're contacting *this* person.
                </li>
                <li>
                  Clearly state your value proposition in the first two
                  sentences.
                </li>
                <li>
                  Keep it concise to respect the recipient's time—under 150
                  words is ideal.
                </li>
                <li>
                  End with a clear, low-friction call to action (e.g., "Are you
                  open to a 15-minute call next week?").
                </li>
                <li>Always personalize the generated email before sending!</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
