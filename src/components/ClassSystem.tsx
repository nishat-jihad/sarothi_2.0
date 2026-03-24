import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Play, FileText, Download, ChevronRight, BookOpen, Layers, GraduationCap, Search, Filter, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link, useParams, useNavigate } from 'react-router-dom';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ClassSystem: React.FC = () => {
  const { categoryId, groupId, subjectId } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const [categories] = useCollectionData(collection(db, 'categories'));
  const [groups] = useCollectionData(
    categoryId ? query(collection(db, 'groups'), where('categoryId', '==', categoryId)) : null
  );
  const [subjects] = useCollectionData(
    groupId ? query(collection(db, 'subjects'), where('groupId', '==', groupId)) : null
  );
  const [chapters] = useCollectionData(
    subjectId ? query(collection(db, 'chapters'), where('subjectId', '==', subjectId)) : null
  );

  const currentCategory = categories?.find(c => c.id === categoryId);
  const currentGroup = groups?.find(g => g.id === groupId);
  const currentSubject = subjects?.find(s => s.id === subjectId);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs / Navigation */}
        <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-2 bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
            <Link to="/classes" className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              !categoryId ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:bg-gray-50"
            )}>
              Categories
            </Link>
            {categoryId && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <Link to={`/category/${categoryId}`} className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                  categoryId && !groupId ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:bg-gray-50"
                )}>
                  {currentCategory?.name || 'Category'}
                </Link>
              </>
            )}
            {groupId && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <Link to={`/category/${categoryId}/group/${groupId}`} className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                  groupId && !subjectId ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:bg-gray-50"
                )}>
                  {currentGroup?.name || 'Group'}
                </Link>
              </>
            )}
            {subjectId && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <span className="px-6 py-2 rounded-xl text-sm font-bold bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                  {currentSubject?.name || 'Subject'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Content Rendering */}
        <AnimatePresence mode="wait">
          {!categoryId && (
            <motion.div 
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {categories?.map((cat: any) => (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.id}`}
                  className="group relative bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                      <GraduationCap className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-4">{cat.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">Comprehensive study materials and video lectures specifically designed for {cat.name} students.</p>
                    <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest">
                      Explore Now
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}

          {categoryId && !groupId && (
            <motion.div 
              key="groups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {groups?.map((group: any) => (
                <Link 
                  key={group.id} 
                  to={`/category/${categoryId}/group/${group.id}`}
                  className="group bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                    <Layers className="w-7 h-7 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{group.name}</h3>
                  <p className="text-gray-500 text-sm mb-6">Structured subjects for {group.name} stream.</p>
                  <div className="h-1 w-12 bg-purple-500 rounded-full group-hover:w-full transition-all duration-500" />
                </Link>
              ))}
            </motion.div>
          )}

          {groupId && !subjectId && (
            <motion.div 
              key="subjects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              {subjects?.map((sub: any) => (
                <Link 
                  key={sub.id} 
                  to={`/category/${categoryId}/group/${groupId}/subject/${sub.id}`}
                  className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-blue-500 transition-all text-center"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{sub.name}</h3>
                </Link>
              ))}
            </motion.div>
          )}

          {subjectId && (
            <motion.div 
              key="chapters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {chapters?.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Chapters Found</h3>
                  <p className="text-gray-500">We are currently uploading content for this subject. Check back soon!</p>
                </div>
              )}
          {chapters?.map((chapter: any) => (
                <ChapterCard key={chapter.id} chapter={chapter} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ChapterCard: React.FC<{ chapter: any }> = ({ chapter }) => {
  const [user] = useAuthState(auth);
  const [showDownloads, setShowDownloads] = useState(false);

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              Chapter
            </span>
            <span className="text-xs text-gray-400 font-medium">12 Lectures • 4.5 Hours</span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{chapter.name}</h3>
          <p className="text-gray-500 text-sm mt-2 max-w-2xl">Master the concepts of {chapter.name} with our comprehensive video lectures and detailed lecture slides.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Playlist Button */}
          <button className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95">
            <Play className="w-4 h-4 fill-current" />
            Playlist
          </button>

          {/* Oneshot Button */}
          <Link 
            to={`/video/${chapter.oneshotVideoId}`}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Oneshot
          </Link>

          {/* Download Button */}
          <div className="relative">
            <button 
              onClick={() => setShowDownloads(!showDownloads)}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black rounded-2xl font-bold hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-400/20 hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <AnimatePresence>
              {showDownloads && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full right-0 mb-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 min-w-[200px] z-20"
                >
                  {!user ? (
                    <p className="text-xs text-gray-500 text-center py-2">Sign in to download</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Select Quality</p>
                      {['360p', '480p', '720p'].map(q => (
                        <button key={q} className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center justify-between group/q">
                          {q}
                          <Download className="w-3 h-3 text-gray-300 group-hover/q:text-blue-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PDF Button */}
          <a 
            href={chapter.pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            PDF
          </a>
        </div>
      </div>
    </div>
  );
};
