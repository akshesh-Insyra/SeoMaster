import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { 
  FileText, 
  Unlock, 
  Receipt, 
  Type, 
  Code, 
  Image as ImageIcon 
} from "lucide-react";

export default function Services() {
  const tools = [
    {
      title: "PDF Merger",
      description: "Combine multiple PDF files into one document with drag-and-drop functionality.",
      icon: <FileText className="text-red-600 text-xl" />,
      href: "/merge-pdf",
      iconBg: "bg-red-100"
    },
    {
      title: "PDF Password Remover",
      description: "Remove passwords from PDF files you own. Secure and client-side processing.",
      icon: <Unlock className="text-orange-600 text-xl" />,
      href: "/pdf-password-remover",
      iconBg: "bg-orange-100"
    },
    {
      title: "Invoice Generator",
      description: "Create professional invoices with automatic calculations and PDF export.",
      icon: <Receipt className="text-green-600 text-xl" />,
      href: "/invoice-generator",
      iconBg: "bg-green-100"
    },
    {
      title: "Text Case Converter",
      description: "Convert text between uppercase, lowercase, sentence case, and title case.",
      icon: <Type className="text-blue-600 text-xl" />,
      href: "/text-case-converter",
      iconBg: "bg-blue-100"
    },
    {
      title: "Code Commenting Tool",
      description: "Automatically add meaningful comments to your code for better documentation.",
      icon: <Code className="text-purple-600 text-xl" />,
      href: "/code-commenting-tool",
      iconBg: "bg-purple-100"
    },
    {
      title: "Image Converter",
      description: "Convert HEIC images to JPG or PNG format for universal compatibility.",
      icon: <ImageIcon className="text-cyan-600 text-xl" />,
      href: "/image-converter",
      iconBg: "bg-cyan-100"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">All Tools</h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Complete collection of productivity tools to streamline your workflow and boost efficiency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
