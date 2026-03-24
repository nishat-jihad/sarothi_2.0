import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, addDoc } from 'firebase/firestore';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { ClassSystem } from './components/ClassSystem';
import { VideoPlayer } from './components/VideoPlayer';
import { CommentSection } from './components/CommentSection';
import { AdminPanel } from './components/AdminPanel';
import { Profile } from './components/Profile';
import { ChevronUp, Bell, BookOpen, GraduationCap, Users, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 500);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-blue-500 text-white rounded-full shadow-2xl hover:bg-blue-600 transition-all hover:scale-110 active:scale-95 group"
        >
          <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const HomePage = () => (
  <main>
    <Hero />
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Why Choose Sarothi?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">We provide a structured learning environment with top-tier resources to help you excel in your academic journey.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: BookOpen, title: 'Structured Content', desc: 'Category-wise organized lectures for HSC, SSC and Admission prep.', color: 'text-blue-500', bg: 'bg-blue-50' },
            { icon: GraduationCap, title: 'Expert Instructors', desc: 'Learn from the best educators with years of experience in their fields.', color: 'text-purple-500', bg: 'bg-purple-50' },
            { icon: Users, title: 'Interactive Community', desc: 'Engage with fellow students through our threaded comment system.', color: 'text-green-500', bg: 'bg-green-50' },
          ].map((feature, i) => (
            <div key={i} className="group p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-2xl transition-all duration-500">
              <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", feature.bg)}>
                <feature.icon className={cn("w-8 h-8", feature.color)} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </main>
);

const VideoPage = () => {
  const { videoId } = useParams();
  // In a real app, fetch video data from Firestore
  const mockVideo = {
    id: videoId || '1',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'HSC Physics: Chapter 1 - Introduction to Mechanics',
    likes: 1240,
    dislikes: 12,
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <VideoPlayer 
          videoId={mockVideo.id}
          youtubeId={mockVideo.youtubeId}
          title={mockVideo.title}
          likes={mockVideo.likes}
          dislikes={mockVideo.dislikes}
          onReport={() => alert('Reported!')}
        />
        <CommentSection videoId={mockVideo.id} />
      </div>
    </div>
  );
};

export default function App() {
  const [user] = useAuthState(auth);

  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: user.email === 'alamnishat456@gmail.com' ? 'superadmin' : 'user',
            createdAt: serverTimestamp(),
          });
        }
      }
    };
    syncUser();

    // Seed initial categories if none exist
    const seedCategories = async () => {
      const catSnap = await getDocs(collection(db, 'categories'));
      if (catSnap.empty) {
        const categories = ['HSC', 'SSC', 'Admission'];
        for (const name of categories) {
          await addDoc(collection(db, 'categories'), { name });
        }
      }
    };
    seedCategories();
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen bg-white selection:bg-blue-500 selection:text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/classes" element={<ClassSystem />} />
          <Route path="/category/:categoryId" element={<ClassSystem />} />
          <Route path="/category/:categoryId/group/:groupId" element={<ClassSystem />} />
          <Route path="/category/:categoryId/group/:groupId/subject/:subjectId" element={<ClassSystem />} />
          <Route path="/video/:videoId" element={<VideoPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/notifications" element={<div className="pt-32 px-6 text-center">Notifications coming soon...</div>} />
        </Routes>
        <Footer />
        <ScrollToTop />
      </div>
    </Router>
  );
}
