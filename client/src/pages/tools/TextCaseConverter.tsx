import { useState } from "react";
import { Type, Copy, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { 
  convertToUpperCase, 
  convertToLowerCase, 
  convertToSentenceCase, 
  convertToTitleCase,
  convertToCamelCase,
  convertToKebabCase
} from "@/utils/textUtils";

export default function TextCaseConverter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [activeConversion, setActiveConversion] = useState<string>("");
  const { toast } = useToast();

  const conversions = [
    { 
      id: "upper", 
      label: "UPPERCASE", 
      func: convertToUpperCase,
      className: "bg-blue-600 hover:bg-blue-700"
    },
    { 
      id: "lower", 
      label: "lowercase", 
      func: convertToLowerCase,
      className: "bg-slate-600 hover:bg-slate-700"
    },
    { 
      id: "sentence", 
      label: "Sentence case", 
      func: convertToSentenceCase,
      className: "bg-green-600 hover:bg-green-700"
    },
    { 
      id: "title", 
      label: "Title Case", 
      func: convertToTitleCase,
      className: "bg-purple-600 hover:bg-purple-700"
    },
    { 
      id: "camel", 
      label: "camelCase", 
      func: convertToCamelCase,
      className: "bg-orange-600 hover:bg-orange-700"
    },
    { 
      id: "kebab", 
      label: "kebab-case", 
      func: convertToKebabCase,
      className: "bg-cyan-600 hover:bg-cyan-700"
    }
  ];

  const handleConvert = (conversion: any) => {
    if (!inputText.trim()) {
      toast({
        title: "No text to convert",
        description: "Please enter some text first.",
        variant: "destructive"
      });
      return;
    }

    const result = conversion.func(inputText);
    setOutputText(result);
    setActiveConversion(conversion.id);
  };

  const handleCopy = async () => {
    if (!outputText) {
      toast({
        title: "Nothing to copy",
        description: "Please convert some text first.",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy text to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setActiveConversion("");
  };

  const handleDownload = () => {
    if (!outputText) {
      toast({
        title: "Nothing to download",
        description: "Please convert some text first.",
        variant: "destructive"
      });
      return;
    }

    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-text-${activeConversion}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Text file downloaded successfully.",
    });
  };

  return (
    <ToolLayout
      title="Text Case Converter"
      description="Convert text between different cases instantly"
      icon={<Type className="text-blue-600 text-2xl" />}
      iconBg="bg-blue-100"
    >
      <div className="space-y-6">
        {/* Input Text */}
        <Card>
          <CardHeader>
            <CardTitle>Input Text</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text here..."
              rows={6}
              className="w-full"
            />
            <div className="mt-2 text-sm text-slate-500">
              Characters: {inputText.length} | Words: {inputText.trim().split(/\s+/).filter(word => word.length > 0).length}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Convert To</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {conversions.map((conversion) => (
                <Button
                  key={conversion.id}
                  onClick={() => handleConvert(conversion)}
                  className={`${conversion.className} text-white text-sm`}
                  variant={activeConversion === conversion.id ? "default" : "outline"}
                >
                  {conversion.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Output Text */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Output</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  disabled={!outputText}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button
                  onClick={handleDownload}
                  size="sm"
                  variant="outline"
                  disabled={!outputText}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full min-h-32 p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm">
              {outputText || "Converted text will appear here..."}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="text-slate-600 hover:text-red-600"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear All
              </Button>
              <Button
                onClick={() => setInputText("This is a sample text for testing the case converter tool.")}
                variant="outline"
                size="sm"
                className="text-slate-600"
              >
                Load Sample Text
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
