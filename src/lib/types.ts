import type { LucideIcon } from "lucide-react";

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  imageHint: string;
  systemType: 'Mobile' | 'IoT' | 'Desktop' | 'Web';
  repoUrl?: string;
  liveUrl?: string;
}

export interface Tech {
  name: string;
  Icon: React.ElementType;
  color: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}

export interface PortfolioData {
  name: string;
  title: string;
  bio: string;
  projects: Project[];
  services: Service[];
  techStack: Tech[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: any; // Firestore timestamp or ISO string
}
