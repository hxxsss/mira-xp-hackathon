import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface HeroAction {
  text: string;
  href: string;
  icon?: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
}

interface HeroProps {
  badge?: {
    text: string;
    action: {
      text: string;
      href: string;
    };
  };
  title: string;
  description: string;
  actions: HeroAction[];
  image: {
    src: string;
    alt: string;
  };
}

export function HeroSection({
  badge,
  title,
  description,
  actions,
  image,
}: HeroProps) {
  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-4",
        "overflow-hidden pb-0"
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {/* Badge */}
          {badge && (
            <Badge variant="outline" className="animate-fade-in gap-2">
              <span className="text-muted-foreground">{badge.text}</span>
              <Link to={badge.action.href} className="flex items-center gap-1">
                {badge.action.text}
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </Badge>
          )}

          {/* Title */}
          <h1 className="relative z-10 inline-block animate-fade-in bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-4xl font-semibold leading-tight text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-md relative z-10 max-w-[550px] animate-fade-in font-medium text-muted-foreground delay-100 sm:text-xl">
            {description}
          </p>

          {/* Actions */}
          <div className="relative z-10 flex animate-fade-in justify-center gap-4 delay-300">
            {actions.map((action, index) => (
              <Button key={index} variant={action.variant} size="lg" asChild>
                <Link to={action.href} className="flex items-center gap-2">
                  {action.icon}
                  {action.text}
                </Link>
              </Button>
            ))}
          </div>

          {/* Image with Glow */}
          <div className="relative pt-12 w-full max-w-6xl">
            <MockupFrame
              className="animate-fade-in delay-700"
              size="small"
            >
              <Mockup type="responsive">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto"
                />
              </Mockup>
            </MockupFrame>
            <Glow
              variant="top"
              className="animate-scale-in delay-1000"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
