"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, serverTimestamp, Timestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and hyphenated"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters").max(200, "Excerpt must be 200 characters or less"),
  content: z.string().min(1, "Content cannot be empty"),
  imageUrl: z.string().url("Must be a valid URL"),
  imageHint: z.string().optional(),
  authorName: z.string().min(1, "Author name is required"),
  isPublished: z.boolean().default(false),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

export default function BlogEditor({ post }: { post?: Partial<BlogPost> | null }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(!!post);
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      imageUrl: "https://picsum.photos/seed/blog-post/1200/800",
      imageHint: "technology abstract",
      authorName: "Cyber Architect",
      isPublished: false,
    },
  });

  const watchedTitle = watch("title");

  useEffect(() => {
    if (watchedTitle && !post) { // Only auto-slugify for new posts
      setValue("slug", slugify(watchedTitle), { shouldValidate: true });
    }
  }, [watchedTitle, setValue, post]);

  useEffect(() => {
    if (post) {
        setValue("title", post.title || "");
        setValue("slug", post.slug || "");
        setValue("excerpt", post.excerpt || "");
        setValue("content", post.content || "");
        setValue("imageUrl", post.imageUrl || "https://picsum.photos/seed/blog-post/1200/800");
        setValue("imageHint", post.imageHint || "technology abstract");
        setValue("authorName", post.authorName || "Cyber Architect");
        setValue("isPublished", !!post.isPublished);
        setIsLoading(false);
    } else {
        setIsLoading(false);
    }
  }, [post, setValue]);

  const processSubmit = async (data: BlogPostFormData) => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Firestore is not available.",
      });
      return;
    }

    startTransition(() => {
      const isNewPost = !post?.id;
      const dataToSave = {
        ...data,
        publishedAt: isNewPost ? serverTimestamp() : (post?.publishedAt || serverTimestamp()),
        updatedAt: serverTimestamp()
      };
      
      if (isNewPost) {
        const postsCollection = collection(firestore, "blog_posts");
        addDocumentNonBlocking(postsCollection, dataToSave);
        toast({
          title: "Post Created",
          description: "Your new blog post has been saved as a draft.",
        });
      } else {
        const postRef = doc(firestore, "blog_posts", post!.id!);
        setDocumentNonBlocking(postRef, dataToSave, { merge: true });
        toast({
          title: "Post Updated",
          description: "Your changes have been saved.",
        });
      }
      router.push("/admin/blog");
      router.refresh(); // Tell Next.js to re-fetch server components
    });
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-24 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-40 w-full" /></div>
            <div className="flex justify-end"><Skeleton className="h-10 w-24" /></div>
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} placeholder="Your Post Title" />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <Input id="slug" {...register("slug")} placeholder="your-post-slug" />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" {...register("excerpt")} placeholder="A short summary of your post." className="h-24" />
        {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content (Markdown supported)</Label>
        <Textarea id="content" {...register("content")} placeholder="Write your article here..." className="h-72 font-code" />
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="imageUrl">Feature Image URL</Label>
            <Input id="imageUrl" {...register("imageUrl")} placeholder="https://example.com/image.jpg" />
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="authorName">Author Name</Label>
            <Input id="authorName" {...register("authorName")} />
            {errors.authorName && <p className="text-sm text-destructive">{errors.authorName.message}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-4 rounded-md border p-4">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-none">Publish Status</p>
          <p className="text-sm text-muted-foreground">
            {watch('isPublished') ? "This post is visible to the public." : "This post is currently a draft."}
          </p>
        </div>
        <Controller
          name="isPublished"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-2">
                <EyeOff className={`h-5 w-5 transition-colors ${!field.value ? 'text-primary' : 'text-muted-foreground'}`}/>
                <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                />
                <Eye className={`h-5 w-5 transition-colors ${field.value ? 'text-primary' : 'text-muted-foreground'}`}/>
            </div>
          )}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/blog')}>Cancel</Button>
        <Button type="submit" disabled={isPending || !isDirty}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
