import { Phone, Mail, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import heroImg from "@/assets/hero-construction.jpg";

const HeroSection = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", email: "", description: "" });
  const [useProfile, setUseProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && profile && useProfile) {
      setForm((f) => ({
        ...f,
        name: profile.display_name || "",
        email: user.email || "",
      }));
    }
  }, [user, profile, useProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        description: form.description.trim(),
        user_id: user?.id || null,
      });
      if (error) throw error;
      toast({
        title: "Request Submitted!",
        description: "We'll get back to you within 24 hours.",
      });
      setForm({ name: useProfile && profile ? profile.display_name : "", phone: "", email: useProfile && user ? user.email || "" : "", description: "" });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please call us at (505) 980-1923 or try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProfileLocked = user && useProfile;

  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImg})` }} />
      <div className="absolute inset-0" style={{ background: "var(--hero-overlay)" }} />

      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Copy */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-secondary text-sm font-medium">Licensed NM Contractor #385205</span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              Albuquerque's Trusted Construction Experts —{" "}
              <span className="text-gradient-gold">25+ Years Strong</span>
            </h1>

            <p className="text-primary-foreground/80 text-lg md:text-xl mb-8 max-w-xl leading-relaxed">
              Quality construction. On time. Every time. From home additions to roofing, On Time Construction delivers professional results Albuquerque homeowners trust.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a href="tel:5059801923" className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-heading font-bold px-8 py-4 rounded-md hover:brightness-110 transition-all shadow-cta text-lg">
                <Phone className="w-5 h-5" />
                Call (505) 980-1923
              </a>
              <a href="/#contact-form" className="flex items-center justify-center gap-2 border-2 border-primary-foreground/30 text-primary-foreground font-heading font-semibold px-8 py-4 rounded-md hover:border-secondary hover:text-secondary transition-all text-lg">
                Get Free Estimate
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            <div className="flex items-center gap-6 text-primary-foreground/60 text-sm">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> Free consultations</span>
              <span>•</span>
              <span>Family-owned since 2000</span>
            </div>
          </div>

          {/* Right - Form */}
          <div id="contact-form" className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="bg-card rounded-xl p-6 md:p-8 shadow-card-hover">
              <h2 className="font-heading text-2xl font-bold text-card-foreground mb-2">Get Your Free Estimate</h2>
              <p className="text-muted-foreground mb-6">Tell us about your project. We respond within 24 hours.</p>

              {user && (
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox id="use-profile" checked={useProfile} onCheckedChange={(c) => setUseProfile(!!c)} />
                  <label htmlFor="use-profile" className="text-sm text-muted-foreground cursor-pointer">Use my profile info</label>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-1">Full Name</label>
                  <input id="name" type="text" required maxLength={100} value={form.name} readOnly={!!isProfileLocked}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-md border border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all ${isProfileLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                    placeholder="Johnny Homeowner" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-card-foreground mb-1">Phone Number</label>
                  <input id="phone" type="tel" required maxLength={20} value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all"
                    placeholder="(505) 555-1234" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-1">Email Address</label>
                  <input id="email" type="email" required maxLength={255} value={form.email} readOnly={!!isProfileLocked}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-md border border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all ${isProfileLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                    placeholder="you@email.com" />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-card-foreground mb-1">Project Description</label>
                  <textarea id="description" required maxLength={1000} rows={3} value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all resize-none"
                    placeholder="Describe your project — additions, roofing, remodel, etc." />
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-secondary text-secondary-foreground font-heading font-bold py-4 rounded-md hover:brightness-110 transition-all shadow-cta text-lg disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : "Request Free Consultation"}
                </button>
                <p className="text-center text-muted-foreground text-xs">No obligation. 100% free estimate.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
