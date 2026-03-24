import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { User, Mail, Phone, Calendar, MapPin, Award, Clock, PlayCircle, Edit3, Save, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Profile: React.FC = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [recentlyWatched, setRecentlyWatched] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    displayName: '',
    board: '',
    year: '',
    gender: '',
    mobile: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfile(data);
        setFormData({
          displayName: data.displayName || '',
          board: data.board || '',
          year: data.year || '',
          gender: data.gender || '',
          mobile: data.mobile || '',
        });

        // Fetch recently watched videos
        if (data.recentlyWatched?.length > 0) {
          const videosRef = collection(db, 'videos');
          const q = query(videosRef, where('id', 'in', data.recentlyWatched.slice(0, 4)));
          const videosSnap = await getDocs(q);
          setRecentlyWatched(videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, formData);
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Please sign in to view your profile.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-24">
              <div className="relative mb-8 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/20 shadow-xl mb-4">
                  <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-full h-full object-cover" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{profile?.displayName}</h2>
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </p>
                <div className="mt-4 px-4 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {profile?.role || 'User'}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Personal Info</h3>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all text-blue-500"
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: MapPin, label: 'Board', value: profile?.board, key: 'board' },
                    { icon: Calendar, label: 'Year', value: profile?.year, key: 'year' },
                    { icon: User, label: 'Gender', value: profile?.gender, key: 'gender' },
                    { icon: Phone, label: 'Mobile', value: profile?.mobile, key: 'mobile' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={(formData as any)[item.key]}
                            onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-sm font-bold text-gray-700">{item.value || 'Not set'}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <button 
                    onClick={handleSave}
                    className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Save className="w-5 h-5" />
                    Save Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Progress & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Classes Watched', value: '24', icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Study Hours', value: '12.5h', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
                { label: 'Achievements', value: '8', icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className={cn("p-4 rounded-2xl", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recently Watched */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Recently Watched
                </h3>
                <button className="text-sm font-bold text-blue-500 hover:underline">View All</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentlyWatched.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    No recently watched videos. Start learning now!
                  </div>
                )}
                {recentlyWatched.map((video) => (
                  <Link 
                    key={video.id} 
                    to={`/video/${video.id}`}
                    className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                  >
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0">
                      <img 
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="w-6 h-6 text-white fill-current" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">{video.title}</h4>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Resume at 12:45</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Learning Path */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Your Learning Path</h3>
              <div className="relative space-y-8 before:absolute before:top-2 before:bottom-2 before:left-4 before:w-0.5 before:bg-gray-100">
                {[
                  { title: 'HSC Physics - Chapter 1', status: 'completed', date: 'Oct 24, 2025' },
                  { title: 'HSC Chemistry - Chapter 3', status: 'in-progress', date: 'Oct 26, 2025' },
                  { title: 'HSC Math - Chapter 2', status: 'upcoming', date: 'TBD' },
                ].map((step, i) => (
                  <div key={i} className="relative pl-12">
                    <div className={cn(
                      "absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-sm",
                      step.status === 'completed' ? "bg-green-500" :
                      step.status === 'in-progress' ? "bg-blue-500" : "bg-gray-200"
                    )}>
                      {step.status === 'completed' && <Award className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{step.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                          step.status === 'completed' ? "bg-green-100 text-green-600" :
                          step.status === 'in-progress' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                        )}>
                          {step.status}
                        </span>
                        • {step.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
