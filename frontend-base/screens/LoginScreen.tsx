import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/home');
  };

  const handleGoogleLogin = () => {
    // Simulate Google Login
    navigate('/home');
  };

  // Determine tree growth stage based on password length
  // Stage 0: Seed (0 chars)
  // Stage 1: Sprout (1-3 chars)
  // Stage 2: Sapling (4-7 chars)
  // Stage 3: Tree with leaves (8+ chars)
  // Stage 4: Blooming (12+ chars)
  const len = password.length;

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-display bg-[#0B1610] relative overflow-hidden">
      {/* Background with blur */}
      <div 
        className="absolute inset-0 w-full h-full bg-center bg-cover opacity-40 blur-sm scale-110"
        style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDGJ2EHp_b9TsnrJTCV-qAj3gRsfWcFBcK2LhUvsPOEk6MDZ8r1e36sq06GCmQdVMYzctaJCAFd-v4bSuQsYsPmu_d6NytOSM7G9-3R7YPg5KAd6Wk17ZunBDPlY9bzK6aFMBvTP8-T_ERvhOhD1LzsrO5SPV9qKSvw048exJzTj1PLOv3kc6BYkrKHIunH1YIjYvn0AhgVOwdjovX19uOlJFX8OJ4WUg0xD-W4g0EhqKebAozk1VI2bELxwkgz1NuYULihB6jfr01w")'}}
      ></div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* The Tree Container */}
        <div className="bg-background-dark/80 backdrop-blur-xl border border-wood-light/30 rounded-2xl p-8 shadow-2xl relative">
          
          {/* Back Button */}
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-white/60 hover:text-white">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          {/* Animation Area */}
          <div className="h-48 flex justify-center items-end mb-6 relative border-b border-white/10 pb-4">
            
            {/* The SVG Tree */}
            <svg width="200" height="180" viewBox="0 0 200 180" className="drop-shadow-[0_0_10px_rgba(48,232,122,0.4)] transition-all duration-500">
              {/* Soil */}
              <ellipse cx="100" cy="170" rx="60" ry="10" fill="#3E2723" opacity="0.8" />
              
              {/* Seed (Stage 0) */}
              <circle cx="100" cy="170" r="6" fill="#8D6E63" className={`transition-all duration-500 ${len > 0 ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`} />

              {/* Stem (Stage 1+) */}
              <path 
                d="M100,170 Q100,140 100,110" 
                fill="none" 
                stroke="#5D4037" 
                strokeWidth={len > 0 ? "4" : "0"}
                strokeLinecap="round"
                className={`transition-all duration-700 ease-out origin-bottom ${len > 0 ? 'scale-y-100' : 'scale-y-0'}`}
              />

              {/* Branches & Top (Stage 2+) */}
              <g className={`transition-all duration-700 ease-out delay-100 origin-bottom ${len > 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{transformOrigin: '100px 110px'}}>
                 {/* Main trunk continuation */}
                 <path d="M100,110 Q90,70 100,40" fill="none" stroke="#5D4037" strokeWidth="3" strokeLinecap="round"/>
                 {/* Left branch */}
                 <path d="M100,90 Q80,80 70,70" fill="none" stroke="#5D4037" strokeWidth="2" strokeLinecap="round"/>
                 {/* Right branch */}
                 <path d="M100,80 Q120,70 130,60" fill="none" stroke="#5D4037" strokeWidth="2" strokeLinecap="round"/>
              </g>

              {/* Leaves (Stage 3+) */}
              <g className={`transition-all duration-500 delay-300 ${len > 7 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} style={{transformBox: 'fill-box', transformOrigin: 'center'}}>
                 <circle cx="100" cy="40" r="20" fill="#30e87a" />
                 <circle cx="70" cy="70" r="10" fill="#2ebf68" />
                 <circle cx="130" cy="60" r="12" fill="#2ebf68" />
                 <circle cx="90" cy="60" r="15" fill="#30e87a" />
                 <circle cx="110" cy="50" r="15" fill="#2ebf68" />
              </g>

              {/* Flowers (Stage 4+) */}
              <g className={`transition-all duration-500 delay-500 ${len > 11 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} style={{transformBox: 'fill-box', transformOrigin: 'center'}}>
                 <circle cx="90" cy="40" r="4" fill="#FFEB3B" />
                 <circle cx="110" cy="30" r="3" fill="#FFEB3B" />
                 <circle cx="75" cy="65" r="3" fill="#FFEB3B" />
              </g>
            </svg>
            
            <div className="absolute top-0 w-full text-center">
               <p className="text-primary font-bold tracking-wider uppercase text-sm animate-pulse">
                 {len === 0 && "Plant a seed"}
                 {len > 0 && len <= 3 && "It's sprouting..."}
                 {len > 3 && len <= 7 && "Growing strong!"}
                 {len > 7 && len <= 11 && "Lush & Green"}
                 {len > 11 && "In full bloom!"}
               </p>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Grow Your Account</h2>
            <p className="text-white/60 text-sm">Enter your details to nurture your profile.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-olive-light pl-2">Plant your Email</label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-wood-light mr-3">seed</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@nature.com"
                  className="bg-transparent border-none text-white placeholder:text-white/30 focus:ring-0 w-full p-0"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-olive-light pl-2">Water with Password</label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-wood-light mr-3">water_drop</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent border-none text-white placeholder:text-white/30 focus:ring-0 w-full p-0"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-olive-green to-primary text-background-dark font-bold text-lg py-4 rounded-xl mt-6 hover:brightness-110 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
            >
              <span>Start Growing</span>
              <span className="material-symbols-outlined group-hover:-translate-y-1 transition-transform">forest</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-white/40 text-sm">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Google Login Button */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white text-background-dark font-bold text-base py-3 rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-3"
          >
            <img 
              src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" 
              alt="Google" 
              className="w-6 h-6" 
            />
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-white/40 text-sm mt-6">
            Don't have a seed yet? <span onClick={() => navigate('/home')} className="text-primary cursor-pointer hover:underline">Get one here</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;