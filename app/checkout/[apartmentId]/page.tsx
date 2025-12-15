'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, DollarSign, Calendar, AlertCircle, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import { fetchWithAuth } from '@/lib/api-client';

interface Apartment {
  id: string;
  title: string;
  city: string;
  address: string;
  pricePerDay: number;
  photos: string[];
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        // Check if user is authenticated
        const authResponse = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (!authResponse.ok || !(await authResponse.json()).user) {
          router.push('/login');
          return;
        }

        const apartmentId = params.apartmentId as string;
        const response = await fetch(`/api/apartments/${apartmentId}`);
        
        if (!response.ok) {
          setError('Apartment not found');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setApartment(data.apartment);
      } catch (err) {
        console.error('Error fetching apartment:', err);
        setError('Failed to load apartment');
      } finally {
        setLoading(false);
      }
    };

    if (params.apartmentId) {
      fetchApartment();
    }
  }, [params.apartmentId, router]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!apartment) return 0;
    return calculateDays() * apartment.pricePerDay;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      setSubmitting(false);
      return;
    }

    const days = calculateDays();
    if (days <= 0) {
      setError('End date must be after start date');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetchWithAuth('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apartmentId: apartment?.id,
          startDate,
          endDate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create booking');
        setSubmitting(false);
        return;
      }

      // Redirect to bookings page
      router.push('/bookings');
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('An error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !apartment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!apartment) return null;

  const days = calculateDays();
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <Button
          variant="outline"
          onClick={() => router.push(`/apartments/${apartment.id}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Apartment
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>Select your dates to complete your booking</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="startDate">Check-in Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={today}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Check-out Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || today}
                    required
                  />
                </div>

                {days > 0 && (
                  <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Number of nights:</span>
                      <span className="font-semibold">{days}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price per night:</span>
                      <span className="font-semibold">${apartment.pricePerDay}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${total}</span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={submitting || days <= 0}
                >
                  {submitting ? 'Processing...' : 'Confirm Booking'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Apartment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{apartment.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {apartment.city} - {apartment.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apartment.photos.length > 0 && (
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-200">
                  <img
                    src={apartment.photos[0]}
                    alt={apartment.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold">${apartment.pricePerDay}</span>
                <span className="text-slate-500">/night</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

