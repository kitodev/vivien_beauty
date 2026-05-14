import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { LogOut, Upload, Trash2, ImagePlus } from "lucide-react";

interface GalleryImage {
  id: string;
  title: string;
  category: string;
  image_url: string;
  image_type: string;
  pair_id: string | null;
  created_at: string;
}

const Admin = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Upload state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("glam");
  const [imageType, setImageType] = useState("after");
  const [file, setFile] = useState<File | null>(null);
  const [pairName, setPairName] = useState("");
  const [uploading, setUploading] = useState(false);

  // Gallery state
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchImages = useCallback(async () => {
    const { data } = await supabase
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setImages(data);
  }, []);

  useEffect(() => {
    if (session) fetchImages();
  }, [session, fetchImages]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    else toast.success("Welcome back, admin!");
    setLoginLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return toast.error("Please fill in all fields");
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(path);

    const { error: dbError } = await supabase.from("gallery_images").insert({
      title,
      category,
      image_type: imageType,
      image_url: publicUrl,
      pair_id: pairName || null,
    });

    if (dbError) toast.error("Failed to save: " + dbError.message);
    else {
      toast.success("Image uploaded!");
      setTitle("");
      setPairName("");
      setFile(null);
      fetchImages();
    }
    setUploading(false);
  };

  const handleDelete = async (img: GalleryImage) => {
    const path = img.image_url.split("/gallery/")[1];
    if (path) await supabase.storage.from("gallery").remove([path]);
    await supabase.from("gallery_images").delete().eq("id", img.id);
    toast.success("Image deleted");
    fetchImages();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-3xl">Admin Login</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">Vivien Beauty Studio</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-6">
          <h1 className="font-display text-2xl font-semibold text-foreground">Admin Panel</h1>
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="container px-6 py-8 max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-xl">
              <ImagePlus className="h-5 w-5 text-primary" /> Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Bridal Glow" required />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bridal">Bridal</SelectItem>
                    <SelectItem value="glam">Glam</SelectItem>
                    <SelectItem value="editorial">Editorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={imageType} onValueChange={setImageType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Before</SelectItem>
                    <SelectItem value="after">After</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Image File</Label>
                <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} required />
              </div>
              <div className="sm:col-span-2">
                <Label>Pair Name (Optional - Use same name for Before/After sets)</Label>
                <Input value={pairName} onChange={e => setPairName(e.target.value)} placeholder="e.g. Wedding-Session-01" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={uploading} className="w-full">
                  <Upload className="mr-2 h-4 w-4" /> {uploading ? "Uploading..." : "Upload Image"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Uploaded Images ({images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {images.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No images uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map(img => (
                  <div key={img.id} className="group relative rounded-lg overflow-hidden border border-border">
                    <img src={img.image_url} alt={img.title} className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-primary-foreground p-2">
                      <p className="text-xs font-medium text-center">{img.title}</p>
                      <p className="text-[10px] opacity-80">{img.category} · {img.image_type}</p>
                      {img.pair_id && <p className="text-[10px] opacity-80">Pair: {img.pair_id}</p>}
                      <Button size="sm" variant="destructive" className="mt-2" onClick={() => handleDelete(img)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
