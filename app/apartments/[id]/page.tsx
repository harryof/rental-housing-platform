'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Bed, DollarSign, ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

export default function ApartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const id = params.id as string;
        const response = await fetch(`/api/apartments/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Apartment not found');
          } else {
            setError('Failed to load apartment details');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setApartment(data.apartment);
      } catch (err) {
        console.error('Error fetching apartment:', err);
        setError('An error occurred while loading the apartment');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchApartment();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading apartment details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
            <AlertDescription>{error || 'Apartment not found'}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Apartments
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Photos Section */}
          <div className="space-y-4">
            {apartment.photos.length > 0 ? (
              <>
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-200">
                  <img
                    src={apartment.photos[0]}
                    alt={apartment.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {apartment.photos.length > 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    {apartment.photos.slice(1, 5).map((photo, index) => (
                      <div
                        key={index}
                        className="aspect-video w-full overflow-hidden rounded-lg bg-slate-200"
                      >
                        <img
                          src={photo}
                          alt={`${apartment.title} - Photo ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-video w-full flex items-center justify-center bg-slate-200 rounded-lg">
                <Building2 className="h-24 w-24 text-slate-400" />
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {apartment.title}
              </h1>
              <div className="flex items-center gap-2 text-lg text-slate-600 mb-4">
                <MapPin className="h-5 w-5" />
                <span>{apartment.city}</span>
                <span className="text-slate-400">•</span>
                <span>{apartment.address}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <DollarSign className="h-8 w-8 text-slate-900" />
              <span className="text-4xl font-bold text-slate-900">
                {apartment.pricePerDay}
              </span>
              <span className="text-lg text-slate-500">/night</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1 text-base px-3 py-1">
                <Bed className="h-4 w-4" />
                {apartment.bedrooms} {apartment.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {apartment.description}
                </p>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                router.push(`/checkout/${apartment.id}`);
              }}
            >
              Book Now
            </Button>
          </div>
        </div>
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

