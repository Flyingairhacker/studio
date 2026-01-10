"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SectionTitle from "../ui/section-title";
import GlassCard from "../ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { saveMessage } from "@/app/contact/actions";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Bio } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

const ContactClient = () => {
  const { toast } = useToast();
  const firestore = useFirestore();
  const bioRef = useMemoFirebase(() => firestore ? doc(firestore, "bio", "main-bio") : null, [firestore]);
  const { data: bio, isLoading } = useDoc<Bio>(bioRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await saveMessage(values);

    if (result.error) {
        toast({
            variant: "destructive",
            title: "Transmission Failed",
            description: result.error,
        });
    } else {
        toast({
            title: "Transmission Received",
            description: "Your message has been sent. I will get back to you shortly.",
        });
        form.reset();
    }
  }

  return (
    <section id="contact" className="container mx-auto px-4 py-20 md:px-6 md:py-32">
      <SectionTitle
        title={bio?.contactTitle || "Request Intel"}
        subtitle={bio?.contactSubtitle || "Open a secure channel for inquiries, collaborations, or to discuss a project. All transmissions are monitored."}
      />
      <GlassCard className="max-w-3xl mx-auto mt-16 p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-code text-primary">Your_Name</FormLabel>
                    <FormControl>
                      <Input placeholder="[Enter your name]" {...field} className="bg-background/50 focus:bg-background"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-code text-primary">Your_Email</FormLabel>
                    <FormControl>
                      <Input placeholder="[Enter your email]" {...field} className="bg-background/50 focus:bg-background"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-code text-primary">Your_Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="[Begin your message...]"
                      className="min-h-[150px] bg-background/50 focus:bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full text-lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Transmitting..." : "Send Transmission"}
            </Button>
          </form>
        </Form>
      </GlassCard>
    </section>
  );
};

export default ContactClient;
