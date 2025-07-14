import { useState } from "react";
import { Code, Loader2, Copy, Download } from "lucide-react";
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
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";

export default function CodeCommentingTool() {
  const [code, setCode] = useState("");
  const [commentedCode, setCommentedCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const { toast } = useToast();

  const commentCodeMutation = useMutation({
    mutationFn: async (data: { code: string; language: string }) => {
      console.log("Simulating API call to comment code:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
      return {
        commentedCode: `// This is a simulated comment for ${data.language}\n${data.code}\n// End of simulated comments`,
      };
    },
    onSuccess: (data) => {
      setCommentedCode(data.commentedCode);
      toast({ title: "Success!", description: "Code commented successfully." });
    },
    onError: (error) => {
      console.error("Code commenting error:", error);
      toast({
        title: "Failed to comment code",
        description:
          "There was an error processing your code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCommentCode = () => {
    if (!code.trim()) {
      toast({
        title: "No code to comment",
        description: "Please enter some code first.",
        variant: "destructive",
      });
      return;
    }
    commentCodeMutation.mutate({ code, language });
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: `${type} copied to clipboard.` });
    } catch (error) {
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
      description: "Code file downloaded successfully.",
    });
  };

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
    { value: "csharp", label: "C#" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "typescript", label: "TypeScript" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "sql", label: "SQL" },
  ];

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

  // Framer Motion variants for output text change
  const outputCodeVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <ToolLayout
      title="Code Commenting Tool"
      description="Automatically add meaningful comments to your code"
      icon={<Code className="text-white text-2xl" />}
      // Consistent green/yellow gradient for tool icon background
      iconBg="bg-gradient-to-br from-[#00A389] to-[#FFD700]"
      // Overall background should match the header's dark theme
      className="bg-[#1A1C2C] text-white"
    >
      <div className="space-y-6">
        {/* Language Selection */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#00A389]/10 text-white">
            <CardHeader>
              <CardTitle className="text-[#00A389]">
                Language Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-xs sm:max-w-sm">
                <Label htmlFor="language" className="text-slate-400 mb-2 block">
                  Programming Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-[#141624] border border-[#363A4D] text-white focus:ring-[#00A389] focus:border-[#00A389] transition-all duration-200">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1C2C] text-white border-[#2d314d]">
                    {languages.map((lang) => (
                      <SelectItem
                        key={lang.value}
                        value={lang.value}
                        className="hover:bg-[#202230] focus:bg-[#202230] text-white transition-colors duration-150"
                      >
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Your Code Input */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#FFD700]/10 text-white">
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <CardTitle className="text-[#FFD700]">Your Code</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopy(code, "Original code")}
                    size="sm"
                    className="bg-gradient-to-r from-[#00A389] to-[#FFD700] hover:from-[#008C75] hover:to-[#E6C200] text-white shadow-md shadow-[#00A389]/30 transition-all duration-200 rounded-full px-4 py-2"
                    disabled={!code}
                  >
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                  <Button
                    onClick={() =>
                      handleDownload(code, `original-code.${language}`)
                    }
                    size="sm"
                    className="bg-gradient-to-r from-[#FFD700] to-[#00A389] text-black font-semibold hover:from-[#E6C200] hover:to-[#008C75] shadow-md shadow-[#FFD700]/30 transition-all duration-200 rounded-full px-4 py-2"
                    disabled={!code}
                  >
                    <Download className="w-4 h-4 mr-1" /> Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                rows={12}
                className="w-full font-mono text-sm bg-[#141624] border border-[#363A4D] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00A389]/50 focus:border-[#00A389] rounded-lg transition-all"
              />
              <div className="mt-2 text-sm text-slate-400">
                Lines: {code.split("\n").length} | Characters: {code.length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Comments Button */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="text-center">
            <Button
              onClick={handleCommentCode}
              disabled={commentCodeMutation.isPending || !code.trim()}
              size="lg"
              className="bg-gradient-to-r from-[#00A389] to-[#FFD700] hover:from-[#008C75] hover:to-[#E6C200] text-white shadow-lg shadow-[#00A389]/30 transform hover:scale-105 transition-all duration-300 rounded-full px-8 py-3 font-semibold"
            >
              {commentCodeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding
                  Comments...
                </>
              ) : (
                <>
                  <Code className="mr-2 h-4 w-4" /> Add Comments
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Commented Code Output */}
        <AnimatePresence mode="wait">
          {commentedCode && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardInViewVariants}
            >
              <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#AF00C3]/10 text-white">
                <CardHeader>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <CardTitle className="text-[#AF00C3]">
                      Commented Code
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleCopy(commentedCode, "Commented code")
                        }
                        size="sm"
                        className="bg-gradient-to-r from-[#00A389] to-[#FFD700] hover:from-[#008C75] hover:to-[#E6C200] text-white shadow-md shadow-[#00A389]/30 transition-all duration-200 rounded-full px-4 py-2"
                      >
                        <Copy className="w-4 h-4 mr-1" /> Copy
                      </Button>
                      <Button
                        onClick={() =>
                          handleDownload(
                            commentedCode,
                            `commented-code.${language}`
                          )
                        }
                        size="sm"
                        className="bg-gradient-to-r from-[#FFD700] to-[#00A389] text-black font-semibold hover:from-[#E6C200] hover:to-[#008C75] shadow-md shadow-[#FFD700]/30 transition-all duration-200 rounded-full px-4 py-2"
                      >
                        <Download className="w-4 h-4 mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={commentedCode}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={outputCodeVariants}
                      className="w-full min-h-32 p-4 bg-[#141624] border border-[#363A4D] rounded-lg font-mono text-sm text-slate-100 whitespace-pre-wrap overflow-auto max-h-96"
                    >
                      {commentedCode}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works: Instructions */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={cardInViewVariants}
        >
          <Card className="bg-[#1A1C2C] border border-[#2d314d] backdrop-blur-md rounded-xl shadow-lg shadow-[#00A389]/10 text-white">
            <CardContent className="p-6">
              <h4 className="font-semibold text-[#00A389] mb-3 text-lg">
                How it works:
              </h4>
              <ul className="text-slate-400 space-y-2 text-sm list-decimal list-inside">
                <li>Select your programming language from the dropdown</li>
                <li>Paste your code in the input area</li>
                <li>Click "Add Comments" to generate meaningful comments</li>
                <li>Review and copy/download the commented code</li>
              </ul>
              <p className="text-[#AF00C3] text-sm mt-4">
                <strong>Note:</strong> Comments are generated using AI to
                explain what your code does, making it more readable and
                maintainable.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ToolLayout>
  );
}
