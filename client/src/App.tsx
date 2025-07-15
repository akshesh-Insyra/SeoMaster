import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import MergePdf from "@/pages/tools/MergePdf";
import PdfPasswordRemover from "@/pages/tools/PdfPasswordRemover";
import InvoiceGenerator from "@/pages/tools/InvoiceGenerator";
import TextCaseConverter from "@/pages/tools/TextCaseConverter";
import CodeCommentingTool from "@/pages/tools/CodeCommentingTool";
import ImageConverter from "@/pages/tools/ImageConverter";
import UnitConverter from "@/pages/tools/Unit-converter";
import TextGenerator from "@/pages/tools/Text-generator";
import AiEmailAssistant from "@/pages/tools/AiEmailAssistant";
import ColorPaletteGenerator from "@/pages/tools/ColorPaletteGenerator";
import AiInterviewPracticeTool from "@/pages/tools/AiInterviewPracticeTool";
import AiInterviewStudyGuide from "@/pages/tools/AiInterviewStudyGuide";
import CharacterCounter from "@/pages/tools/CharacterCounter";
import PlagiarismChecker from "@/pages/tools/PlagiarismChecker";
import WatermarkRemover from "@/pages/tools/WatermarkRemover";
import AiIdeaGenerator from "@/pages/tools/AiIdeaGenerator";
import CoverLetterGenerator from "@/pages/tools/CoverLetterGenerator";
import AiRecruiterMessageGenerator from "@/pages/tools/AiRecruiterMessageGenerator";
import AiBrainstormingAssistant from "@/pages/tools/AiBrainstormingAssistant";
import AiColdEmailGenerator from "@/pages/tools/AiColdEmailGenerator";
import AiContentHumanizer from "@/pages/tools/AiContentHumanizer";

import Header from "./components/Header";
import Footer from "./components/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/merge-pdf" component={MergePdf} />
      <Route path="/pdf-password-remover" component={PdfPasswordRemover} />
      <Route path="/invoice-generator" component={InvoiceGenerator} />
      <Route path="/text-case-converter" component={TextCaseConverter} />
      <Route path="/code-commenting-tool" component={CodeCommentingTool} />
      <Route path="/image-converter" component={ImageConverter} />
      <Route path="/unit-converter" component={UnitConverter} />
      <Route path="/text-generator" component={TextGenerator} />
      <Route path="/email-assistant" component={AiEmailAssistant} />
      <Route path="/color-palette-generator" component={ColorPaletteGenerator} />
      <Route path="/interview-practice" component={AiInterviewPracticeTool} />
      <Route path="/interview-study-guide" component={AiInterviewStudyGuide} />
      <Route path="/character-counter" component={CharacterCounter} />
      <Route path="/plagiarism-checker" component={PlagiarismChecker} />
      <Route path="/watermark-remover" component={WatermarkRemover} />
      <Route path="/ai-idea-generator" component={AiIdeaGenerator} />
      <Route path="/cover-letter-generator" component={CoverLetterGenerator} />
      <Route path="/ai-recruiter-message-generator" component={AiRecruiterMessageGenerator} />
      <Route path="/ai-brainstorming-assistant" component={AiBrainstormingAssistant} />
      <Route path="/ai-cold-email-generator" component={AiColdEmailGenerator} />
      <Route path="/ai-content-humanizer" component={AiContentHumanizer} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
    <Header/>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
      <Footer />
    </>
  );
}

export default App;
