"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Truck, Shield, RotateCcw, ShoppingBag, ChevronLeft, Minus, Plus, Check, Zap, Eye, Users, Volume2, Battery, Wifi, Headphones, Package, CreditCard } from "lucide-react";

export default function UltraProductPage() {
  // Product State
  const [selectedVariant, setSelectedVariant] = useState({ 
    color: 'midnight', 
    size: 'm', 
    price: 349.99 
  });
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [showAddedAnimation, setShowAddedAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 23, seconds: 41 });

  // Real product data with specifications
  const product = {
    id: "PRO-2024-001",
    sku: "AERO-PRO-BLK-M",
    name: "AeroLite Pro Wireless Headphones",
    brand: "SoundMaster",
    category: "Premium Audio | Noise Cancelling",
    rating: 4.7,
    reviewCount: 1247,
    price: 349.99,
    originalPrice: 429.99,
    discount: 19,
    description: "Experience studio-quality audio with our flagship wireless headphones. Featuring QuantumSilence™ active noise cancellation, 40mm graphene drivers, and all-day comfort.",
    features: [
      { icon: <Volume2 />, text: "QuantumSilence™ Active Noise Cancellation" },
      { icon: <Battery />, text: "40-hour battery with 15-min quick charge" },
      { icon: <Wifi />, text: "Bluetooth 5.3 with multipoint connection" },
      { icon: <Headphones />, text: "Memory-protein ear cushions" },
      { icon: <Package />, text: "Foldable design with premium carrying case" }
    ],
    specifications: {
      "Driver Size": "40mm Graphene",
      "Frequency Response": "20Hz - 40kHz",
      "Battery Life": "40 hours (ANC on)",
      "Charging Time": "2.5 hours (USB-C)",
      "Weight": "265g",
      "Warranty": "2 years"
    },
    colors: [
      { 
        id: 'midnight', 
        name: 'Midnight Black', 
        hex: '#111827',
        stock: 12,
        price: 349.99,
        images: ['/products/headphones/black-1.jpg', '/products/headphones/black-2.jpg']
      },
      { 
        id: 'mist', 
        name: 'Urban Mist', 
        hex: '#D1D5DB',
        stock: 5,
        price: 349.99,
        images: ['/products/headphones/silver-1.jpg', '/products/headphones/silver-2.jpg']
      },
      { 
        id: 'sage', 
        name: 'Forest Sage', 
        hex: '#065F46',
        stock: 8,
        price: 359.99,
        images: ['/products/headphones/green-1.jpg', '/products/headphones/green-2.jpg']
      },
      { 
        id: 'ocean', 
        name: 'Deep Ocean', 
        hex: '#1E40AF',
        stock: 3,
        price: 359.99,
        images: ['/products/headphones/blue-1.jpg', '/products/headphones/blue-2.jpg']
      }
    ],
    sizes: [
      { id: 's', name: 'Small', description: 'Petite head size', stock: 2 },
      { id: 'm', name: 'Medium', description: 'Average head size', stock: 15 },
      { id: 'l', name: 'Large', description: 'Larger head size', stock: 9 },
      { id: 'xl', name: 'X-Large', description: 'Extra large head size', stock: 4 }
    ],
    images: [
      '/products/headphones/main-1.jpg',
      '/products/headphones/angle-1.jpg',
      '/products/headphones/case.jpg',
      '/products/headphones/closeup.jpg'
    ],
    reviews: [
      { name: "Alex Johnson", rating: 5, verified: true, date: "2 days ago", comment: "Best headphones I've ever owned. The noise cancellation is magical on flights!", helpful: 42 },
      { name: "Sam Wilson", rating: 4, verified: true, date: "1 week ago", comment: "Great battery life and super comfortable. Worth every penny.", helpful: 18 },
      { name: "Taylor Reed", rating: 5, verified: false, date: "3 weeks ago", comment: "The sound quality blew me away. They look premium too.", helpful: 7 }
    ]
  };

  // Live metrics
  const [viewersCount, setViewersCount] = useState(18);
  const [recentPurchases, setRecentPurchases] = useState(42);
  const cartAnimationRef = useRef<HTMLButtonElement>(null);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate live viewer updates
  useEffect(() => {
    const interval = setInterval(() => {
      setViewersCount(prev => prev + Math.floor(Math.random() * 3) - 1);
      setRecentPurchases(prev => prev + Math.floor(Math.random() * 2));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = () => {
    setInCart(true);
    setShowAddedAnimation(true);
    
    // Cart animation
    if (cartAnimationRef.current) {
      cartAnimationRef.current.classList.add('animate-ping');
      setTimeout(() => {
        if (cartAnimationRef.current) {
          cartAnimationRef.current.classList.remove('animate-ping');
        }
      }, 600);
    }
    
    setTimeout(() => setInCart(false), 2000);
    setTimeout(() => setShowAddedAnimation(false), 2500);
  };

  const handleColorSelect = (colorId: string) => {
    const selectedColor = product.colors.find(c => c.id === colorId);
    if (!selectedColor) return;
    setSelectedVariant({ 
      ...selectedVariant, 
      color: colorId,
      price: selectedColor.price
    });
    // Change main image to first image of selected color
    if (selectedColor.images?.[0]) {
      // In reality, you'd set the activeImage to match color images
    }
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const imageTransition = {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.3 }
  };

  const priceFormatted = (selectedVariant.price * quantity).toFixed(2);
  const savings = (product.originalPrice - selectedVariant.price) * quantity;

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Sticky Header with Cart */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.button 
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-gray-600 hover:text-black group"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-sm font-medium">Back to Shop</span>
          </motion.button>
          
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLiked(!isLiked)}
              className="relative"
            >
              <Heart className={`h-5 w-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
              ref={cartAnimationRef}
            >
              <ShoppingBag className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">3</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Product Grid */}
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Column: Visuals */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Main Image Container */}
            <div className="relative aspect-square rounded-3xl bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  {...imageTransition}
                  src={product.images[activeImage]}
                  alt={`${product.name} - View ${activeImage + 1}`}
                  className="w-full h-full object-contain p-12"
                />
              </AnimatePresence>
              
              {/* Badges */}
              <div className="absolute top-5 left-5 flex gap-2">
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full"
                >
                  -{product.discount}%
                </motion.span>
                <span className="bg-black text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  Best Seller
                </span>
              </div>

              {/* Wishlist Button */}
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsLiked(!isLiked)}
                className={`absolute top-5 right-5 p-3 rounded-full shadow-lg transition-all ${
                  isLiked ? 'bg-red-50 text-red-500' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>

              {/* 360 View Button */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="absolute bottom-5 right-5 bg-black text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                360° View
              </motion.button>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-4 overflow-x-auto pb-4 px-2">
              {product.images.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ y: -4 }}
                  onClick={() => setActiveImage(idx)}
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx 
                      ? 'border-black ring-2 ring-black/10' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {activeImage === idx && (
                    <div className="absolute inset-0 border-2 border-black rounded-xl" />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Live Activity Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-8 h-8 rounded-full border-2 border-white bg-linear-to-r from-blue-400 to-purple-500"
                      />
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                      <Users className="h-4 w-4" /> {viewersCount} people viewing now
                    </p>
                    <p className="text-xs text-gray-600">{recentPurchases} purchased recently</p>
                  </div>
                </div>
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
            </motion.div>

            {/* Limited Time Offer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-linear-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-red-700">🔥 Limited Time Offer</span>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Ends Soon</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Free Premium Case + Extra 10% off</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-gray-900">
                    {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <p className="text-xs text-gray-500">Time Left</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Product Info */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {/* Brand & Title */}
            <motion.div variants={fadeInUp} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {product.category}
                </span>
                <span className="text-xs text-gray-400">SKU: {product.sku}</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-gray-500">({product.reviewCount.toLocaleString()} reviews)</span>
                </div>
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> In Stock
                </span>
              </div>
            </motion.div>

            {/* Pricing */}
            <motion.div variants={fadeInUp} className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  ${selectedVariant.price.toFixed(2)}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">
                  Save ${savings.toFixed(2)}
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                or 4 interest-free payments of <strong className="text-gray-900">${(selectedVariant.price / 4).toFixed(2)}</strong> with <CreditCard className="inline h-3 w-3" />
              </p>
            </motion.div>

            {/* Description */}
            <motion.div variants={fadeInUp} className="prose prose-gray max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed">
                {product.description}
              </p>
              <div className="mt-6 space-y-4">
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      {feature.icon}
                    </div>
                    <span className="text-gray-800">{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Color Selection */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">
                  Color: <span className="font-normal capitalize ml-1">
                    {product.colors.find(c => c.id === selectedVariant.color)?.name}
                  </span>
                </h3>
                <span className="text-sm text-gray-500">
                  Stock: {product.colors.find(c => c.id === selectedVariant.color)?.stock} left
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.colors.map((color) => (
                  <motion.button
                    key={color.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleColorSelect(color.id)}
                    className={`relative p-3 rounded-xl border-2 transition-all ${
                      selectedVariant.color === color.id
                        ? 'border-black ring-2 ring-black/10'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div 
                      className="w-full aspect-square rounded-lg mb-2"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="block text-xs font-medium text-center">{color.name}</span>
                    {selectedVariant.color === color.id && (
                      <Check className="absolute top-2 right-2 h-4 w-4 text-white bg-black rounded-full p-0.5" />
                    )}
                    {color.stock < 5 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">
                        Low
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Size Selection */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Size</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Size Guide →
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.sizes.map((size) => (
                  <motion.button
                    key={size.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedVariant({ ...selectedVariant, size: size.id })}
                    disabled={size.stock === 0}
                    className={`py-4 rounded-xl text-center transition-all relative ${
                      selectedVariant.size === size.id
                        ? 'bg-black text-white'
                        : size.stock === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    <span className="font-bold block">{size.name}</span>
                    <span className="text-xs opacity-75 block mt-1">{size.description}</span>
                    {size.stock < 5 && size.stock > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-1 rounded">
                        {size.stock} left
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Quantity & Actions */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="flex items-center gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border-2 border-gray-200 rounded-2xl">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-5 py-4 hover:bg-gray-50 rounded-l-2xl transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </motion.button>
                  <span className="px-6 py-4 text-lg font-bold min-w-12 text-center">
                    {quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-5 py-4 hover:bg-gray-50 rounded-r-2xl transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Add to Cart Button with Animation */}
                <div className="flex-1 relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                      inCart
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-black hover:bg-gray-800'
                    } text-white flex items-center justify-center gap-3 shadow-lg`}
                  >
                    <AnimatePresence mode="wait">
                      {inCart ? (
                        <motion.span
                          key="added"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.2 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-5 w-5" /> Added to Cart!
                        </motion.span>
                      ) : (
                        <motion.span
                          key="add"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingBag className="h-5 w-5" /> Add to Cart — ${priceFormatted}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  
                  {/* Floating Animation */}
                  {showAddedAnimation && (
                    <motion.div
                      initial={{ opacity: 0, y: 0, x: 0 }}
                      animate={{ opacity: [1, 0], y: -100, x: 100 }}
                      transition={{ duration: 1 }}
                      className="absolute top-0 left-0 pointer-events-none"
                    >
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        +{quantity} Added!
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Buy Now Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full border-2 border-gray-900 py-4 rounded-2xl font-bold text-lg hover:bg-gray-900 hover:text-white transition-colors"
              >
                Buy Now — ${priceFormatted}
              </motion.button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200"
            >
              {[
                { icon: <Truck className="h-5 w-5" />, title: "Free Shipping", desc: "2-3 business days" },
                { icon: <Shield className="h-5 w-5" />, title: "2-Year Warranty", desc: "Full coverage" },
                { icon: <RotateCcw className="h-5 w-5" />, title: "30-Day Returns", desc: "No questions asked" },
              ].map((item, idx) => (
                <div key={idx} className="text-center p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="inline-flex p-2 bg-gray-100 rounded-lg mb-2">
                    {item.icon}
                  </div>
                  <p className="font-bold text-sm text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </motion.div>

            {/* Product Tabs */}
            <motion.div variants={fadeInUp} className="border-t border-gray-200 pt-6">
              <div className="flex border-b border-gray-200 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'specs', label: 'Specifications' },
                  { id: 'reviews', label: `Reviews (${product.reviewCount})` },
                  { id: 'faq', label: 'FAQ' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Tab Content */}
              <div className="py-6">
                {activeTab === 'specs' && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-500">{key}</span>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg">Product Details</h4>
                    <p className="text-gray-600">
                      The AeroLite Pro combines cutting-edge audio technology with premium materials for an unparalleled listening experience. Perfect for travelers, professionals, and audiophiles.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h5 className="font-bold text-sm mb-2">What's in the Box</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• AeroLite Pro Headphones</li>
                          <li>• Premium Travel Case</li>
                          <li>• USB-C Charging Cable</li>
                          <li>• 3.5mm Audio Cable</li>
                          <li>• Quick Start Guide</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <h5 className="font-bold text-sm mb-2">Compatibility</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• iOS & Android Devices</li>
                          <li>• Windows & macOS</li>
                          <li>• Gaming Consoles</li>
                          <li>• In-flight Entertainment</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}


