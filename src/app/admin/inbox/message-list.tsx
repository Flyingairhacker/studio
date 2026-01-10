"use client";

import { useEffect, useState } from "react";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";

import { db, isFirebaseAvailable } from "@/lib/firebase";
import { getMessages } from "@/lib/data-access";
import type { ContactMessage } from "@/lib/types";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";


export function MessageList() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isFirebaseAvailable && db) {
            const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newMessages: ContactMessage[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Convert Firestore Timestamp to Date
                    createdAt: doc.data().createdAt.toDate()
                })) as ContactMessage[];
                setMessages(newMessages);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching messages from Firebase:", error);
                // Fallback on error
                getMessages().then(localMessages => {
                    setMessages(localMessages);
                    setLoading(false);
                });
            });
            return () => unsubscribe();
        } else {
            // Fallback for when firebase is not available
            getMessages().then(localMessages => {
                setMessages(localMessages);
                setLoading(false);
            });
        }
    }, []);

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )
    }

    if (messages.length === 0) {
        return (
            <div className="text-center py-12 px-6">
                <h3 className="text-xl font-semibold">No Transmissions</h3>
                <p className="text-muted-foreground mt-2">Your inbox is currently empty.</p>
            </div>
        );
    }
    
    return (
        <Accordion type="single" collapsible className="w-full">
            {messages.map((msg) => (
                <AccordionItem value={msg.id} key={msg.id} className="border-b border-border/50 first:border-t-0">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30 text-left">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className="hidden sm:inline-flex">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</Badge>
                                <div className="truncate">
                                    <p className="font-semibold truncate">{msg.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{msg.email}</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground truncate hidden md:block max-w-sm">
                                {msg.message}
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-muted/20">
                        <div className="p-6 text-sm whitespace-pre-wrap">
                            <p className="font-bold">Message Payload:</p>
                            {msg.message}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
