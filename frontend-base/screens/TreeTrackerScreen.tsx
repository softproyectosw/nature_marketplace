import React from 'react';
import { useNavigate } from 'react-router-dom';

const TreeTrackerScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen w-full bg-background-dark font-display pb-10 text-white">
      {/* Top App Bar */}
      <div className="flex items-center p-4 justify-between sticky top-0 z-20 bg-background-dark/80 backdrop-blur-md border-b border-white/5">
        <div onClick={() => navigate(-1)} className="text-white flex size-10 shrink-0 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 cursor-pointer">
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <h2 className="text-white text-base font-bold tracking-wide uppercase text-center flex-1">Tree Tracker</h2>
        <div className="size-10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">share</span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Header Info */}
        <div className="flex items-start justify-between">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="bg-primary text-background-dark px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Healthy</span>
                    <span className="text-white/40 text-xs uppercase tracking-wider">ID: #SEQUOIA-402</span>
                </div>
                <h1 className="text-3xl font-bold leading-tight">Giant Sequoia</h1>
                <p className="text-white/60 text-sm flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    Sierra Nevada, California
                </p>
            </div>
        </div>

        {/* Map Card - Sharper look */}
        <div className="relative w-full aspect-video bg-gray-800 rounded-2xl overflow-hidden border border-white/10 group">
             {/* Fake Map Background */}
             <div 
                className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay"
                style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDGJ2EHp_b9TsnrJTCV-qAj3gRsfWcFBcK2LhUvsPOEk6MDZ8r1e36sq06GCmQdVMYzctaJCAFd-v4bSuQsYsPmu_d6NytOSM7G9-3R7YPg5KAd6Wk17ZunBDPlY9bzK6aFMBvTP8-T_ERvhOhD1LzsrO5SPV9qKSvw048exJzTj1PLOv3kc6BYkrKHIunH1YIjYvn0AhgVOwdjovX19uOlJFX8OJ4WUg0xD-W4g0EhqKebAozk1VI2bELxwkgz1NuYULihB6jfr01w")'}}
             ></div>
             <div className="absolute inset-0 bg-[#1a2c20] mix-blend-multiply"></div>
             
             {/* Grid Lines for tech feel */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

             {/* Ping Animation */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                 <div className="absolute w-24 h-24 bg-primary/20 rounded-full animate-ping"></div>
                 <div className="absolute w-12 h-12 bg-primary/40 rounded-full animate-pulse"></div>
                 <div className="relative w-4 h-4 bg-primary rounded-full border-2 border-white shadow-[0_0_10px_#30e87a]"></div>
             </div>

             <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-primary">
                 36.5785° N, 118.2923° W
             </div>
        </div>

        {/* Stats Grid - Sharp Cards */}
        <div className="grid grid-cols-3 gap-3">
            {[
                { label: "Age", val: "2 Yrs", icon: "hourglass_bottom" },
                { label: "Height", val: "1.2m", icon: "height" },
                { label: "CO₂", val: "-45kg", icon: "air" }
            ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-white/40 text-lg">{stat.icon}</span>
                    <span className="text-lg font-bold text-white">{stat.val}</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/40">{stat.label}</span>
                </div>
            ))}
        </div>

        {/* Timeline */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-4">Growth Timeline</h3>
            <div className="relative pl-2 border-l-2 border-white/10 space-y-6">
                
                {/* Event 1 */}
                <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background-dark"></div>
                    <span className="text-xs text-primary font-bold mb-0.5 block">Oct 12, 2024</span>
                    <h4 className="text-sm font-bold">Carbon Verification</h4>
                    <p className="text-xs text-white/60 mt-1">Independent audit confirmed growth metrics.</p>
                </div>

                {/* Event 2 */}
                <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-olive-light border-4 border-background-dark"></div>
                    <span className="text-xs text-olive-light/80 font-bold mb-0.5 block">Aug 05, 2024</span>
                    <h4 className="text-sm font-bold">Seasonal Maintenance</h4>
                    <p className="text-xs text-white/60 mt-1">Ranger check-in: Soil moisture optimal.</p>
                </div>

                {/* Event 3 */}
                <div className="relative pl-6 opacity-60">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white/40 border-4 border-background-dark"></div>
                    <span className="text-xs text-white/60 font-bold mb-0.5 block">Feb 10, 2022</span>
                    <h4 className="text-sm font-bold">Sapling Planted</h4>
                </div>
            </div>
        </div>

        {/* Gallery */}
        <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-3">Field Updates</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-shrink-0 w-32 h-24 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/20 text-3xl">image</span>
                    </div>
                ))}
            </div>
        </div>

        <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
            <span className="material-symbols-outlined">download</span>
            Download Digital Certificate
        </button>

      </div>
    </div>
  );
};

export default TreeTrackerScreen;
