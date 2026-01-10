import { FirebaseClientProvider } from "@/firebase/client-provider";
import BrandingClient from "./branding-client";

export default function AdminBrandingPage() {
  return (
    <FirebaseClientProvider>
      <BrandingClient />
    </FirebaseClientProvider>
  );
}
