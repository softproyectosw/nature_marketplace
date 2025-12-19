import React from 'react';
import { useNavigate } from 'react-router-dom';

const CartScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen w-full font-display pb-36">
      {/* Top App Bar */}
      <div className="flex items-center p-4 pb-2 justify-between bg-background-dark sticky top-0 z-10">
        <div onClick={() => navigate(-1)} className="text-white flex size-12 shrink-0 items-center justify-start cursor-pointer">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </div>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">My Cart</h2>
        <div className="flex size-12 shrink-0 items-center"></div>
      </div>

      {/* List Items */}
      <div className="flex flex-col gap-4 px-4 mt-4">
        {/* Item 1 */}
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl h-20 w-20" 
            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB-6GUNZKUR7_k_ZGZ0RbbevuXmvn9LOA0ukszskzKq8Qu9DAcS9RnbeRMCxxsDilRqpucyAIDDsCW0VhAIoXYPZY2imaFkgPFz2r5wammp0aiUc_pV6nBF4EpzpYMnoTR9par3UGszUC9mdx5Nfeee2UrRzkdNKqzzvz-N_HZNKBu2me2QX3-WBzBTL9irFLpr6fbBD8cPxjRc2mAWYdNquWY53gmbKoXckcMcyXc7M3OrNBHvmm5DBw_tAB74cN4BB1tFvBUSvJG3")'}}
          ></div>
          <div className="flex flex-col justify-center flex-1">
            <p className="text-white text-base font-medium leading-normal line-clamp-1">Forest Bathing Retreat</p>
            <p className="text-olive-light text-sm font-normal leading-normal line-clamp-2">$125.00</p>
            <div className="flex items-center gap-3 text-white mt-2">
              <button className="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-full bg-olive-green/80 cursor-pointer">-</button>
              <span className="text-base font-medium leading-normal w-4 text-center">1</span>
              <button className="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-full bg-olive-green/80 cursor-pointer">+</button>
            </div>
          </div>
          <div className="shrink-0 self-start">
            <button className="text-terra/80 hover:text-terra">
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl h-20 w-20" 
            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCb7qaFmCmW_aGhTbq42JWuifGkh94nQpfJmiA9_F7aE8mZuTVw1S2ZtiDI9B-5jU0vLKt5IKaOtya60cBgZj2wKfJ3j4IsKyEeBlu1TPRyskyshIO7j0j_BxGAd7hYkVPPU7FTpDe-STzCv0orJsz-2tY9VRCRpR1lvmaocHMDNtF3VpyzQfbrLD7ATHv2_gmJKdZZR6lIv6ypEojiay4KM3doCIohLK-JXcU-pINVpOCYB--Fz29aHoLH9qeX1Teo5j7JmZcnb07j")'}}
          ></div>
          <div className="flex flex-col justify-center flex-1">
            <p className="text-white text-base font-medium leading-normal line-clamp-1">Adopt a Redwood Tree</p>
            <p className="text-olive-light text-sm font-normal leading-normal line-clamp-2">$50.00</p>
            <div className="flex items-center gap-3 text-white mt-2">
              <button className="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-full bg-olive-green/80 cursor-pointer">-</button>
              <span className="text-base font-medium leading-normal w-4 text-center">1</span>
              <button className="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-full bg-olive-green/80 cursor-pointer">+</button>
            </div>
          </div>
          <div className="shrink-0 self-start">
            <button className="text-terra/80 hover:text-terra">
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Promo Code */}
      <div className="px-4 mt-6">
        <label className="flex flex-col w-full">
          <div className="flex w-full flex-1 items-stretch rounded-xl overflow-hidden">
            <input 
              className="flex w-full min-w-0 flex-1 resize-none bg-white/5 text-white focus:outline-0 focus:ring-0 border-none h-14 placeholder:text-olive-light/70 p-[15px] text-base font-normal leading-normal" 
              placeholder="Promo Code" 
            />
            <button className="text-white flex items-center justify-center px-6 bg-olive-green/80 text-sm font-bold hover:bg-olive-green transition-colors">APPLY</button>
          </div>
        </label>
      </div>

      {/* Order Summary */}
      <div className="p-4 mt-2">
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="text-white text-base font-bold mb-3">Order Summary</h3>
          <div className="flex justify-between gap-x-6 py-2 border-b border-olive-green/40">
            <p className="text-white/70 text-sm font-normal leading-normal">Subtotal</p>
            <p className="text-white text-sm font-medium leading-normal text-right">$175.00</p>
          </div>
          <div className="flex justify-between gap-x-6 py-2 border-b border-olive-green/40">
            <p className="text-white/70 text-sm font-normal leading-normal">Shipping</p>
            <p className="text-white text-sm font-medium leading-normal text-right">$5.00</p>
          </div>
          <div className="flex justify-between gap-x-6 pt-3 mt-1">
            <p className="text-white text-base font-bold leading-normal">Total</p>
            <p className="text-white text-base font-bold leading-normal text-right">$180.00</p>
          </div>
        </div>
      </div>

      {/* Payment Method Accordion */}
      <div className="px-4 mt-4">
        <details className="group open">
          <summary className="flex items-center justify-between cursor-pointer list-none py-2">
            <h3 className="text-white text-base font-bold">Payment Method</h3>
            <div className="text-white transition-transform duration-300 group-open:rotate-180">
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </summary>
          <div className="mt-2 space-y-4 rounded-xl bg-white/5 p-4">
            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-black text-white h-14 font-semibold hover:bg-black/80 transition-colors">
              <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M12.56,3.68a1,1,0,0,0-1.12,0L3,9.55a1,1,0,0,0-.56.9V19a1,1,0,0,0,1,1H20.5a1,1,0,0,0,1-1V10.45a1,1,0,0,0-.56-.9Zm7.14,6.49-3.1,3.29a.5.5,0,0,1-.7,0l-3.1-3.29a.5.5,0,0,1,0-.7l.91-.9a.5.5,0,0,1,.7,0l1.14,1.14a1.49,1.49,0,0,0,2.1,0L19,9.47a.5.5,0,0,1,.7,0Z"></path></svg>
              Pay
            </button>
            <div className="relative flex items-center">
              <span className="flex-grow border-t border-olive-green/50"></span>
              <span className="mx-4 flex-shrink text-sm text-white/60">OR</span>
              <span className="flex-grow border-t border-olive-green/50"></span>
            </div>
            <div className="flex flex-col gap-3">
              <input className="w-full rounded-xl text-white focus:outline-0 focus:ring-1 focus:ring-olive-green border-olive-green/80 bg-background-dark h-12 placeholder:text-olive-light/70 text-base px-4" placeholder="Card Number" type="text" />
              <input className="w-full rounded-xl text-white focus:outline-0 focus:ring-1 focus:ring-olive-green border-olive-green/80 bg-background-dark h-12 placeholder:text-olive-light/70 text-base px-4" placeholder="Cardholder Name" type="text" />
              <div className="flex gap-3">
                <input className="w-full rounded-xl text-white focus:outline-0 focus:ring-1 focus:ring-olive-green border-olive-green/80 bg-background-dark h-12 placeholder:text-olive-light/70 text-base px-4" placeholder="MM/YY" type="text" />
                <input className="w-full rounded-xl text-white focus:outline-0 focus:ring-1 focus:ring-olive-green border-olive-green/80 bg-background-dark h-12 placeholder:text-olive-light/70 text-base px-4" placeholder="CVC" type="text" />
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-[88px] left-0 right-0 w-full bg-background-dark z-20">
        <div className="px-4 pb-4 pt-3">
          <button className="w-full rounded-full bg-navy-blue text-white h-14 text-base font-bold shadow-lg shadow-navy-blue/30 hover:bg-navy-blue/90 transition-colors">
            Proceed to Payment - $180.00
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;