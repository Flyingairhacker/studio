"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, MoreVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { BlogPost } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function BlogList() {
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const postsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "blog_posts"), orderBy("publishedAt", "desc"));
    }, [firestore]);

    const { data: posts, isLoading } = useCollection<BlogPost>(postsQuery);

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        const postRef = doc(firestore, "blog_posts", id);
        deleteDocumentNonBlocking(postRef);
        toast({ title: "Post Deleted", description: "The blog post has been removed." });
    };

    const handleTogglePublish = (post: BlogPost) => {
        if (!firestore) return;
        const postRef = doc(firestore, "blog_posts", post.id);
        const newPublishState = !post.isPublished;
        updateDocumentNonBlocking(postRef, { isPublished: newPublishState });
        toast({
            title: `Post ${newPublishState ? 'Published' : 'Unpublished'}`,
            description: `"${post.title}" is now ${newPublishState ? 'live' : 'a draft'}.`,
        });
    }
    
    if (isLoading && !isClient) {
        return (
             <div className="p-4">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-2 p-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                 <h2 className="text-xl font-headline font-semibold">
                    Posts ({posts?.length || 0})
                </h2>
                <Button asChild>
                    <Link href="/admin/blog/editor">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Post
                    </Link>
                </Button>
            </div>

            {!posts || posts.length === 0 ? (
                <div className="text-center py-12 px-6">
                    <h3 className="text-xl font-semibold">No Posts Found</h3>
                    <p className="text-muted-foreground mt-2">Start by creating your first blog post.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead className="hidden md:table-cell">Status</TableHead>
                                <TableHead className="hidden lg:table-cell">Published Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Badge variant={post.isPublished ? "default" : "secondary"}>
                                            {post.isPublished ? "Published" : "Draft"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {format(new Date(post.publishedAt as string), 'PPP')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/blog/editor/${post.id}`}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleTogglePublish(post)}>
                                                    {post.isPublished ? <EyeOff className="mr-2 h-4 w-4"/> : <Eye className="mr-2 h-4 w-4" />}
                                                    {post.isPublished ? 'Unpublish' : 'Publish'}
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            <Trash2 className="mr-2 h-4 w-4 text-destructive" /> 
                                                            <span className="text-destructive">Delete</span>
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the post &quot;{post.title}&quot;.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
    