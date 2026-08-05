'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Upload, Link as LinkIcon, Image, Video, X,
  Eye, BarChart3, Package, Tag, Search, LogOut, ChevronDown,
  ExternalLink, TrendingUp, Users, MousePointerClick, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';

// --- Types ---
interface MediaItem {
  url: string;
  type: 'image' | 'video';
  source: 'url' | 'upload' | 'youtube';
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  affiliateLink: string;
  categoryId: string | null;
  featured: boolean;
  clickCount: number;
  uniqueClickCount: number;
  media: { id: string; url: string; type: string; source: string; sortOrder: number }[];
  category?: { name: string; slug: string } | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface ClickStats {
  totals: { totalClicks: number; totalUnique: number; totalProducts: number };
  productStats: { id: string; name: string; clickCount: number; uniqueClickCount: number }[];
  timeSeries: { date: string; total: number; unique: number }[];
  recentLogs: { id: string; createdAt: string; sessionId: string; product: { name: string } }[];
}

// --- Password Gate ---
function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) onAuth();
      else setError(true);
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter the admin password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="mt-1.5"
            />
          </div>
          {error && <p className="text-sm text-destructive">Incorrect password</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Default password: admin123
        </p>
      </motion.div>
    </div>
  );
}

// --- Product Form ---
function ProductForm({
  product,
  categories,
  onSave,
  onCancel,
}: {
  product?: Product;
  categories: Category[];
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [comparePrice, setComparePrice] = useState(product?.comparePrice?.toString() || '');
  const [affiliateLink, setAffiliateLink] = useState(product?.affiliateLink || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || '');
  const [featured, setFeatured] = useState(product?.featured || false);
  const [media, setMedia] = useState<MediaItem[]>(
    product?.media?.map((m) => ({ url: m.url, type: m.type as 'image' | 'video', source: m.source as any })) || []
  );
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleAmazonFetch = async () => {
    if (!amazonUrl) return;
    setFetching(true);
    try {
      const res = await fetch('/api/amazon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: amazonUrl }),
      });
      const data = await res.json();
      if (data.name) setName(data.name);
      if (data.image) {
        setMedia((prev) => [...prev, { url: data.image, type: 'image', source: 'url' }]);
      }
      if (data.price) setPrice(data.price.toString());
      toast.success(data.partial ? 'Partial data fetched — fill in the rest' : 'Product data fetched!');
    } catch { toast.error('Failed to fetch. Enter details manually.'); }
    finally { setFetching(false); }
  };

  const handleFileUpload = async (files: FileList, type: 'image' | 'video') => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    formData.append('type', type);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      const newMedia = data.files.map((f: any) => ({ url: f.url, type, source: 'upload' as const }));
      setMedia((prev) => [...prev, ...newMedia]);
      toast.success(`${data.files.length} ${type}(s) uploaded`);
    } catch { toast.error('Upload failed'); }
  };

  const addUrlMedia = (url: string, type: 'image' | 'video') => {
    if (!url) return;
    const source = type === 'video' && (url.includes('youtube.com') || url.includes('youtu.be')) ? 'youtube' : 'url';
    setMedia((prev) => [...prev, { url, type, source }]);
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name || !price || !affiliateLink) {
      toast.error('Name, price, and affiliate link are required');
      return;
    }
    onSave({
      name, description, price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      affiliateLink, categoryId: categoryId || null, featured, media,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border border-border rounded-2xl p-6 bg-card"
    >
      <h3 className="text-lg font-semibold mb-6">{product ? 'Edit Product' : 'Add New Product'}</h3>

      {/* Amazon Fetch */}
      <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-dashed border-border">
        <Label className="text-sm font-medium flex items-center gap-2">
          <ExternalLink className="w-4 h-4" /> Auto-fetch from Amazon
        </Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={amazonUrl}
            onChange={(e) => setAmazonUrl(e.target.value)}
            placeholder="Paste Amazon product URL..."
            className="flex-1"
          />
          <Button onClick={handleAmazonFetch} variant="outline" disabled={fetching}>
            {fetching ? 'Fetching...' : 'Fetch'}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Product Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="e.g. Wireless Headphones" />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" rows={3} placeholder="Product description..." />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Price ($) *</Label>
          <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label>Compare at Price ($)</Label>
          <Input type="number" step="0.01" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <div className="mb-4">
        <Label>Affiliate Link *</Label>
        <Input value={affiliateLink} onChange={(e) => setAffiliateLink(e.target.value)} className="mt-1.5" placeholder="https://..." />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Switch checked={featured} onCheckedChange={setFeatured} />
        <Label>Featured product</Label>
      </div>

      {/* Media Section */}
      <div className="mb-6">
        <Label className="text-base font-semibold mb-3 block">Images & Videos</Label>

        {/* Current media */}
        {media.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {media.map((m, i) => (
              <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted">
                {m.type === 'image' ? (
                  <img src={m.url} alt='' className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                )}
                <button
                  onClick={() => removeMedia(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <Badge variant="secondary" className="absolute bottom-0.5 left-0.5 text-[9px] px-1 py-0">
                  {m.source}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Add media controls */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && (addUrlMedia(imageUrl, 'image'), setImageUrl(''))}
            />
            <Button variant="outline" size="sm" onClick={() => { addUrlMedia(imageUrl, 'image'); setImageUrl(''); }}>
              <Image className="w-4 h-4 mr-1" /> Add URL
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1" /> Upload
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'image')} />
          </div>
          <div className="flex gap-2">
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="YouTube URL or video URL..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && (addUrlMedia(videoUrl, 'video'), setVideoUrl(''))}
            />
            <Button variant="outline" size="sm" onClick={() => { addUrlMedia(videoUrl, 'video'); setVideoUrl(''); }}>
              <Video className="w-4 h-4 mr-1" /> Add URL
            </Button>
            <Button variant="outline" size="sm" onClick={() => videoInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1" /> Upload
            </Button>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'video')} />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} className="flex-1">
          {product ? 'Update Product' : 'Add Product'}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </motion.div>
  );
}

// --- Analytics Dashboard ---
function AnalyticsDashboard({ stats }: { stats: ClickStats }) {
  const [period, setPeriod] = useState('daily');
  const { totals, productStats, timeSeries, recentLogs } = stats;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Clicks', value: totals.totalClicks, icon: MousePointerClick, color: 'text-primary' },
          { label: 'Unique Clicks', value: totals.totalUnique, icon: Users, color: 'text-chart-2' },
          { label: 'Total Products', value: totals.totalProducts, icon: Package, color: 'text-chart-3' },
          { label: 'Avg Clicks/Product', value: totals.totalProducts ? (totals.totalClicks / totals.totalProducts).toFixed(1) : '0', icon: TrendingUp, color: 'text-chart-4' },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Click Trends</h3>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <RTooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }}
              />
              <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} dot={false} name="Total" />
              <Line type="monotone" dataKey="unique" stroke="var(--chart-2)" strokeWidth={2} dot={false} name="Unique" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="border border-border rounded-xl p-4">
        <h3 className="font-semibold mb-4">Top Products by Clicks</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productStats.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <RTooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }}
              />
              <Bar dataKey="clickCount" fill="var(--primary)" radius={[0, 4, 4, 0]} name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Click Logs */}
      <div className="border border-border rounded-xl p-4">
        <h3 className="font-semibold mb-4">Recent Clicks</h3>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Session</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.slice(0, 50).map((log) => (
                <tr key={log.id} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">{log.product.name}</td>
                  <td className="py-2 pr-4 text-muted-foreground font-mono text-xs">{log.sessionId.slice(0, 12)}...</td>
                  <td className="py-2 text-muted-foreground text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {recentLogs.length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No clicks yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Main Admin Page ---
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [newCatName, setNewCatName] = useState('');
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await fetch('/api/products?limit=200');
      const d = await res.json();
      return d.products as Product[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      return res.json() as Promise<Category[]>;
    },
  });

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/clicks');
      return res.json() as Promise<ClickStats>;
    },
  });

  const saveProduct = useMutation({
    mutationFn: async (data: any) => {
      if (editingProduct) {
        return fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        });
      }
      return fetch('/api/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setShowForm(false); setEditingProduct(undefined);
      toast.success(editingProduct ? 'Product updated' : 'Product added');
    },
    onError: () => toast.error('Failed to save product'),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => fetch(`/api/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
  });

  const addCategory = useMutation({
    mutationFn: async (name: string) => {
      return fetch('/api/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setNewCatName('');
      toast.success('Category added');
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => fetch(`/api/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted');
    },
  });

  const handleLogout = () => setAuthenticated(false);

  if (!authenticated) return <PasswordGate onAuth={() => setAuthenticated(true)} />;

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">DealsHub Admin</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products"><Package className="w-4 h-4 mr-2" /> Products</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-2" /> Analytics</TabsTrigger>
            <TabsTrigger value="categories"><Tag className="w-4 h-4 mr-2" /> Categories</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Products ({products?.length || 0})
              </h2>
              <Button onClick={() => { setEditingProduct(undefined); setShowForm(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>

            <AnimatePresence>
              {showForm && (
                <ProductForm
                  product={editingProduct}
                  categories={categories || []}
                  onSave={(data) => saveProduct.mutate(data)}
                  onCancel={() => { setShowForm(false); setEditingProduct(undefined); }}
                />
              )}
            </AnimatePresence>

            {/* Product List */}
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Product</th>
                      <th className="text-left py-3 px-4 font-medium">Price</th>
                      <th className="text-left py-3 px-4 font-medium">Category</th>
                      <th className="text-center py-3 px-4 font-medium">Clicks</th>
                      <th className="text-center py-3 px-4 font-medium">Featured</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products?.map((p) => (
                      <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {p.media[0]?.type === 'image' && (
                              <img src={p.media[0].url} alt="" className="w-10 h-10 rounded-lg object-cover bg-muted" />
                            )}
                            <div>
                              <p className="font-medium line-clamp-1 max-w-48">{p.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-48">{p.affiliateLink}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">${p.price.toFixed(2)}</span>
                          {p.comparePrice && (
                            <span className="ml-1 text-xs text-muted-foreground line-through">${p.comparePrice.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{p.category?.name || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-medium">{p.clickCount}</span>
                          <span className="text-xs text-muted-foreground"> / {p.uniqueClickCount} unique</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {p.featured && <Badge className="bg-primary/10 text-primary border-0">Featured</Badge>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => { setEditingProduct(p); setShowForm(true); }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteProduct.mutate(p.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!products || products.length === 0) && (
                      <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No products yet. Add your first product!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {stats ? (
              <AnalyticsDashboard stats={stats} />
            ) : (
              <div className="flex items-center justify-center py-20 text-muted-foreground">Loading analytics...</div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="flex items-center gap-3 mb-6">
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New category name..."
                className="max-w-xs"
                onKeyDown={(e) => e.key === 'Enter' && newCatName && addCategory.mutate(newCatName)}
              />
              <Button onClick={() => newCatName && addCategory.mutate(newCatName)} disabled={!newCatName}>
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Slug</th>
                    <th className="text-center py-3 px-4 font-medium">Products</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories?.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="py-3 px-4 font-medium">{c.name}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{c.slug}</td>
                      <td className="py-3 px-4 text-center">{c._count.products}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteCategory.mutate(c.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}