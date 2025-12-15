'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Bed, DollarSign } from 'lucide-react';
import Header from '@/components/Header';

interface Apartment {
  id: string;
  title: string;
  city: string;
  address: string;
  pricePerDay: number;
  bedrooms: number;
  description: string;
  photos: string[];
  isActive: boolean;
}

export default function Home() {
  const router = useRouter();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApartments = async () => {
    try {
      const response = await fetch('/api/apartments');
      if (response.ok) {
        const data = await response.json();
        setApartments(data.apartments);
      }
    } catch (error) {
      console.error('Error fetching apartments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();

    const interval = setInterval(() => {
      fetchApartments();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading apartments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Find Your Perfect Stay
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Browse our curated collection of apartments in prime locations.
            Book your next adventure with confidence.
          </p>
        </div>

        {apartments.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-xl text-slate-500">No apartments available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apartment) => (
              <Card key={apartment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video w-full overflow-hidden bg-slate-200">
                  {apartment.photos.length > 0 ? (
                    <img
                      src={apartment.photos[0]}
                      alt={apartment.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-slate-400" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{apartment.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-base">
                    <MapPin className="h-4 w-4" />
                    {apartment.city}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4 line-clamp-2">
                    {apartment.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      {apartment.bedrooms} {apartment.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                    </Badge>
                  </div>
                  <div className="flex items-baseline gap-1 text-2xl font-bold text-slate-900">
                    <DollarSign className="h-6 w-6" />
                    {apartment.pricePerDay}
                    <span className="text-sm font-normal text-slate-500">/night</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <button
                    onClick={() => router.push(`/apartments/${apartment.id}`)}
                    className="w-full py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    View Details
                  </button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600">
            <p>&copy; 2024 RentalHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
