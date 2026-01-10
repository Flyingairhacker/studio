# **App Name**: Cyber Architect

## Core Features:

- 3D Portfolio Display: Showcase projects using an interactive Three.js scene with geometric orbs, star-field background, and a cyber-grid floor.
- Interactive Tech Stack: Display tools like Flutter, Dart, and MQTT as 3D cards that pop on hover with custom-colored shadows.
- Real-time Admin System: Admin dashboard with live editing capabilities. Allows branding, bio, and project updates without page refresh. Uses Firestore as a tool.
- Operator Challenge: Secure admin login with a terminal-style aesthetic, password decryption animations, and a fingerprint icon.
- Project Grid Display: Showcase project cards with imagery, system type icons (Mobile/IoT/Desktop), and frosted-glass buttons for repo/live links.
- Contact Form Inbox: A Firestore-synced real-time feed inbox in the admin dashboard to show Contact form messages.
- Nexus Shield Fallback: Mechanism which implements if Firebase fails to initialize, then transition to using a local data.ts file

## Style Guidelines:

- Primary color: Neon Cyan (#00C8FF) for a vibrant and technological feel.
- Background color: Deep space (#06080D) for an immersive dark background.
- Accent color: Neon Purple (#8B5CF6) to complement the primary with contrast and energy.
- Body font: 'Inter', a sans-serif for clean and modern readability.
- Headline font: 'Space Grotesk', a sans-serif to enhance cyberpunk feel.
- Code font: 'Fira Code', a monospaced font optimized for terminal display.
- Implement Glassmorphism (frosted glass with 1px borders and low opacity) with backdrop blurs (24px+).
- Use Framer Motion for scroll-triggered reveals and smooth transitions.