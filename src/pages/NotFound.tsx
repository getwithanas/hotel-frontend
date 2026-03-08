import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Large 404 */}
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        >
          <span className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter text-primary/10">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Search className="h-8 w-8 text-primary" />
            </div>
          </div>
        </motion.div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          The page <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{location.pathname}</code> doesn't exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Go Back
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            <Home className="h-4 w-4 mr-1.5" /> Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
