import type { Project, ContactMessage } from "@/lib/types";

export const localProjects: Project[] = [
  {
    id: "project-1",
    title: "Project Cygnus",
    description: "A comprehensive IoT fleet management platform for industrial sensors, providing real-time data visualization and remote device control.",
    techStackIds: ["flutter", "firebase", "iot"],
    systemType: "Web",
    repoUrl: "#",
    liveUrl: "#",
    imageUrl: "https://picsum.photos/seed/1/800/600",
    imageHint: "futuristic dashboard",
  },
  {
    id: "project-2",
    title: "Aquila Mobile",
    description: "Cross-platform mobile application for a smart home ecosystem, enabling users to manage devices, scenes, and automation rules seamlessly.",
    techStackIds: ["flutter", "btle"],
    systemType: "Mobile",
    repoUrl: "#",
    imageUrl: "https://picsum.photos/seed/2/800/600",
    imageHint: "mobile application",
  },
  {
    id: "project-3",
    title: "Orion Edge AI",
    description: "An edge computing module for running machine learning models directly on IoT devices, reducing latency and cloud dependency.",
    techStackIds: ["iot", "gcp"],
    systemType: "IoT",
    liveUrl: "#",
    imageUrl: "https://picsum.photos/seed/3/800/600",
    imageHint: "architecture diagram",
  },
  {
    id: "project-4",
    title: "Draco Desktop Client",
    description: "A powerful desktop application for developers to debug and monitor IoT device communications over various protocols.",
    techStackIds: ["flutter", "dart"],
    systemType: "Desktop",
    repoUrl: "#",
    liveUrl: "#",
    imageUrl: "https://picsum.photos/seed/4/800/600",
    imageHint: "smart home",
  },
];

export const localMessages: ContactMessage[] = [
    {
        id: "msg-1",
        name: "Jane Doe",
        email: "jane.doe@example.com",
        message: "This is a sample message from the local data fallback. It seems Firebase is not connected. I'm interested in collaborating on an IoT project.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
        id: "msg-2",
        name: "John Smith",
        email: "john.smith@example.com",
        message: "Hello, I saw your portfolio and was very impressed. This is another local sample message.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    }
]
