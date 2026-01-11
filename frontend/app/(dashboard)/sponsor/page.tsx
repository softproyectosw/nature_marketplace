'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Sponsor Page - Apadrina árboles y experiencias
 * Concepto: No compras, apadrinas. Creas un vínculo con la naturaleza.
 */

// Árboles y experiencias seleccionadas para apadrinar
const sponsorItems = [
  {
    id: 1,
    title: 'Experiencia Forest Bathing',
    type: 'retreat',
    price: 125.0,
    quantity: 1,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB-6GUNZKUR7_k_ZGZ0RbbevuXmvn9LOA0ukszskzKq8Qu9DAcS9RnbeRMCxxsDilRqpucyAIDDsCW0VhAIoXYPZY2imaFkgPFz2r5wammp0aiUc_pV6nBF4EpzpYMnoTR9par3UGszUC9mdx5Nfeee2UrRzkdNKqzzvz-N_HZNKBu2me2QX3-WBzBTL9irFLpr6fbBD8cPxjRc2mAWYdNquWY53gmbKoXckcMcyXc7M3OrNBHvmm5DBw_tAB74cN4BB1tFvBUSvJG3',
  },
  {
    id: 2,
    title: 'Árbol Redwood',
    type: 'tree',
    co2PerYear: 22,
    price: 50.0,
    quantity: 1,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCb7qaFmCmW_aGhTbq42JWuifGkh94nQpfJmiA9_F7aE8mZuTVw1S2ZtiDI9B-5jU0vLKt5IKaOtya60cBgZj2wKfJ3j4IsKyEeBlu1TPRyskyshIO7j0j_BxGAd7hYkVPPU7FTpDe-STzCv0orJsz-2tY9VRCRpR1lvmaocHMDNtF3VpyzQfbrLD7ATHv2_gmJKdZZR6lIv6ypEojiay4KM3doCIohLK-JXcU-pINVpOCYB--Fz29aHoLH9qeX1Teo5j7JmZcnb07j',
  },
];

const subtotal = sponsorItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const processingFee = 2.5; // Tarifa de procesamiento
const total = subtotal + processingFee;
const totalCO2 = sponsorItems.reduce((sum, item) => sum + (item.co2PerYear || 0), 0);

export default function SponsorPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen w-full font-display pb-36">
      {/* Top App Bar */}
      <div className="flex items-center p-4 pb-2 justify-between bg-background-dark sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="text-white flex size-12 shrink-0 items-center justify-start cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Mis Apadrinamientos
        </h2>
        <div className="flex size-12 shrink-0 items-center" />
      </div>

      {/* Sponsor Items */}
      <div className="flex flex-col gap-4 px-4 mt-4">
        {sponsorItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 bg-white/5 p-4 rounded-xl"
          >
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl h-20 w-20"
              style={{ backgroundImage: `url("${item.image}")` }}
            />
            <div className="flex flex-col justify-center flex-1">
              <p className="text-white text-base font-medium leading-normal line-clamp-1">
                {item.title}
              </p>
              <p className="text-olive-light text-sm font-normal leading-normal">
                ${item.price.toFixed(2)}/año
              </p>
              {item.co2PerYear && (
                <p className="text-primary text-xs flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-xs">eco</span>
                  {item.co2PerYear} kg CO₂/año
                </p>
              )}
              <div className="flex items-center gap-3 text-white mt-2">
                <button className="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-lg bg-olive-green/80 cursor-pointer">
                  -
                </button>
                <span className="text-base font-medium leading-normal w-4 text-center">
                  {item.quantity}
                </span>
                <button className="text-base font-medium leading-normal flex h-7 w-7 items-center justify-center rounded-lg bg-olive-green/80 cursor-pointer">
                  +
                </button>
              </div>
            </div>
            <div className="shrink-0 self-start">
              <button className="text-terra/80 hover:text-terra">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Impact Summary */}
      {totalCO2 > 0 && (
        <div className="px-4 mt-6">
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">forest</span>
            </div>
            <div>
              <p className="text-white font-semibold">Tu Impacto Anual</p>
              <p className="text-primary text-lg font-bold">{totalCO2} kg CO₂ compensados</p>
            </div>
          </div>
        </div>
      )}

      {/* Sponsorship Summary */}
      <div className="p-4 mt-2">
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="text-white text-base font-bold mb-3">Resumen de Apadrinamiento</h3>
          <div className="flex justify-between gap-x-6 py-2 border-b border-olive-green/40">
            <p className="text-white/70 text-sm font-normal leading-normal">
              Apadrinamientos
            </p>
            <p className="text-white text-sm font-medium leading-normal text-right">
              ${subtotal.toFixed(2)}/año
            </p>
          </div>
          <div className="flex justify-between gap-x-6 py-2 border-b border-olive-green/40">
            <p className="text-white/70 text-sm font-normal leading-normal">
              Tarifa de procesamiento
            </p>
            <p className="text-white text-sm font-medium leading-normal text-right">
              ${processingFee.toFixed(2)}
            </p>
          </div>
          <div className="flex justify-between gap-x-6 pt-3 mt-1">
            <p className="text-white text-base font-bold leading-normal">Total Anual</p>
            <p className="text-white text-base font-bold leading-normal text-right">
              ${total.toFixed(2)}/año
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="px-4 mt-4">
        <details className="group" open>
          <summary className="flex items-center justify-between cursor-pointer list-none py-2">
            <h3 className="text-white text-base font-bold">Método de Pago</h3>
            <div className="text-white transition-transform duration-300 group-open:rotate-180">
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </summary>
          <div className="mt-2 space-y-4 rounded-xl bg-white/5 p-4">
            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-black text-white h-14 font-semibold hover:bg-black/80 transition-colors">
              <span className="material-symbols-outlined">credit_card</span>
              Pagar con Tarjeta
            </button>
            <div className="relative flex items-center">
              <span className="flex-grow border-t border-olive-green/50" />
              <span className="mx-4 flex-shrink text-sm text-white/60">OR</span>
              <span className="flex-grow border-t border-olive-green/50" />
            </div>
            <div className="flex flex-col gap-3">
              <input
                className="w-full rounded-xl text-white focus:outline-0 focus:ring-1 focus:ring-olive-green border border-olive-green/80 bg-background-dark h-12 placeholder:text-olive-light/70 text-base px-4"
                placeholder="Card Number"
                type="text"
              />
              <input
                className="w-full rounded-xl text-white focus:outline-0 focus:ring-1 focus:ring-olive-green border border-olive-green/80 bg-background-dark h-12 placeholder:text-olive-light/70 text-base px-4"
                placeholder="Cardholder Name"
                type="text"
              />
              <div className="flex gap-3">
                <input
                  className="w-full rounded-xl text-white focus:outline-0 focus:ring-1 focus:ring-olive-green border border-olive-green/80 bg-background-dark h-12 placeholder:text-olive-light/70 text-base px-4"
                  placeholder="MM/YY"
                  type="text"
                />
                <input
                  className="w-full rounded-xl text-white focus:outline-0 focus:ring-1 focus:ring-olive-green border border-olive-green/80 bg-background-dark h-12 placeholder:text-olive-light/70 text-base px-4"
                  placeholder="CVC"
                  type="text"
                />
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-[88px] left-0 right-0 w-full bg-background-dark z-20">
        <div className="px-4 pb-4 pt-3">
          <Link
            href="/checkout"
            className="w-full rounded-xl bg-primary text-background-dark h-14 text-base font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">volunteer_activism</span>
            Confirmar Apadrinamiento - ${total.toFixed(2)}/año
          </Link>
        </div>
      </div>
    </div>
  );
}
