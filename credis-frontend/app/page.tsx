import Link from "next/link";
import { CreditCard, Users, Bell, Shield, TrendingUp, CheckCircle, Sparkles, ArrowRight, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative border-b border-gray-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Credis
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 relative group">
                <span className="relative z-10">Features</span>
                <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 relative group">
                <span className="relative z-10">How It Works</span>
                <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 relative group">
                <span className="relative z-10">About</span>
                <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </Link>
            </nav>
            <div className="flex space-x-4">
              <Link 
                href="/auth/login" 
                className="px-6 py-3 text-gray-700 hover:text-blue-600 font-semibold transition-all duration-300 hover:scale-105 border border-gray-300 rounded-xl hover:border-blue-400"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  Get Started
                  <Sparkles className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center relative">
              {/* Floating Elements */}
              <div className="absolute -top-20 left-10 opacity-30 animate-float">
                <Star className="h-8 w-8 text-blue-500" />
              </div>
              <div className="absolute top-10 right-20 opacity-40 animate-float-delayed">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <div className="absolute -top-5 right-1/4 opacity-35 animate-bounce-slow">
                <CreditCard className="h-10 w-10 text-blue-600" />
              </div>

              <div className="inline-flex items-center px-6 py-3 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium shadow-sm">
                <Sparkles className="h-4 w-4 mr-2 animate-pulse text-blue-600" />
                Trusted by 500+ Bhutanese Shop Owners
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-700 to-gray-800 bg-clip-text text-transparent">
                  Digital Credit
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Management
                </span>
                <br />
                <span className="text-gray-700 text-3xl md:text-4xl lg:text-5xl block mt-4">
                  for Bhutanese Shops
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                Transform your manual credit tracking into a{" "}
                <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-semibold">
                  beautiful, efficient
                </span>{" "}
                automated system. Never miss a payment again.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Link 
                  href="/auth/register" 
                  className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  <span className="relative flex items-center gap-3">
                    Start Free Trial
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>

                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white shadow-sm"></div>
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  <span className="text-sm">Join 500+ happy shop owners</span>
                </div>
              </div>

              {/* Hero Visual Element */}
              <div className="relative max-w-5xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 blur-3xl rounded-full"></div>
                <div className="relative bg-white rounded-3xl border border-gray-200 p-12 shadow-xl">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">500+</div>
                      <div className="text-gray-600 text-sm">Active Shops</div>
                    </div>
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <CreditCard className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">₹50L+</div>
                      <div className="text-gray-600 text-sm">Credits Managed</div>
                    </div>
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <TrendingUp className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">95%</div>
                      <div className="text-gray-600 text-sm">Faster Processing</div>
                    </div>
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">100%</div>
                      <div className="text-gray-600 text-sm">Secure</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 relative bg-gray-50">
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-6 py-3 mb-6 bg-white border border-blue-200 rounded-full shadow-sm">
                <Sparkles className="h-5 w-5 mr-2 text-blue-600 animate-pulse" />
                <span className="text-blue-700 font-medium">Powerful Features</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Everything You Need
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  to Manage Credits
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Comprehensive tools designed specifically for Bhutanese shop owners with modern, intuitive interfaces
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="group relative bg-white rounded-3xl border border-gray-200 p-8 hover:border-blue-300 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">Borrower Management</h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    Easily add, update, and manage borrower information with comprehensive profiles and credit history tracking.
                  </p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="group relative bg-white rounded-3xl border border-gray-200 p-8 hover:border-purple-300 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">Transaction Tracking</h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    Record credit entries, track repayments, and monitor outstanding balances in real-time with beautiful dashboards.
                  </p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="group relative bg-white rounded-3xl border border-gray-200 p-8 hover:border-orange-300 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Bell className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-700 transition-colors">SMS Reminders</h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    Automated monthly payment reminders sent directly to borrowers' mobile phones with smart scheduling.
                  </p>
                </div>
              </div>

              {/* Feature Card 4 */}
              <div className="group relative bg-white rounded-3xl border border-gray-200 p-8 hover:border-green-300 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors">Financial Insights</h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    Get real-time insights into total outstanding credits and borrower payment patterns with advanced analytics.
                  </p>
                </div>
              </div>

              {/* Feature Card 5 */}
              <div className="group relative bg-white rounded-3xl border border-gray-200 p-8 hover:border-red-300 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-pink-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-red-700 transition-colors">Secure & Reliable</h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    Bank-grade security with encrypted data storage and secure user authentication protecting your business data.
                  </p>
                </div>
              </div>

              {/* Feature Card 6 */}
              <div className="group relative bg-white rounded-3xl border border-gray-200 p-8 hover:border-teal-300 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-teal-700 transition-colors">Easy to Use</h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    Intuitive interface designed for shop owners with minimal technical knowledge and beautiful user experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-32 px-4 sm:px-6 lg:px-8 relative bg-white">
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-6 py-3 mb-6 bg-blue-50 border border-blue-200 rounded-full shadow-sm">
                <Star className="h-5 w-5 mr-2 text-blue-600 animate-spin-slow" />
                <span className="text-blue-700 font-medium">Simple Process</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  How Credis
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Works
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Transform your credit management in just three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 opacity-40"></div>
              
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">Create Account</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors max-w-sm mx-auto">
                  Sign up with your shop details and start your free trial immediately with our beautiful onboarding process.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center animate-pulse">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">Add Borrowers</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors max-w-sm mx-auto">
                  Input your existing customers' information and import their credit history with our smart import tools.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-ping">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors">Manage Credits</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors max-w-sm mx-auto">
                  Track transactions, monitor payments, and let our intelligent automation handle reminders for you.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <Link 
                href="/auth/register" 
                className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
              >
                <span>Get Started Now</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32 px-4 sm:px-6 lg:px-8 relative bg-gray-50">
          <div className="max-w-7xl mx-auto relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center px-6 py-3 mb-6 bg-white border border-orange-200 rounded-full shadow-sm">
                  <Star className="h-5 w-5 mr-2 text-orange-500" />
                  <span className="text-orange-700 font-medium">Made for Bhutan</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Built for
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Bhutanese Shop Owners
                  </span>
                </h2>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  We understand the challenges of managing customer credits manually. Lost records, 
                  missed payments, and time-consuming bookkeeping are holding your business back.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 group">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors text-lg">End manual record-keeping errors forever</span>
                  </div>
                  <div className="flex items-start space-x-4 group">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors text-lg">Reduce payment defaults with smart reminders</span>
                  </div>
                  <div className="flex items-start space-x-4 group">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors text-lg">Get real-time insights into your credit portfolio</span>
                  </div>
                  <div className="flex items-start space-x-4 group">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors text-lg">Bank-grade security for your business data</span>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 blur-3xl rounded-3xl"></div>
                <div className="relative bg-white rounded-3xl border border-gray-200 p-10 shadow-xl">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4 animate-bounce-slow shadow-lg">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Ready to Get Started?</h3>
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                      Join hundreds of Bhutanese shop owners who have already transformed their credit management process with beautiful, modern tools.
                    </p>
                  </div>
                  
                  <Link 
                    href="/auth/register" 
                    className="group w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
                  >
                    <span>Start Your Free Trial</span>
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 text-sm">
                    <Shield className="h-4 w-4" />
                    <span>No credit card required • 30-day free trial</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="max-w-5xl mx-auto text-center relative">
            <div className="inline-flex items-center px-6 py-3 mb-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-400 animate-pulse" />
              <span className="text-white/90 font-medium">Limited Time Offer</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Credit Management
              </span>
              <br />
              <span className="text-white text-2xl md:text-3xl block mt-4">Today</span>
            </h2>
            
            <p className="text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Stop losing money to missed payments and manual errors. 
              Start your digital transformation with{" "}
              <span className="text-yellow-300 font-semibold">
                Credis
              </span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                href="/auth/register" 
                className="group relative px-12 py-6 bg-white text-blue-900 rounded-2xl font-bold text-2xl transition-all duration-300 shadow-2xl hover:shadow-white/25 transform hover:-translate-y-2 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                <span className="relative group-hover:text-white flex items-center gap-3">
                  Get Started - It's Free
                  <ArrowRight className="h-7 w-7 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-12 text-white/70">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>30-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-300" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-300" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                  <div className="relative bg-white rounded-xl p-3 shadow-sm">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
                  Credis
                </span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed max-w-md mb-6">
                The most beautiful and powerful digital credit management solution designed specifically for Bhutanese shop owners.
              </p>
              <div className="flex space-x-4">
                <Link 
                  href="/auth/register" 
                  className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1"
                >
                  <span className="flex items-center gap-2">
                    Get Started
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-xl mb-6 text-white">Product</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 flex items-center group">
                    <span>Features</span>
                    <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 flex items-center group">
                    <span>How it Works</span>
                    <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 flex items-center group">
                    <span>Pricing</span>
                    <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-bold text-xl mb-6 text-white">Support</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 flex items-center group">
                    <span>Help Center</span>
                    <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 flex items-center group">
                    <span>Contact Us</span>
                    <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 flex items-center group">
                    <span>Documentation</span>
                    <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-700 pt-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6 md:mb-0">
                <p className="text-gray-400">
                  &copy; 2024 Credis. All rights reserved.
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400">
                <span>Made with</span>
                <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></div>
                <span>for Bhutanese businesses</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
