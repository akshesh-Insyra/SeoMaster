import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { FileText, Receipt, Type } from "lucide-react";

export default function Home() {
  const featuredTools = [
    {
      title: "PDF Merger",
      description: "Combine multiple PDF files into one document easily. Drag, drop, and merge in seconds.",
      icon: <FileText className="text-red-600 text-xl" />,
      href: "/merge-pdf",
      iconBg: "bg-red-100"
    },
    {
      title: "Invoice Generator",
      description: "Create professional invoices with automatic calculations. Export to PDF instantly.",
      icon: <Receipt className="text-green-600 text-xl" />,
      href: "/invoice-generator",
      iconBg: "bg-green-100"
    },
    {
      title: "Text Case Converter",
      description: "Convert text between uppercase, lowercase, sentence case, and more formats.",
      icon: <Type className="text-blue-600 text-xl" />,
      href: "/text-case-converter",
      iconBg: "bg-blue-100"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-50 to-cyan-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              <span className="brand-primary">INSYRA</span> Tools
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 mb-4">Free Online Utilities</p>
            <p className="text-lg text-slate-500 max-w-3xl mx-auto mb-8">
              Streamline your workflow with our collection of powerful, free online tools. 
              From PDF management to code optimization, we've got everything you need to boost productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button size="lg" className="brand-primary-bg hover:brand-primary-hover text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Explore Tools
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Tools */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Tools</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Start with our most popular productivity tools, designed to save you time and effort.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/services">
              <Button size="lg" className="bg-slate-800 text-white hover:bg-slate-700">
                View All Tools
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
