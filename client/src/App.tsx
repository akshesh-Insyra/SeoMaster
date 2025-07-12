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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
