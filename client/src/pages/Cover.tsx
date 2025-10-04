import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  DollarSign, 
  Shield, 
  Zap,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section-dark";

export const Cover = () => {
  const features = [
    { icon: <DollarSign className="w-6 h-6" />, title: "Multi-Currency Support", description: "Handle expenses in any currency with automatic conversion" },
    { icon: <Shield className="w-6 h-6" />, title: "Secure & Compliant", description: "Bank-level security with complete audit trails" },
    { icon: <Zap className="w-6 h-6" />, title: "Lightning Fast", description: "Submit and approve expenses in seconds, not days" },
    { icon: <BarChart3 className="w-6 h-6" />, title: "Smart Analytics", description: "Real-time insights into company spending patterns" },
    { icon: <Users className="w-6 h-6" />, title: "Team Collaboration", description: "Multi-level approval workflows for teams of any size" },
    { icon: <FileText className="w-6 h-6" />, title: "Receipt Management", description: "Upload and manage receipts with ease" }
  ];

  const stats = [
    { label: "Expenses Processed", value: "10K+", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Active Users", value: "500+", icon: <Users className="w-5 h-5" /> },
    { label: "Time Saved", value: "80%", icon: <Zap className="w-5 h-5" /> },
    { label: "Currencies Supported", value: "150+", icon: <DollarSign className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">ExpenseManager</h1>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
            <Link href="/login"><Button variant="ghost" className="text-gray-700 dark:text-gray-300">Login</Button></Link>
            <Link href="/signup">
              <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white dark:bg-black text-xs font-medium backdrop-blur-3xl">
                  <div className="inline-flex rounded-full text-center items-center justify-center bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/30 hover:via-purple-400/40 hover:to-transparent dark:hover:from-zinc-300/10 dark:hover:via-purple-400/30 transition-all py-2 px-6">Get Started</div>
                </div>
              </span>
            </Link>
          </motion.div>
        </div>
      </nav>

      <HeroSection
        title="Modern Expense Management"
        subtitle={{ regular: "Streamline expenses with ", gradient: "intelligent automation" }}
        description="Transform your expense workflow with multi-level approvals, real-time insights, and seamless integration. Built for modern teams who value efficiency."
        ctaText="Start Free Trial"
        ctaHref="/signup"
        gridOptions={{ angle: 65, opacity: 0.5, cellSize: 50, lightLineColor: "#9333ea", darkLineColor: "#7e22ce" }}
        bottomImage={undefined}
      />

      <section className="relative bg-white dark:bg-black py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center p-6 rounded-2xl bg-gradient-to-tr from-zinc-300/10 via-purple-400/10 to-transparent dark:from-zinc-300/5 dark:via-purple-400/5 border border-gray-200 dark:border-gray-800 hover:border-purple-400/50 transition-all">
                <div className="flex justify-center mb-3 text-purple-600 dark:text-purple-400">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1 bg-clip-text text-transparent bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative bg-gray-50 dark:bg-gray-950 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl tracking-tighter font-bold mb-4 bg-clip-text text-transparent bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">Everything You Need</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">Powerful features designed for modern expense management</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="group p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-purple-400/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600/20 to-pink-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                <ChevronRight className="w-5 h-5 mt-4 text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-white dark:bg-black py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center p-16 rounded-3xl bg-gradient-to-tr from-purple-600/10 to-pink-500/10 dark:from-purple-600/20 dark:to-pink-500/20 border border-purple-400/20">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-tr from-zinc-300/20 via-purple-400/20 to-transparent dark:from-zinc-300/5 dark:via-purple-400/10 border border-purple-400/20">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">No credit card required</span>
            </div>
            <h2 className="text-4xl md:text-5xl tracking-tighter font-bold mb-6 bg-clip-text text-transparent bg-[linear-gradient(180deg,_#000_0%,_rgba(0,_0,_0,_0.75)_100%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]">Ready to Transform Your Expense Management?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">Join hundreds of companies already saving time and money with our platform.</p>
            <Link href="/signup">
              <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white dark:bg-black text-xs font-medium backdrop-blur-3xl">
                  <div className="inline-flex rounded-full text-center items-center justify-center bg-gradient-to-tr from-zinc-300/20 via-purple-400/30 to-transparent dark:from-zinc-300/5 dark:via-purple-400/20 text-gray-900 dark:text-white border-input border-[1px] hover:bg-gradient-to-tr hover:from-zinc-300/30 hover:via-purple-400/40 hover:to-transparent dark:hover:from-zinc-300/10 dark:hover:via-purple-400/30 transition-all py-4 px-12">Get Started for Free<ArrowRight className="ml-2 w-5 h-5" /></div>
                </div>
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="relative border-t border-gray-200 dark:border-gray-800 py-12 px-6 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 ExpenseManager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
