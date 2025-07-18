import { useState } from "react";
import { Type, Copy, RotateCcw, Download, Pilcrow, CaseUpper, CaseLower } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ToolLayout from "@/components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  convertToUpperCase, convertToLowerCase, convertToSentenceCase, convertToTitleCase,
  convertToCamelCase, convertToKebabCase,
} from "@/utils/textUtils"; // Assuming utility functions

// Light Theme Palette Notes:
// - Page Background: bg-slate-50
// - Card Background: bg-white
// - Text: text-slate-800 (Primary), text-slate-600 (Secondary)
// - Borders: border-slate-200/300
// - Accent: Sky Blue

export default function TextCaseConverter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [activeConversion, setActiveConversion] = useState<string>("");
  const { toast } = useToast();

  const conversions = [
    { id: "upper", label: "UPPERCASE", func: convertToUpperCase, icon: CaseUpper },
    { id: "lower", label: "lowercase", func: convertToLowerCase, icon: CaseLower },
    { id: "sentence", label: "Sentence case", func: convertToSentenceCase, icon: Pilcrow },
    { id: "title", label: "Title Case", func: convertToTitleCase, icon: Type },
    { id: "camel", label: "camelCase", func: convertToCamelCase, icon: Type },
    { id: "kebab", label: "kebab-case", func: convertToKebabCase, icon: Type },
  ];

  // --- Core logic functions (handleConvert, handleCopy, etc.) are unchanged ---
  const handleConvert = (conversion: { id: string; func: (text: string) => string }) => {
    if (!inputText.trim()) {
      toast({ title: "No text to convert", description: "Please enter some text first.", variant: "destructive" });
      return;
    }
    setOutputText(conversion.func(inputText));
    setActiveConversion(conversion.id);
  };
  
  const handleCopy = async () => {
    if (!outputText) {
      toast({ title: "Nothing to copy", description: "Please convert some text first.", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(outputText);
      toast({ title: "Copied!", description: "Converted text copied to clipboard." });
    } catch (error) {
      toast({ title: "Copy Failed", description: "Unable to copy text.", variant: "destructive" });
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setActiveConversion("");
  };

  const handleDownload = () => {
    if (!outputText) {
      toast({ title: "Nothing to download", description: "Please convert some text first.", variant: "destructive" });
      return;
    }
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted-text-${activeConversion || "output"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Text file saved successfully." });
  };
  
  const cardInViewVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const outputTextVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <ToolLayout
      title="Text Case Converter"
      description="Instantly convert your text between uppercase, lowercase, title case, and more."
      icon={<Type className="text-white" />}
      iconBg="bg-gradient-to-br from-sky-500 to-blue-600"
    >
      <div className="space-y-8">
        {/* Input & Conversion Card */}
        <motion.div variants={cardInViewVariants} initial="hidden" animate="visible">
          <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-sky-500/10">
            <CardHeader><CardTitle className="text-sky-600">1. Enter Your Text</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or type your text here..."
                rows={8}
                className="bg-white text-lg"
              />
              <div className="mt-2 text-sm text-slate-500">
                Characters: {inputText.length} | Words: {inputText.trim().split(/\s+/).filter(Boolean).length}
              </div>
            </CardContent>
            <CardHeader className="border-t border-slate-200"><CardTitle className="text-slate-700">2. Choose Conversion</CardTitle></CardHeader>
             <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {conversions.map((conversion) => (
                  <Button
                    key={conversion.id}
                    onClick={() => handleConvert(conversion)}
                    variant={activeConversion === conversion.id ? "default" : "outline"}
                    className={activeConversion === conversion.id ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'text-slate-700'}
                  >
                    {conversion.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Output Card */}
        <AnimatePresence>
          {outputText && (
             <motion.div variants={cardInViewVariants} initial="hidden" animate="visible" exit="hidden">
              <Card className="bg-white border-slate-200 rounded-xl shadow-lg shadow-blue-500/10">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="text-blue-600">3. Get Your Result</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handleCopy} size="sm" variant="outline" className="rounded-full"><Copy className="w-4 h-4 mr-2" /> Copy</Button>
                    <Button onClick={handleDownload} size="sm" variant="outline" className="rounded-full"><Download className="w-4 h-4 mr-2" /> Download</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={outputText}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={outputTextVariants}
                      className="w-full min-h-[150px] p-4 bg-slate-50 border border-slate-200 rounded-lg text-lg text-slate-800 whitespace-pre-wrap break-words"
                    >
                      {outputText}
                    </motion.div>
                  </AnimatePresence>
                   <div className="mt-6 flex flex-wrap gap-3 justify-center">
                      <Button onClick={handleClear} variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full">
                        <RotateCcw className="w-4 h-4 mr-2" /> Clear All
                      </Button>
                      <Button onClick={() => setInputText("This is a sample text for testing the case converter tool.")} variant="ghost" className="text-sky-600 hover:bg-sky-50 hover:text-sky-700 rounded-full">
                        Load Sample Text
                      </Button>
                    </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
}