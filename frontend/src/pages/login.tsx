import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Mail, Phone, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const otpSchema = z.object({
  code: z.string().length(6, "OTP must be 6 digits"),
});

type LoginData = z.infer<typeof loginSchema>;
type OtpData = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"login" | "otp">("login");
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const otpForm = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await apiRequest("POST", "/api/login", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      setTempUserId(data.tempUserId);
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: OtpData) => {
      const res = await apiRequest("POST", "/api/verify-otp", { ...data, tempUserId });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.setQueryData(["/api/auth/user"], data.user);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      if (data.user.role === "admin" || data.user.role === "super_admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onOtpSubmit = (data: OtpData) => {
    verifyOtpMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg border border-accent/20">
              <span className="text-accent font-serif font-bold text-2xl">G</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif font-bold text-2xl leading-tight">Godman</span>
              <span className="text-xs text-accent tracking-[0.2em] uppercase font-medium">Capital</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Secure Access</h1>
          <p className="text-muted-foreground mt-2">Enter your credentials to continue</p>
        </div>

        <Card className="border-accent/10 shadow-2xl backdrop-blur-sm bg-card/80">
          <CardHeader>
            <CardTitle className="text-xl">
              {step === "login" ? "Welcome Back" : "Verify Identity"}
            </CardTitle>
            <CardDescription>
              {step === "login"
                ? "Access your Godman Capital account"
                : "A 6-digit code has been sent to your registered contact"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {step === "login" ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        className="pl-10"
                        {...loginForm.register("email")}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        {...loginForm.register("password")}
                      />
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full group"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Sign In <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="code">One-Time Password</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="code"
                        placeholder="000000"
                        className="pl-10 tracking-[0.5em] text-center font-bold"
                        maxLength={6}
                        {...otpForm.register("code")}
                      />
                    </div>
                    {otpForm.formState.errors.code && (
                      <p className="text-xs text-destructive">{otpForm.formState.errors.code.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={verifyOtpMutation.isPending}
                  >
                    {verifyOtpMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Verify & Continue"
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => setStep("login")}
                    type="button"
                  >
                    Back to login
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 px-8">
          By logging in, you agree to our Terms of Service and Privacy Policy.
          Contact support if you face issues with access.
        </p>
      </motion.div>
    </div>
  );
}
