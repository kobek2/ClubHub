import type { AppProps } from 'next/app';
import { useState, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import '../styles/globals.css';
import { MOCK_USERS } from '../src/Utils/mockData';
import { User } from '../src/types';

// Create a context for currentUser
const UserContext = createContext<{ currentUser: User; setCurrentUser: (user: User) => void } | null>(null);

export const useCurrentUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useCurrentUser must be used within App');
  return context;
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);

  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* --- TOP NAVIGATION --- */}
      <nav className="bg-indigo-900 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/board" className="flex items-center space-x-2 cursor-pointer group">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold group-hover:bg-indigo-400 transition-colors">C</div>
            <span className="font-bold text-lg tracking-wide">ClubHub</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-indigo-800 rounded-lg px-3 py-1">
              <span className="text-xs text-indigo-300 mr-2">Viewing as:</span>
              <select 
                className="bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
                value={currentUser.id}
                onChange={(e) => {
                  const user = MOCK_USERS.find(u => u.id === e.target.value);
                  if (user) setCurrentUser(user);
                }}
              >
                {MOCK_USERS.map(u => <option key={u.id} value={u.id} className="text-gray-800">{u.name}</option>)}
              </select>
            </div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentUser.avatar}`}>
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* --- PAGE HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {router.pathname === '/agenda' ? 'E-Board Agenda' : 
               router.pathname === '/calendar' ? 'Club Calendar' : 
               router.pathname === '/roadmap' ? 'Semester Roadmap' : 
               'Task Board'}
            </h1>
          </div>
              
          <div className="flex space-x-3">
            <Link 
              href="/roadmap"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/roadmap') ? 'bg-white text-indigo-600 shadow-sm border-b-2 border-indigo-600' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
            >
              Roadmap
            </Link>
            <Link 
              href="/calendar"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/calendar') ? 'bg-white text-indigo-600 shadow-sm border-b-2 border-indigo-600' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
            >
              Calendar
            </Link>
            <Link 
              href="/board"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/board') ? 'bg-white text-indigo-600 shadow-sm border-b-2 border-indigo-600' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
            >
              Board
            </Link>
            <Link 
              href="/agenda"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/agenda') ? 'bg-white text-indigo-600 shadow-sm border-b-2 border-indigo-600' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
            >
              Agenda
            </Link>
            
            {currentUser.role === 'PRESIDENT' && (
              <Link
                href="/events/new"
                className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-md transition-all active:scale-95"
              >
                <Plus size={16} className="mr-2" />
                New Event
              </Link>
            )}
          </div>
        </header>

        {/* --- MAIN CONTENT AREA --- */}
        <UserContext.Provider value={{ currentUser, setCurrentUser }}>
          <Component {...pageProps} currentUser={currentUser} />
        </UserContext.Provider>
      </div>
    </div>
  );
}
