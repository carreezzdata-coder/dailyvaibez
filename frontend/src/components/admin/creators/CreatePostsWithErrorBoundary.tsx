import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import CreatePosts from '../CreatePosts';

interface User {
  admin_id: number;
  first_name: string;
  last_name: string;
  role: string;
}

interface CreatePostsWithErrorBoundaryProps {
  user?: User;
  maxImages?: number;
  maxSocialLinks?: number;
}

const CreatePostsWithErrorBoundary: React.FC<CreatePostsWithErrorBoundaryProps> = (props) => {
  return (
    <ErrorBoundary>
      <CreatePosts {...props} />
    </ErrorBoundary>
  );
};

export default CreatePostsWithErrorBoundary;