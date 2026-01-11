import { redirect } from 'next/navigation';

// This is a catch-all for creating a new post.
// The URL /admin/blog/editor will redirect to the editor with a 'new' slug.
export default function NewPostPage() {
    redirect('/admin/blog/editor/new');
}
