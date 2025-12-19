import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen w-full bg-background-dark font-display pb-32 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-6">
        <h1 className="text-xl font-bold">My Profile</h1>
        <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">settings</span>
        </button>
      </div>

      {/* User Info */}
      <div className="flex flex-col items-center px-6 mb-8">
        <div className="relative mb-4">
          <div 
            className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-white/10"
            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuACuKLVH_fV5X9Ba3rRSCI596oYq9gIAJwfZwaCPJLLvQL38TK2lAk4eXqWihfG9oxG4RHjkiBsZkS8vPB0_DsMoBLSm1R75Z1z-jR1dOawiERZxvG33EqxE3JZpPxhZCoIwTirc1Y9f4xZjfrH8nEEYIOaszbaKxU8AOu-fD_qFXYquavFTeu6NBBQ7DPtJK92GpPJqW5Wqq16dSMhjUWGgcC5iIvA79Um_d-aBeiiih1ft8qT8Lvkf5I4nkzZT5espv4ybCSlTvRq")'}}
          ></div>
          <div className="absolute bottom-0 right-0 bg-primary text-background-dark p-1 rounded-full border-2 border-background-dark flex items-center justify-center">
            <span className="material-symbols-outlined text-sm font-bold">eco</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-1">Sarah Jenkins</h2>
        <p className="text-primary font-medium text-sm bg-primary/10 px-3 py-1 rounded-full">Earth Guardian • Level 5</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 px-6 mb-8">
        <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center gap-1 border border-white/5">
          <span className="text-2xl font-bold text-white">12</span>
          <span className="text-xs text-white/60 text-center">Trees Planted</span>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center gap-1 border border-white/5">
          <span className="text-2xl font-bold text-white">450</span>
          <span className="text-xs text-white/60 text-center">kg CO₂ Offset</span>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center gap-1 border border-white/5">
          <span className="text-2xl font-bold text-white">850</span>
          <span className="text-xs text-white/60 text-center">Green Points</span>
        </div>
      </div>

      {/* Upcoming Retreats */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Upcoming Journey</h3>
          <span className="text-primary text-sm font-medium">See all</span>
        </div>
        <div className="bg-gradient-to-br from-olive-green/20 to-primary/10 rounded-2xl p-5 border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-8xl">flight</span>
          </div>
          <div className="relative z-10">
            <span className="bg-primary text-background-dark text-xs font-bold px-2 py-1 rounded mb-3 inline-block">CONFIRMED</span>
            <h4 className="text-xl font-bold mb-1">Andean Wellness Retreat</h4>
            <p className="text-white/70 text-sm mb-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-base">calendar_today</span>
              Oct 15 - 22, 2024
            </p>
            <button 
              onClick={() => navigate('/details')}
              className="bg-white text-background-dark px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/90 transition-colors w-full"
            >
              View Ticket Details
            </button>
          </div>
        </div>
      </div>

      {/* My Forest (Adopted Trees) */}
      <div className="px-6 mb-6">
        <h3 className="text-lg font-bold mb-4">My Forest</h3>
        <div className="flex flex-col gap-4">
          {[
            { name: "Giant Sequoia #402", location: "California, USA", age: "2 years", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCN2OBmV1zQJHAjVbfIUkKYuYOlXxw87_ysTPo0oVJnZC8MIJv0XteJV1GK-sqsrwJ2GRIyFwIgMyRXo7_J7Lt5Jz_nk2nU4KZnAyUK4J_ghjv4mpm9X1x3swbpHPn9XR6dQIh-ke4guMVGAzmhBBdX15nU534TZAuI8jmlXc5t1Ovy0hxa1D_htKDHXj2_XxFuv5vmuRLZclzWBVCajIcH7uOShHcMJJTE7FGRsoaisrZOFKCAeuQKO9aWbgHamjhji3TTmbk1RyS" },
            { name: "Oak Sapling #88", location: "Scottish Highlands", age: "6 months", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0Mv14sOoaWIvfZY5_Xp1Y2O09g0T0SW3IfDdR9lEJ6nMNR8VRVOi1vH60jA4FId07YmgmWkrL9rZlux5eDomuoAU7EExTPSCkav7JtusBH69xFDQQwkpv6MHB_D68rt_doc6NhUZRhA9RQGAQMOY8hIy8NCEDXGqz1QmS5adQE5oHESrjiyP3v01TSxd4TruUaIYC1U9pVaak2GUsV8IR58CjbxN0d0IAqZFJH75NoFwMjzP9UGWxwDMeYPpig7eMDxnny2uNG3qP" }
          ].map((tree, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group" onClick={() => navigate('/tracker')}>
              <div 
                className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0"
                style={{backgroundImage: `url("${tree.img}")`}}
              ></div>
              <div className="flex-1">
                <h4 className="font-bold text-white group-hover:text-primary transition-colors">{tree.name}</h4>
                <p className="text-white/60 text-xs">{tree.location}</p>
              </div>
              <button className="text-primary text-sm font-bold px-3 py-1 bg-primary/10 rounded-lg hover:bg-primary hover:text-background-dark transition-all">
                Track
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Options */}
      <div className="px-6 mt-2 space-y-2">
         {[
           { icon: "credit_card", label: "Payment Methods" },
           { icon: "help", label: "Help & Support" },
           { icon: "logout", label: "Log Out", action: () => navigate('/') }
         ].map((item, idx) => (
           <button 
             key={idx} 
             onClick={item.action}
             className="w-full flex items-center gap-4 p-4 rounded-xl bg-transparent hover:bg-white/5 transition-colors text-left"
           >
             <span className="material-symbols-outlined text-white/60">{item.icon}</span>
             <span className="font-medium text-white/80 flex-1">{item.label}</span>
             <span className="material-symbols-outlined text-white/40 text-sm">arrow_forward_ios</span>
           </button>
         ))}
      </div>
    </div>
  );
};

export default ProfileScreen;