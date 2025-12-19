import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isTreeVisible, setIsTreeVisible] = useState(false);
  const treeSectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to trigger tree animation when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsTreeVisible(true);
        }
      },
      { threshold: 0.3 } // Trigger when 30% of the section is visible
    );

    if (treeSectionRef.current) {
      observer.observe(treeSectionRef.current);
    }

    return () => {
      if (treeSectionRef.current) {
        observer.unobserve(treeSectionRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-background-dark font-display overflow-x-hidden text-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-background-dark/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">spa</span>
          <span className="font-bold text-lg tracking-tight">Nature Wellness</span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full text-sm font-bold transition-colors border border-white/10"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <header className="relative h-[85vh] w-full flex items-end pb-12 overflow-hidden">
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat z-0 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
          style={{
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDGJ2EHp_b9TsnrJTCV-qAj3gRsfWcFBcK2LhUvsPOEk6MDZ8r1e36sq06GCmQdVMYzctaJCAFd-v4bSuQsYsPmu_d6NytOSM7G9-3R7YPg5KAd6Wk17ZunBDPlY9bzK6aFMBvTP8-T_ERvhOhD1LzsrO5SPV9qKSvw048exJzTj1PLOv3kc6BYkrKHIunH1YIjYvn0AhgVOwdjovX19uOlJFX8OJ4WUg0xD-W4g0EhqKebAozk1VI2bELxwkgz1NuYULihB6jfr01w")',
            animationDuration: '20s'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent z-10"></div>
        
        <div className="relative z-20 px-6 w-full max-w-4xl mx-auto text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-primary text-xs font-bold uppercase tracking-wider">The marketplace for earth</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Healing for you.<br />
            <span className="text-primary">Healing for the planet.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-lg mb-8 md:ml-0 mx-auto">
            Book immersive wellness retreats and buy organic products. Every purchase directly contributes to reforestation projects worldwide.
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <button 
              onClick={() => navigate('/home')}
              className="w-full md:w-auto px-8 py-4 bg-primary text-background-dark rounded-full font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105"
            >
              Start Your Journey
            </button>
            <p className="text-sm text-white/60">
              <span className="material-symbols-outlined align-middle text-lg mr-1">check_circle</span>
              Join 12,000+ members
            </p>
          </div>
        </div>
      </header>

      {/* About Us / Mission */}
      <section className="px-6 py-20 bg-background-dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">More Than Just a Marketplace</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              We bridge the gap between personal wellness and environmental restoration. Our platform ensures that your journey to health also heals the earth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "spa", title: "Curated Retreats", desc: "Hand-picked wellness experiences in the world's most breathtaking natural locations." },
              { icon: "forest", title: "Active Reforestation", desc: "A percentage of every transaction goes directly to planting native trees in deforested areas." },
              { icon: "diversity_2", title: "Conscious Community", desc: "Connect with like-minded individuals who care about their health and the environment." }
            ].map((item, idx) => (
              <div key={idx} className="bg-dark-card border border-white/5 p-8 rounded-2xl hover:border-primary/30 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Tree Animation Section */}
      <section ref={treeSectionRef} className="relative py-24 px-6 overflow-hidden bg-gradient-to-b from-background-dark to-[#0B1610]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          
          {/* Left: Text */}
          <div className="md:w-1/2 z-10">
            <h2 className="text-4xl font-bold mb-6">
              Watch Your Impact <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-olive-green">Grow With You</span>
            </h2>
            <p className="text-lg text-white/70 mb-8">
              Every retreat you book and every product you buy plants a digital seed in your profile that represents a real tree in the world. As you engage with the community, your forest grows.
            </p>
            <div className="flex gap-4">
               <div className="flex flex-col">
                 <span className="text-3xl font-bold text-primary">50k+</span>
                 <span className="text-sm text-white/50">Trees Planted</span>
               </div>
               <div className="w-px bg-white/10 h-12"></div>
               <div className="flex flex-col">
                 <span className="text-3xl font-bold text-white">100%</span>
                 <span className="text-sm text-white/50">Verified Organic</span>
               </div>
            </div>
          </div>

          {/* Right: The Animation */}
          <div className="md:w-1/2 relative flex justify-center items-end h-[400px]">
             {/* Background Glow */}
             <div className={`absolute bottom-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full transition-opacity duration-1000 ${isTreeVisible ? 'opacity-100' : 'opacity-0'}`}></div>

             {/* SVG Tree */}
             <svg width="300" height="400" viewBox="0 0 200 300" className="relative z-10 drop-shadow-[0_0_15px_rgba(48,232,122,0.3)]">
                {/* Trunk - Draws upwards */}
                <path 
                  d="M100,300 Q110,250 100,200 Q90,150 100,100" 
                  fill="none" 
                  stroke="#5D4037" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  className={`draw-path ${isTreeVisible ? 'animate' : ''}`}
                />
                
                {/* Branches - Fade in and scale */}
                <g className={`transition-all duration-1000 delay-500 origin-bottom ${isTreeVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                  {/* Left Branch */}
                  <path d="M100,200 Q80,180 60,190" fill="none" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" />
                  {/* Right Branch */}
                  <path d="M100,160 Q130,140 140,130" fill="none" stroke="#5D4037" strokeWidth="5" strokeLinecap="round" />
                </g>

                {/* Leaves - Pop in with stagger */}
                {/* Cluster 1 (Top) */}
                <g className={`transition-all duration-700 delay-[1000ms] origin-center ${isTreeVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{transformBox: 'fill-box'}}>
                  <circle cx="100" cy="90" r="25" fill="#30e87a" />
                  <circle cx="85" cy="110" r="20" fill="#2ebf68" />
                  <circle cx="115" cy="110" r="20" fill="#2ebf68" />
                </g>

                {/* Cluster 2 (Left) */}
                <g className={`transition-all duration-700 delay-[1200ms] origin-center ${isTreeVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{transformBox: 'fill-box'}}>
                  <circle cx="60" cy="190" r="15" fill="#30e87a" />
                  <circle cx="50" cy="200" r="10" fill="#2ebf68" />
                </g>

                {/* Cluster 3 (Right) */}
                <g className={`transition-all duration-700 delay-[1400ms] origin-center ${isTreeVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{transformBox: 'fill-box'}}>
                  <circle cx="140" cy="130" r="18" fill="#30e87a" />
                  <circle cx="150" cy="145" r="12" fill="#2ebf68" />
                </g>
             </svg>
          </div>
        </div>
      </section>

      {/* How to Contribute */}
      <section className="px-6 py-20 bg-dark-card border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How You Can Contribute</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: "01", 
                title: "Discover", 
                desc: "Browse eco-friendly products and sustainable wellness retreats.",
                icon: "search"
              },
              { 
                step: "02", 
                title: "Purchase", 
                desc: "Buy securely. We allocate a portion of proceeds to verified NGOs.",
                icon: "shopping_bag"
              },
              { 
                step: "03", 
                title: "Track Growth", 
                desc: "See your personal forest grow in your profile as you contribute.",
                icon: "forest"
              }
            ].map((item, idx) => (
              <div key={idx} className="relative flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl mb-4 border border-primary/20">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <span className="absolute -top-4 -right-2 text-4xl font-black text-white/5 select-none">{item.step}</span>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-olive-green/20 to-primary/20 p-8 rounded-2xl border border-white/10">
            <h3 className="text-2xl font-bold mb-4">Ready to make a difference?</h3>
            <button 
              onClick={() => navigate('/home')}
              className="bg-primary text-background-dark px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Explore The Marketplace
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/10 text-center text-white/40 text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
          <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
          <span className="cursor-pointer hover:text-white transition-colors">Contact</span>
        </div>
        <p>© 2024 Nature Wellness Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;