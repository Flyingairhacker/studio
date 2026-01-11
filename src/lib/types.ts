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

export interface TechStack {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export interface Service {
  id:string;
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
  techStack: TechStack[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  sentAt: Timestamp | Date | string; 
  createdAt?: Timestamp | Date | string;
}

export interface Bio {
    id: string;
    name: string;
    title: string;
    description: string;
    avatarUrl: string;
    contactTitle?: string;
    contactSubtitle?: string;
    modelUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  imageHint?: string;
  publishedAt: Timestamp | Date | string;
  authorName: string;
  tags: string[];
  isPublished: boolean;
  createdAt?: Timestamp | Date | string;
  updatedAt?: Timestamp | Date | string;
}
