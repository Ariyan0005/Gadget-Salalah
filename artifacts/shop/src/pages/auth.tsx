import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { useLogin, useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage({ isLogin = true }: { isLogin?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  const { login, register } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
        toast({ title: "Welcome back!" });
        setLocation("/");
      } else {
        await register({ name, email, password, phone });
        toast({ title: "Account created successfully" });
        setLocation("/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-md shadow-lg border-primary/10">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isLogin ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription>
              {isLogin ? "Enter your credentials to access your account" : "Enter your details to create your account"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    required 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    data-testid="input-name"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <a href="#" className="text-sm text-primary hover:underline" tabIndex={-1}>
                      Forgot password?
                    </a>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  data-testid="input-password"
                />
              </div>
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input 
                    id="phone" 
                    placeholder="01700000000" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="btn-submit-auth">
                {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                {isLogin ? (
                  <>Don't have an account? <Link href="/register" className="text-primary font-medium hover:underline">Sign up</Link></>
                ) : (
                  <>Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link></>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
