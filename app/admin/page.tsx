'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, Pencil, Trash2, LogOut, Sparkles, AlertCircle, Check } from 'lucide-react';
import { fetchWithAuth, setAccessToken } from '@/lib/api-client';

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
  updatedAt: string;
}

interface ApartmentFormData {
  title: string;
  city: string;
  address: string;
  pricePerDay: string;
  bedrooms: string;
  description: string;
  photos: string;
  isActive: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  const [formData, setFormData] = useState<ApartmentFormData>({
    title: '',
    city: '',
    address: '',
    pricePerDay: '',
    bedrooms: '',
    description: '',
    photos: '',
    isActive: true,
  });

  const fetchApartments = async () => {
    try {
      const response = await fetchWithAuth('/api/apartments/admin');
      if (response.ok) {
        const data = await response.json();
        setApartments(data.apartments);
      } else {
        setError('Failed to fetch apartments');
      }
    } catch (error) {
      console.error('Error fetching apartments:', error);
      setError('Failed to fetch apartments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Middleware already validated admin access, just fetch apartments
    fetchApartments();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      city: '',
      address: '',
      pricePerDay: '',
      bedrooms: '',
      description: '',
      photos: '',
      isActive: true,
    });
    setEditingApartment(null);
  };

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.city || !formData.bedrooms || !formData.pricePerDay) {
      setError('Please fill in title, city, bedrooms, and price first');
      return;
    }

    setGeneratingAI(true);
    setError('');

    try {
      const response = await fetchWithAuth('/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          city: formData.city,
          bedrooms: parseInt(formData.bedrooms),
          pricePerDay: parseInt(formData.pricePerDay),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, description: data.description });
        setSuccess('AI description generated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to generate description');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      setError('Failed to generate description');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleCreateApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const photosArray = formData.photos
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url);

      const response = await fetchWithAuth('/api/apartments/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          photos: photosArray,
          pricePerDay: parseInt(formData.pricePerDay),
          bedrooms: parseInt(formData.bedrooms),
        }),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        resetForm();
        fetchApartments();
        setSuccess('Apartment created successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create apartment');
      }
    } catch (error) {
      console.error('Error creating apartment:', error);
      setError('Failed to create apartment');
    }
  };

  const handleUpdateApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApartment) return;

    setError('');

    try {
      const photosArray = formData.photos
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url);

      const response = await fetchWithAuth(`/api/apartments/admin/${editingApartment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          photos: photosArray,
          pricePerDay: parseInt(formData.pricePerDay),
          bedrooms: parseInt(formData.bedrooms),
        }),
      });

      if (response.ok) {
        setEditingApartment(null);
        resetForm();
        fetchApartments();
        setSuccess('Apartment updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update apartment');
      }
    } catch (error) {
      console.error('Error updating apartment:', error);
      setError('Failed to update apartment');
    }
  };

  const handleDeleteApartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this apartment?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`/api/apartments/admin/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchApartments();
        setSuccess('Apartment deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete apartment');
      }
    } catch (error) {
      console.error('Error deleting apartment:', error);
      setError('Failed to delete apartment');
    }
  };

  const handleToggleActive = async (apartment: Apartment) => {
    try {
      const response = await fetchWithAuth(`/api/apartments/admin/${apartment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !apartment.isActive,
        }),
      });

      if (response.ok) {
        fetchApartments();
        setSuccess('Visibility updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update visibility');
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
      setError('Failed to update visibility');
    }
  };

  const handleEditClick = (apartment: Apartment) => {
    setEditingApartment(apartment);
    setFormData({
      title: apartment.title,
      city: apartment.city,
      address: apartment.address,
      pricePerDay: apartment.pricePerDay.toString(),
      bedrooms: apartment.bedrooms.toString(),
      description: apartment.description,
      photos: apartment.photos.join('\n'),
      isActive: apartment.isActive,
    });
  };

  const handleLogout = () => {
    setAccessToken(null);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-slate-900" />
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm text-slate-600 hover:text-slate-900">
                View Site
              </a>
              <a href="/admin/bookings" className="text-sm text-slate-600 hover:text-slate-900">
                Bookings
              </a>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Manage Apartments</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Apartment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Apartment</DialogTitle>
                <DialogDescription>
                  Add a new apartment to your rental listings.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateApartment}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pricePerDay">Price per Day ($)</Label>
                      <Input
                        id="pricePerDay"
                        type="number"
                        value={formData.pricePerDay}
                        onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description">Description</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateDescription}
                        disabled={generatingAI}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {generatingAI ? 'Generating...' : 'AI Generate'}
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photos">Photo URLs (one per line)</Label>
                    <Textarea
                      id="photos"
                      value={formData.photos}
                      onChange={(e) => setFormData({ ...formData, photos: e.target.value })}
                      placeholder="https://example.com/photo1.jpg"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active (visible to users)</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Apartment</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={!!editingApartment} onOpenChange={(open) => !open && setEditingApartment(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Apartment</DialogTitle>
              <DialogDescription>
                Update the apartment details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateApartment}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">City</Label>
                    <Input
                      id="edit-city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Address</Label>
                    <Input
                      id="edit-address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-pricePerDay">Price per Day ($)</Label>
                    <Input
                      id="edit-pricePerDay"
                      type="number"
                      value={formData.pricePerDay}
                      onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-bedrooms">Bedrooms</Label>
                    <Input
                      id="edit-bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-description">Description</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateDescription}
                      disabled={generatingAI}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {generatingAI ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </div>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-photos">Photo URLs (one per line)</Label>
                  <Textarea
                    id="edit-photos"
                    value={formData.photos}
                    onChange={(e) => setFormData({ ...formData, photos: e.target.value })}
                    placeholder="https://example.com/photo1.jpg"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="edit-isActive">Active (visible to users)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Update Apartment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4">
          {apartments.map((apartment) => (
            <Card key={apartment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{apartment.title}</CardTitle>
                    <CardDescription>
                      {apartment.city} - {apartment.address}
                    </CardDescription>
                  </div>
                  <Badge variant={apartment.isActive ? 'default' : 'secondary'}>
                    {apartment.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">{apartment.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="font-semibold">${apartment.pricePerDay}/night</span>
                      <span>{apartment.bedrooms} bedroom{apartment.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(apartment)}
                    >
                      {apartment.isActive ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(apartment)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteApartment(apartment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {apartments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No apartments yet. Create your first one!</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
