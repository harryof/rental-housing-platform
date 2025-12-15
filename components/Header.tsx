'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setAccessToken } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  role: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthState = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('[HEADER] Error fetching auth state:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthState();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Clear client-side token
      setAccessToken(null);
      
      // Update state
      setUser(null);
      
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('[HEADER] Logout error:', error);
      // Still redirect even if logout fails
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-slate-900" />
            <a href="/" className="text-2xl font-bold text-slate-900 hover:opacity-80 transition-opacity">
              RentalHub
            </a>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-20 h-8 bg-slate-200 animate-pulse rounded"></div>
            ) : user ? (
              <>
                <span className="text-sm text-slate-600">{user.email}</span>
                {user.role === 'USER' && (
                  <a
                    href="/bookings"
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    My Bookings
                  </a>
                )}
                {user.role === 'ADMIN' && (
                  <>
                    <a
                      href="/admin"
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Admin
                    </a>
                    <a
                      href="/admin/bookings"
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Bookings
                    </a>
                  </>
                )}
                <Button variant="outline" onClick={handleLogout} size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Login
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

