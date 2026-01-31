//app/admin/posts/edit/[id]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import EditPosts from '@/components/admin/EditPosts';

export default function Page() {
  return <EditPosts />;
}