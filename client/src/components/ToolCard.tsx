import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  iconBg: string;
}

export default function ToolCard({ title, description, icon, href, iconBg }: ToolCardProps) {
  return (
    <Card className="tool-card">
      <CardContent className="p-6">
        <div className={`tool-icon ${iconBg}`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm mb-4">{description}</p>
        <Link href={href}>
          <Button className="w-full brand-primary-bg hover:brand-primary-hover text-white">
            Open Tool
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
