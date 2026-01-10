import type { LucideIcon } from "lucide-react";
import type { Timestamp } from "firebase/firestore";

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
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
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
  sentAt: Timestamp | Date | string; 
}

export interface Bio {
    id: string;
    name: string;
    title: string;
    description: string;
    avatarUrl: string;
}
