import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

const normalizePhone = (value: string) => value.replace(/\D/g, "");

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setPhone(profile.phone || "");
    }
    if (user) setNewEmail(user.email || "");
  }, [profile, user]);

  const updateProfile = async () => {
    if (!phone.trim()) {
      toast({ title: "Phone number required", description: "A phone number must be linked to your account.", variant: "destructive" });
      return;
    }

    if (normalizePhone(phone).length < 10) {
      toast({ title: "Invalid phone", description: "Please enter a valid phone number.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const nextPhone = phone.trim();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        phone: nextPhone,
        phone_normalized: normalizePhone(nextPhone),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user!.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
      await refreshProfile();
    }
    setSaving(false);
  };

  const updateEmail = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Confirmation sent", description: "Check your new email to confirm the change." });
    setSaving(false);
  };

  const updatePassword = async () => {
    if (newPassword.length < 6) { toast({ title: "Password too short", variant: "destructive" }); return; }
    if (newPassword !== confirmPassword) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Password updated" }); setNewPassword(""); setConfirmPassword(""); }
    setSaving(false);
  };

  const missingPhone = !phone.trim();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Account Settings</h1>

          {missingPhone && (
            <section className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-destructive font-medium">A phone number is required for your account. Please add one below.</p>
            </section>
          )}

          <section className="bg-card rounded-xl p-6 shadow-card mb-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Profile</h2>
            <div className="space-y-3">
              <div>
                <Label>Display Name</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} placeholder="(505) 555-1234" />
              </div>
              <Button onClick={updateProfile} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}</Button>
            </div>
          </section>

          <section className="bg-card rounded-xl p-6 shadow-card mb-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Email Address</h2>
            <div className="space-y-3">
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <Button onClick={updateEmail} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Email"}</Button>
            </div>
          </section>

          <section className="bg-card rounded-xl p-6 shadow-card">
            <h2 className="font-heading text-lg font-semibold mb-4">Change Password</h2>
            <div className="space-y-3">
              <div><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} /></div>
              <div><Label>Confirm Password</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
              <Button onClick={updatePassword} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Change Password"}</Button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Settings;
