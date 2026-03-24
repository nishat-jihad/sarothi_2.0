import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Shield, Plus, Edit2, Trash2, CheckCircle, AlertCircle, Search, Users, Layout, FileText, Activity, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AdminPanel: React.FC = () => {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<'content' | 'users' | 'logs' | 'validator'>('content');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        setIsAdmin(userData.role === 'admin' || userData.role === 'superadmin');
        setIsSuperAdmin(userData.role === 'superadmin');
      }
    };
    checkAdmin();
  }, [user]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You do not have the necessary permissions to access the admin panel. Please contact the super admin if you believe this is an error.</p>
          <button className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-all">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Shield className="w-10 h-10 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-2">Manage Project Sarothi's content, users, and system integrity.</p>
          </div>
          
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
            {[
              { id: 'content', icon: Layout, label: 'Content' },
              { id: 'users', icon: Users, label: 'Users' },
              { id: 'logs', icon: Activity, label: 'Logs' },
              { id: 'validator', icon: CheckCircle, label: 'Validator' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  activeTab === tab.id ? "bg-blue-500 text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {activeTab === 'content' && <ContentManager />}
          {activeTab === 'users' && <UserManager isSuperAdmin={isSuperAdmin} />}
          {activeTab === 'logs' && <ActivityLogs />}
          {activeTab === 'validator' && <LinkValidator />}
        </div>
      </div>
    </div>
  );
};

const ContentManager = () => {
  const [categories] = useCollectionData(collection(db, 'categories'));
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await addDoc(collection(db, 'categories'), { name: newCategory.trim() });
      setNewCategory('');
      setIsAdding(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'categories');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Education Hierarchy</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories?.map((cat: any) => (
          <div key={cat.id} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Category</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"><Edit2 className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-red-100 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h3>
            <p className="text-sm text-gray-500 mb-6">Manage groups, subjects and chapters under this category.</p>
            <button className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
              View Groups
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">New Category</h3>
              <input
                type="text"
                placeholder="Category Name (e.g. HSC)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl mb-6 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddCategory}
                  className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserManager = ({ isSuperAdmin }: { isSuperAdmin: boolean }) => {
  const [users] = useCollectionData(collection(db, 'users'));

  const handleRoleChange = async (uid: string, newRole: string) => {
    if (!isSuperAdmin) return;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role: newRole });
      
      // Log activity
      await addDoc(collection(db, 'activityLogs'), {
        adminId: auth.currentUser?.uid,
        adminName: auth.currentUser?.displayName,
        action: 'ROLE_CHANGE',
        details: `Changed user ${uid} role to ${newRole}`,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">User Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <th className="pb-4 px-4">User</th>
              <th className="pb-4 px-4">Email</th>
              <th className="pb-4 px-4">Role</th>
              <th className="pb-4 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users?.map((u: any) => (
              <tr key={u.uid} className="group hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img src={u.photoURL} className="w-10 h-10 rounded-full" />
                    <span className="font-bold text-gray-900">{u.displayName}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">{u.email}</td>
                <td className="py-4 px-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    u.role === 'superadmin' ? "bg-purple-100 text-purple-600" :
                    u.role === 'admin' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                  )}>
                    {u.role}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {isSuperAdmin && u.uid !== auth.currentUser?.uid && (
                    <select 
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg text-xs px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ActivityLogs = () => {
  const [logs] = useCollectionData(query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc'), limit(50)));

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">System Activity Logs</h2>
      <div className="space-y-4">
        {logs?.map((log: any) => (
          <div key={log.id} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="p-2 rounded-xl bg-white shadow-sm">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">{log.adminName}</span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  {log.action}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{log.details}</p>
              <span className="text-xs text-gray-400">
                {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : 'Just now'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LinkValidator = () => {
  const [chapters] = useCollectionData(collection(db, 'chapters'));
  const [results, setResults] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateLinks = async () => {
    setIsValidating(true);
    const validationResults = [];
    
    for (const chapter of (chapters || [])) {
      if (chapter.pdfUrl) {
        try {
          const res = await fetch(chapter.pdfUrl, { method: 'HEAD' });
          validationResults.push({
            chapter: chapter.name,
            type: 'PDF',
            url: chapter.pdfUrl,
            status: res.ok ? 'valid' : 'broken'
          });
        } catch {
          validationResults.push({
            chapter: chapter.name,
            type: 'PDF',
            url: chapter.pdfUrl,
            status: 'broken'
          });
        }
      }
    }
    setResults(validationResults);
    setIsValidating(false);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Link Integrity Validator</h2>
        <button 
          onClick={validateLinks}
          disabled={isValidating}
          className="px-8 py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
        >
          {isValidating ? 'Validating...' : 'Run Full Scan'}
        </button>
      </div>

      <div className="space-y-4">
        {results.length === 0 && <div className="text-center py-12 text-gray-400 italic">No validation results yet. Run a scan to check for broken links.</div>}
        {results.map((res, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-4">
              {res.status === 'valid' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
              <div>
                <h4 className="font-bold text-gray-900">{res.chapter}</h4>
                <p className="text-xs text-gray-500 truncate max-w-md">{res.url}</p>
              </div>
            </div>
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
              res.status === 'valid' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            )}>
              {res.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
