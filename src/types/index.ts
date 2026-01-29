import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  bio: string;
  institution: string;
  researchInterests: string[];
  profileCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  title: string;
  content: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  messageCount: number;
  interestCount: number;
}

export interface Message {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  content: string;
  createdAt: Timestamp;
}

export interface Interest {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  createdAt: Timestamp;
}
