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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const features = [
  { icon: ClipboardList, title: 'Order Management', desc: 'Track orders in real-time from table to kitchen' },
  { icon: Utensils, title: 'Kitchen Display', desc: 'Live kitchen queue with priority & timing' },
  { icon: BarChart3, title: 'Analytics', desc: 'Revenue reports, trends & staff performance' },
];

const floatingShapes = [
  { size: 320, x: '10%', y: '15%', delay: 0, duration: 18 },
  { size: 200, x: '65%', y: '60%', delay: 2, duration: 22 },
  { size: 140, x: '80%', y: '10%', delay: 4, duration: 15 },
  { size: 260, x: '30%', y: '75%', delay: 1, duration: 20 },
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
    <div className="min-h-screen flex bg-background">
      {/* Left panel — immersive branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-[hsl(220_25%_8%)]" />

        {/* Floating orbs */}
        {floatingShapes.map((shape, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: shape.size,
              height: shape.size,
              left: shape.x,
              top: shape.y,
              background: `radial-gradient(circle, hsl(var(--primary-foreground) / 0.06), transparent 70%)`,
            }}
            animate={{
              y: [0, -30, 0, 20, 0],
              x: [0, 15, -10, 5, 0],
              scale: [1, 1.05, 0.95, 1.02, 1],
            }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col justify-between p-14 text-primary-foreground w-full"
        >
          {/* Top logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/10">
              <Hotel className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">HotelPOS</span>
          </motion.div>

          {/* Center content */}
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 text-xs font-medium tracking-wide uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                System Online
              </div>
              <h2 className="text-5xl font-bold leading-[1.1] tracking-tight">
                Your hotel,
                <br />
                <span className="text-primary-foreground/70">fully in control.</span>
              </h2>
              <p className="text-primary-foreground/50 text-lg leading-relaxed max-w-md">
                One platform to manage every order, every table, and every guest experience — effortlessly.
              </p>
            </motion.div>

            {/* Feature cards */}
            <div className="space-y-3">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-primary-foreground/[0.06] backdrop-blur-sm border border-primary-foreground/[0.06] hover:bg-primary-foreground/[0.1] transition-colors group"
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary-foreground/10 group-hover:bg-primary-foreground/15 transition-colors shrink-0">
                    <feature.icon className="h-5 w-5 text-primary-foreground/80" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{feature.title}</div>
                    <div className="text-xs text-primary-foreground/40">{feature.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex items-center gap-8"
          >
            {[
              { value: '99.9%', label: 'Uptime' },
              { value: '<200ms', label: 'Response' },
              { value: '24/7', label: 'Support' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-[10px] text-primary-foreground/35 uppercase tracking-widest mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="w-full max-w-[380px] relative z-10"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-primary text-primary-foreground">
              <Hotel className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">HotelPOS</span>
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
            {/* Email field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                  focused === 'email' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Email address
              </Label>
              <div className={`relative rounded-xl transition-all duration-200 ${
                focused === 'email' ? 'ring-2 ring-primary/20' : ''
              }`}>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@hotel.com"
                  className="h-12 rounded-xl bg-muted/40 border-border/50 px-4 text-sm focus-visible:ring-primary focus-visible:bg-background transition-all"
                  {...register('email')}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  autoFocus
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive flex items-center gap-1"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
                  focused === 'password' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Password
              </Label>
              <div className={`relative rounded-xl transition-all duration-200 ${
                focused === 'password' ? 'ring-2 ring-primary/20' : ''
              }`}>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="h-12 rounded-xl bg-muted/40 border-border/50 px-4 pr-11 text-sm focus-visible:ring-primary focus-visible:bg-background transition-all"
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
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive flex items-center gap-1"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-semibold text-sm gap-2 group relative overflow-hidden"
              disabled={loading}
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Need help?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Can't access your account? Reach out to your
            <br />
            system administrator for assistance.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
