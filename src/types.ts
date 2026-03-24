export type UserRole = 'superadmin' | 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  board?: string;
  year?: string;
  gender?: string;
  mobile?: string;
  recentlyWatched?: string[];
}

export interface Category {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  categoryId: string;
  name: string;
}

export interface Subject {
  id: string;
  groupId: string;
  name: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  playlistUrl?: string;
  oneshotVideoId?: string;
  pdfUrl?: string;
  downloads?: {
    '360p'?: string;
    '480p'?: string;
    '720p'?: string;
  };
}

export interface Video {
  id: string;
  chapterId: string;
  title: string;
  youtubeId: string;
  likes: number;
  dislikes: number;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  likes: number;
  createdAt: any;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  createdAt: any;
}

export interface Report {
  id: string;
  type: 'video' | 'comment';
  targetId: string;
  reporterId: string;
  reason: string;
  createdAt: any;
}
