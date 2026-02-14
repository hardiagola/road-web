import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Shield, Wrench, Users, MapPin, CheckCircle2, 
  ArrowRight, Star, TrendingUp, Clock, AlertTriangle
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen hero-gradient">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-pattern absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 text-sm">
                🛠️ Smart Road Repair System
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                RoadFix <span className="text-gradient">Buddy</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Report road damage instantly with AI-powered analysis. 
                Connect with professional workers and track repairs in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="flex-1 gap-2 button-glow">
                    <Users className="h-5 w-5" />
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="flex-1 gap-2">
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-card p-8 rounded-2xl">
                <div className="flex items-center justify-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center floating">
                    <Shield className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-primary">500+</div>
                    <div className="text-sm text-muted-foreground">Reports Fixed</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-accent">24h</div>
                    <div className="text-sm text-muted-foreground">Avg Response Time</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-success">98%</div>
                    <div className="text-sm text-muted-foreground">User Satisfaction</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-warning">50+</div>
                    <div className="text-sm text-muted-foreground">Active Workers</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose RoadFix Buddy?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The most comprehensive road damage management system for municipalities and citizens
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Wrench className="h-8 w-8 text-primary" />,
                title: "Smart Repairs",
                description: "AI-powered damage assessment and worker matching for efficient repairs"
              },
              {
                icon: <Clock className="h-8 w-8 text-primary" />,
                title: "Real-time Tracking",
                description: "Monitor repair progress from report to completion with live updates"
              },
              {
                icon: <Users className="h-8 w-8 text-primary" />,
                title: "Professional Network",
                description: "Connect with verified road repair workers in your area"
              },
              {
                icon: <MapPin className="h-8 w-8 text-primary" />,
                title: "Location Intelligence",
                description: "Precise location tracking and municipal boundary mapping"
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-primary" />,
                title: "Analytics Dashboard",
                description: "Comprehensive insights on repair patterns and response metrics"
              },
              {
                icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
                title: "Quality Assurance",
                description: "Photo verification and completion tracking for accountability"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Card className="glass-card card-hover h-full">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 flex items-center justify-center">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/30">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              Simple 4-step process from report to resolution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Report Damage", icon: "📸", description: "Upload photo and location of road damage" },
              { step: 2, title: "AI Analysis", icon: "🤖", description: "Automatic damage assessment and severity rating" },
              { step: 3, title: "Worker Assignment", icon: "👥", description: "Professional worker assigned to repairs" },
              { step: 4, title: "Real-time Updates", icon: "📊", description: "Track progress from start to completion" }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="glass-card p-6 text-center h-full">
                  <div className="text-4xl mb-3">{step.icon}</div>
                  <div className="text-sm font-semibold text-foreground mb-2">Step {step.step}</div>
                  <div className="text-sm text-muted-foreground">{step.title}</div>
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-12 rounded-2xl"
          >
            <Badge className="mb-6 bg-accent/20 text-accent border-accent/30">
              🚀 Ready to get started?
            </Badge>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Join the Road Repair Revolution
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Whether you're a citizen reporting road damage or a professional repair worker,
              RoadFix Buddy makes road maintenance simple and efficient.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="gap-2 button-glow">
                  <Users className="h-5 w-5" />
                  Create Account
                </Button>
              </Link>
              <Link to="/municipal/signup">
                <Button variant="outline" size="lg" className="gap-2">
                  <Shield className="h-5 w-5" />
                  Municipal Portal
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/60 backdrop-blur-2xl border-t border-border/40 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 RoadFix Buddy. All rights reserved.</p>
            <p className="mt-2">📍 Making roads safer, one report at a time</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
