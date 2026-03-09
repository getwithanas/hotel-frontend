import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LoginRequest } from '@/types';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { ROLE_DEFAULT_ROUTE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Hotel, Eye, EyeOff, ArrowRight, Utensils, BarChart3, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import hotelIllustration from '@/assets/hotel-illustration.png';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const features = [
  { icon: ClipboardList, label: 'Live Orders' },
  { icon: Utensils, label: 'Kitchen Display' },
  { icon: BarChart3, label: 'Analytics' },
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login(data as LoginRequest);
      setAuth(response.token, response.user);
      toast.success(`Welcome back, ${response.user.name}!`);
      navigate(ROLE_DEFAULT_ROUTE[response.user.role] || '/dashboard');
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Left panel — illustration showcase */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220_30%_15%)] via-[hsl(220_35%_12%)] to-[hsl(220_40%_6%)]" />

        {/* Subtle radial glow behind illustration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

        {/* Grid dots */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/10">
              <Hotel className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-primary-foreground">HotelPOS</span>
          </motion.div>

          {/* Center — illustration + tagline */}
          <div className="flex flex-col items-center text-center -mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="relative"
            >
              {/* Glow ring */}
              <div className="absolute inset-0 -m-6 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
              <img
                src={hotelIllustration}
                alt="Hotel restaurant operations illustration"
                className="w-[420px] h-auto relative z-10 drop-shadow-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 space-y-3"
            >
              <h2 className="text-3xl font-bold text-primary-foreground tracking-tight leading-tight">
                Your hotel,<br />
                <span className="text-primary-foreground/60">fully in control.</span>
              </h2>
              <p className="text-primary-foreground/40 text-sm max-w-xs mx-auto leading-relaxed">
                Manage orders, tables, kitchen workflows and billing from one unified platform.
              </p>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="flex items-center gap-2 mt-6"
            >
              {features.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-primary-foreground/[0.07] border border-primary-foreground/[0.08] backdrop-blur-sm"
                >
                  <f.icon className="h-3.5 w-3.5 text-primary-foreground/60" />
                  <span className="text-xs font-medium text-primary-foreground/70">{f.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="w-full max-w-[380px] relative z-10"
        >
          {/* Mobile header with illustration */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-primary text-primary-foreground">
                <Hotel className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">HotelPOS</span>
            </div>
            <img
              src={hotelIllustration}
              alt="Hotel restaurant operations"
              className="w-48 h-auto mx-auto mb-4 drop-shadow-lg"
            />
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                  focused === 'email' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Email address
              </Label>
              <div className={`rounded-xl transition-shadow duration-200 ${
                focused === 'email' ? 'ring-2 ring-primary/20 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.15)]' : ''
              }`}>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@hotel.com"
                  className="h-12 rounded-xl bg-muted/40 border-border/50 px-4 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-background transition-all"
                  {...register('email')}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  autoFocus
                />
              </div>
              {errors.email && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                  focused === 'password' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Password
              </Label>
              <div className={`relative rounded-xl transition-shadow duration-200 ${
                focused === 'password' ? 'ring-2 ring-primary/20 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.15)]' : ''
              }`}>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="h-12 rounded-xl bg-muted/40 border-border/50 px-4 pr-11 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-background transition-all"
                  autoComplete="current-password"
                  {...register('password')}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-semibold text-sm gap-2 group"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Need help?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Can't access your account? Reach out to your<br />system administrator for assistance.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
