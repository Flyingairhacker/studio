
import { Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "../ui/button";

const Footer = () => {
  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://g.dev/flyinghacker" },
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/rohit-kumar-flyinghacker/" },
  ];

  return (
    <footer className="border-t border-foreground/10">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between px-4 py-6 md:px-6">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Rohit Kumar. All rights reserved.
        </p>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          {socialLinks.map(({ name, icon: Icon, href }) => (
            <Button key={name} variant="ghost" size="icon" asChild>
              <a href={href} aria-label={name} target="_blank" rel="noopener noreferrer">
                <Icon className="h-5 w-5" />
              </a>
            </Button>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
