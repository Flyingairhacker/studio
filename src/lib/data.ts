
import type { Project, ContactMessage } from "@/lib/types";

export const localProjects: Project[] = [
  {
    id: "project-1",
    title: "My Diary App",
    description: "A mobile application for scheduling, managing, and sharing meetings and notes among employees and clients. Implemented for internal communications at Appnweb Technologies, improving team collaboration by 40%.",
    techStackIds: ["flutter", "firebase", "getx", "dio"],
    systemType: "Mobile",
    repoUrl: "#",
    liveUrl: "#",
    imageUrl: "https://picsum.photos/seed/mydiary/800/600",
    imageHint: "digital diary schedule",
  },
  {
    id: "project-2",
    title: "Jeebly Desktop",
    description: "Windows-based software for booking and managing both documented and non-documented deliveries. Successfully deployed in the UAE, streamlining delivery management processes.",
    techStackIds: ["flutter", "sql", "rest-api"],
    systemType: "Desktop",
    repoUrl: "#",
    liveUrl: "#",
    imageUrl: "https://picsum.photos/seed/jeebly/800/600",
    imageHint: "delivery logistics dashboard",
  },
  {
    id: "project-3",
    title: "Broker Jee",
    description: "A property listing and management app connecting property dealers with customers. Facilitated over 500 property transactions, reducing deal closure time by 30%.",
    techStackIds: ["flutter", "firebase", "google-maps"],
    systemType: "Mobile",
    repoUrl: "#",
    liveUrl: "#",
    imageUrl: "https://picsum.photos/seed/brokerjee/800/600",
    imageHint: "real estate map",
  },
  {
    id: "project-4",
    title: "Real-Time Air Quality Monitoring System",
    description: "Designed a system to monitor and visualize real-time air quality data through mobile and web applications, using IoT (Arduino) and Flutter.",
    techStackIds: ["iot", "flutter", "firebase"],
    systemType: "IoT",
    repoUrl: "#",
    liveUrl: "#",
    imageUrl: "https://picsum.photos/seed/airquality/800/600",
    imageHint: "air quality sensor",
  },
    {
    id: "project-5",
    title: "Gas Leakage Detector System",
    description: "Engineered a smart home safety system that detects gas leakage, sends mobile alerts, and triggers alarms for immediate response using IoT sensors and Flutter.",
    techStackIds: ["iot", "flutter", "firebase"],
    systemType: "IoT",
    repoUrl: "#",
    liveUrl: "#",
    imageUrl: "https://picsum.photos/seed/gasdetector/800/600",
    imageHint: "gas sensor alert",
  },
  {
    id: "project-6",
    title: "Geolocation-Based Attendance System",
    description: "A location-based employee attendance tracking system ensuring precise work-hour monitoring.",
    techStackIds: ["flutter", "firebase", "google-maps"],
    systemType: "Mobile",
    repoUrl: "#",
    liveUrl: "#",
    imageUrl: "https://picsum.photos/seed/geoattendance/800/600",
    imageHint: "location tracking map",
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
