import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const normalizePhone = (value: string) => value.replace(/\D/g, "");

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const input = identifier.trim();
    const looksLikeEmail = input.includes("@");

    let loginEmail = input;

    if (!looksLikeEmail) {
      const normalized = normalizePhone(input);
      const { data: mappedEmail, error: lookupError } = await supabase.rpc("get_login_email_by_phone", { _phone: normalized });

      if (lookupError || !mappedEmail) {
        toast({ title: "Login failed", description: "Invalid credentials.", variant: "destructive" });
        setLoading(false);
        return;
      }

      loginEmail = mappedEmail;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl p-8 shadow-card-hover">
          <h1 className="font-heading text-2xl font-bold text-card-foreground mb-1">Welcome Back</h1>
          <p className="text-muted-foreground mb-6 text-sm">Sign in with email or phone number</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="identifier">Email or Phone</Label>
              <Input id="identifier" type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@email.com or (505) 555-1234" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link to="/signup" className="text-secondary font-medium hover:underline">Sign up</Link>
          </p>
          <p className="text-center mt-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to site</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
