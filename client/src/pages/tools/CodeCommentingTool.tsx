import { useState } from "react";
import { Code, Loader2, Copy, Download, Sparkles } from "lucide-react";
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
import { useMutation } from "@tanstack/react-query";

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-700 (Secondary)
// - Borders: border-slate-200/300
// - Code Area BG: bg-slate-50/70
// - Accent Gradient: Blue-500 to Purple-500

export default function CodeCommentingTool() {
  const [code, setCode] = useState("");
  const [commentedCode, setCommentedCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const { toast } = useToast();

  // --- Core logic (API call, handlers) is unchanged ---
  // NOTE: This uses a simulated API call. Replace with your actual API endpoint.
  const commentCodeMutation = useMutation({
    mutationFn: async (data: { code: string; language: string }) => {
      // Replace this with your actual API call logic
      console.log("Simulating API call to comment code:", data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Example prompt for a real API
      const prompt = `Add comprehensive comments to the following ${data.language} code. Explain complex parts, the purpose of functions, and the overall logic.\n\n\`\`\`${data.language}\n${data.code}\n\`\`\``;
      return {
        commentedCode: `// This is a simulated comment for ${data.language}\n${data.code}\n// The function above demonstrates a basic implementation.`,
      };
    },
    onSuccess: (data) => {
      setCommentedCode(data.commentedCode);
      toast({ title: "Success!", description: "Code has been commented." });
    },
    onError: (error) => {
      console.error("Code commenting error:", error);
      toast({
        title: "Error",
        description: "Failed to comment code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCommentCode = () => {
    if (!code.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some code to comment.",
        variant: "destructive",
      });
      return;
    }
    commentCodeMutation.mutate({ code, language });
  };

  const handleCopy = async (text: string, type: string) => {
    if (!text) return;
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
          description: `${type} copied via fallback.`,
        });
      } catch (err) {
        toast({ title: "Copy failed", variant: "destructive" });
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
      description: "Code file saved successfully.",
    });
  };

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "typescript", label: "TypeScript" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "sql", label: "SQL" },
  ];

  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <ToolLayout
      title="AI Code Commenter"
      description="Automatically add meaningful comments to your code for better readability and documentation."
      icon={<Code className="text-white" />}
      iconBg="bg-gradient-to-br from-blue-500 to-purple-500"
    >
      <div className="space-y-8">
        {/* Input & Action Section */}
        <motion.div
          variants={cardInViewVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-blue-500/10">
            <CardHeader>
              <CardTitle className="text-blue-600">Enter Your Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="w-full max-w-sm">
                <Label
                  htmlFor="language"
                  className="font-medium text-slate-700"
                >
                  Programming Language
                </Label>
                <Select
                  value={language}
                  onValueChange={setLanguage}
                  disabled={commentCodeMutation.isPending}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="code-input"
                  className="font-medium text-slate-700"
                >
                  Code Snippet
                </Label>
                <Textarea
                  id="code-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  rows={12}
                  className="w-full font-mono text-sm bg-slate-50/70 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 rounded-lg"
                />
              </div>
              <div className="text-center">
                <Button
                  onClick={handleCommentCode}
                  disabled={commentCodeMutation.isPending || !code.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 rounded-full px-10 py-3 text-base font-semibold"
                >
                  {commentCodeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Adding
                      Comments...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" /> Add Comments
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Commented Code Output */}
        <AnimatePresence>
          {(commentCodeMutation.isPending || commentedCode) && (
            <motion.div
              variants={cardInViewVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card className="bg-white border border-slate-200 rounded-xl shadow-lg shadow-purple-500/10">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="text-purple-600">
                    Commented Code
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        handleCopy(commentedCode, "Commented code")
                      }
                      disabled={!commentedCode}
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                    <Button
                      onClick={() =>
                        handleDownload(
                          commentedCode,
                          `commented-code.${language}`
                        )
                      }
                      disabled={!commentedCode}
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {commentCodeMutation.isPending ? (
                    <div className="min-h-[250px] flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                      <p className="font-semibold text-lg">
                        Analyzing and commenting code...
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg font-mono text-sm text-slate-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto"
                    >
                      {commentedCode}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
}
