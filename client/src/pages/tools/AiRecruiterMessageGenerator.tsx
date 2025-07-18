import { useState } from "react";
import {
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-700 (Secondary)
// - Borders: border-slate-200/300
// - Accent Gradient: Teal-500 to Indigo-500
// - Tips/Info Accent: Amber

export default function AiRecruiterMessageGenerator() {
  const [messagePurpose, setMessagePurpose] = useState("Follow-up after interview");
  const [keyDetails, setKeyDetails] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Framer Motion variants are theme-independent
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const resultVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // --- Core logic functions (handleGenerate, handleCopy, etc.) are unchanged ---
  const handleGenerateMessage = async () => {
    if (!messagePurpose.trim() || !keyDetails.trim()) {
      toast({ title: "Missing Information", description: "Please select a purpose and provide key details.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setGeneratedMessage(null);

    try {
      let prompt = `Generate a professional message to a recruiter. The purpose is: "${messagePurpose}". Key details/context: "${keyDetails}".`;
      if (recipientName.trim()) {
        prompt += ` The recipient's name is "${recipientName.trim()}".`;
      } else {
        prompt += ` Address the recruiter generally (e.g., "Dear Hiring Team,").`;
      }
      prompt += ` Ensure the message is concise, clear, professional, and formatted with appropriate line breaks.`;
      
      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const geminiResult = await response.json();

      if (geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) {
        const messageText = geminiResult.candidates[0].content.parts[0].text.trim();
        setGeneratedMessage(messageText);
        toast({ title: "Message Generated!", description: "Your professional message is ready." });
      } else {
        console.error("API Error:", geminiResult);
        toast({ title: "Generation Failed", description: "Could not generate the message. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast({ title: "Connection Error", description: "Could not connect to the AI. Please check your connection.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopyMessage = async () => {
    if (!generatedMessage) return;
    try {
      await navigator.clipboard.writeText(generatedMessage);
      toast({ title: "Copied!", description: "Generated message copied to clipboard." });
    } catch (error) {
        const textarea = document.createElement("textarea");
        textarea.value = generatedMessage;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          toast({ title: "Copied!", description: "Message copied to clipboard (fallback)." });
        } catch (err) {
          toast({ title: "Copy Failed", description: "Unable to copy to clipboard.", variant: "destructive" });
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
    a.download = `recruiter-message-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Message saved as a .txt file." });
  };

  const handleReset = () => {
    setMessagePurpose("Follow-up after interview");
    setKeyDetails("");
    setRecipientName("");
    setGeneratedMessage(null);
    setIsGenerating(false);
    toast({ title: "Tool Reset", description: "Ready to generate a new message." });
  };

  return (
    <ToolLayout
      title="AI Recruiter Message Generator"
      description="Craft professional and tailored messages to recruiters for any situation."
      icon={<MessageSquareText className="text-white" />}
      iconBg="bg-gradient-to-br from-teal-500 to-indigo-500"
    >
      <div className="space-y-8">
        {/* Input Card */}
        <motion.div variants={cardInViewVariants} initial="hidden" animate="visible">
          <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-teal-500/10">
            <CardHeader><CardTitle className="text-teal-600">Craft Your Message</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="message-purpose-select" className="font-medium text-slate-700">Purpose of Message</Label>
                  <Select value={messagePurpose} onValueChange={setMessagePurpose} disabled={isGenerating}>
                    <SelectTrigger id="message-purpose-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Follow-up after interview">Follow-up after interview</SelectItem>
                      <SelectItem value="Expressing interest in a job">Expressing interest in a job</SelectItem>
                      <SelectItem value="Networking inquiry">Networking inquiry</SelectItem>
                      <SelectItem value="Thank you note">Thank you note</SelectItem>
                      <SelectItem value="Asking for referral">Asking for referral</SelectItem>
                      <SelectItem value="Accepting job offer">Accepting job offer</SelectItem>
                      <SelectItem value="Declining job offer">Declining job offer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient-name-input" className="font-medium text-slate-700">Recipient's Name (Optional)</Label>
                  <Input id="recipient-name-input" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g., Jane Doe" className="bg-white" disabled={isGenerating} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="key-details-textarea" className="font-medium text-slate-700">Key Details & Context</Label>
                <Textarea id="key-details-textarea" value={keyDetails} onChange={(e) => setKeyDetails(e.target.value)} placeholder="e.g., 'Interview for Software Engineer on Monday at 2 PM', 'Job ID: 12345', 'My skills in React and Node.js match the description perfectly.'" rows={5} className="bg-white" disabled={isGenerating} />
              </div>
              <div className="text-center pt-2">
                <Button onClick={handleGenerateMessage} disabled={isGenerating || !keyDetails.trim()} size="lg" className="bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white shadow-lg shadow-teal-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold">
                  {isGenerating ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>) : (<><Sparkles className="mr-2 h-5 w-5" /> Generate Message</>)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Result Card */}
        <AnimatePresence>
          {(generatedMessage || isGenerating) && (
            <motion.div variants={cardInViewVariants} initial="hidden" animate="visible" exit="hidden">
              <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-indigo-500/10">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="text-indigo-600">Your Generated Message</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handleCopyMessage} disabled={!generatedMessage || isGenerating} size="sm" variant="outline" className="rounded-full"><Copy className="w-4 h-4 mr-2" /> Copy</Button>
                    <Button onClick={handleDownloadMessage} disabled={!generatedMessage || isGenerating} size="sm" variant="outline" className="rounded-full"><Download className="w-4 h-4 mr-2" /> Download</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="min-h-[200px] flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-teal-500 mb-3" />
                      <p className="font-semibold text-lg">Crafting your message...</p>
                    </div>
                  ) : (
                    <motion.div key={generatedMessage} variants={resultVariants} initial="initial" animate="animate" exit="exit" className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg max-h-[500px] overflow-y-auto">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm lg:prose-base prose-slate max-w-none">{generatedMessage || ""}</ReactMarkdown>
                    </motion.div>
                  )}
                   <div className="mt-6 text-center">
                    <Button onClick={handleReset} size="lg" variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-full px-8 py-3 font-semibold">
                      <RefreshCw className="mr-2 h-4 w-4" /> Start Over
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Card */}
        <motion.div variants={cardInViewVariants} initial="hidden" animate="visible">
          <Card className="bg-amber-50 border border-amber-200/80 rounded-xl shadow-lg shadow-amber-500/10">
            <CardContent className="p-6">
              <h4 className="font-semibold text-amber-700 mb-3 text-lg">Tips for Messaging Recruiters</h4>
              <ul className="text-amber-900/80 space-y-2 text-sm list-disc list-outside ml-4">
                <li>Be specific about the job or interaction you're referencing.</li>
                <li>Keep your message concise and to the point; recruiters are busy!</li>
                <li>Always proofread for typos before sending.</li>
                <li>Personalize the generated message to add your own voice and sincerity.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}