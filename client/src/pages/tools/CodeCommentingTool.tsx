import { useState } from "react";
import { Code, Loader2, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ToolLayout from "@/components/ToolLayout";

export default function CodeCommentingTool() {
  const [code, setCode] = useState("");
  const [commentedCode, setCommentedCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const { toast } = useToast();

  const commentCodeMutation = useMutation({
    mutationFn: async (data: { code: string; language: string }) => {
      const response = await apiRequest("POST", "/api/comment-code", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCommentedCode(data.commentedCode);
      toast({
        title: "Success!",
        description: "Code commented successfully.",
      });
    },
    onError: (error) => {
      console.error('Code commenting error:', error);
      toast({
        title: "Failed to comment code",
        description: "There was an error processing your code. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCommentCode = () => {
    if (!code.trim()) {
      toast({
        title: "No code to comment",
        description: "Please enter some code first.",
        variant: "destructive"
      });
      return;
    }

    commentCodeMutation.mutate({ code, language });
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
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
    { value: "sql", label: "SQL" }
  ];

  return (
    <ToolLayout
      title="Code Commenting Tool"
      description="Automatically add meaningful comments to your code"
      icon={<Code className="text-purple-600 text-2xl" />}
      iconBg="bg-purple-100"
    >
      <div className="space-y-6">
        {/* Language Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Language Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-xs">
              <Label htmlFor="language">Programming Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
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
          </CardContent>
        </Card>

        {/* Code Input */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Code</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCopy(code, "Original code")}
                  size="sm"
                  variant="outline"
                  disabled={!code}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button
                  onClick={() => handleDownload(code, `original-code.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'txt'}`)}
                  size="sm"
                  variant="outline"
                  disabled={!code}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
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
              className="w-full font-mono text-sm"
            />
            <div className="mt-2 text-sm text-slate-500">
              Lines: {code.split('\n').length} | Characters: {code.length}
            </div>
          </CardContent>
        </Card>

        {/* Comment Button */}
        <div className="text-center">
          <Button
            onClick={handleCommentCode}
            disabled={commentCodeMutation.isPending || !code.trim()}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          >
            {commentCodeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Comments...
              </>
            ) : (
              <>
                <Code className="mr-2 h-4 w-4" />
                Add Comments
              </>
            )}
          </Button>
        </div>

        {/* Commented Code Output */}
        {commentedCode && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Commented Code</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopy(commentedCode, "Commented code")}
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    onClick={() => handleDownload(commentedCode, `commented-code.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'txt'}`)}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full min-h-32 p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm whitespace-pre-wrap">
                {commentedCode}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>1. Select your programming language from the dropdown</li>
              <li>2. Paste your code in the input area</li>
              <li>3. Click "Add Comments" to generate meaningful comments</li>
              <li>4. Review and copy/download the commented code</li>
            </ul>
            <p className="text-blue-700 text-sm mt-3">
              <strong>Note:</strong> Comments are generated using AI to explain what your code does, 
              making it more readable and maintainable.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
