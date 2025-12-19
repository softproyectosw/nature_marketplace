import React, { createContext, useState, useContext, ReactNode } from 'react';

// Mock Data
export const PRODUCTS = [
  {
    id: 1,
    title: "Forest Bathing Retreat",
    price: "$125.00",
    location: "California",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAa9w-QzRB5XskGSjNeaCaVWbhABGSrQ20oRePoosL3FWqQ5AMtNyRrhPA9AU-SNdO8XXp5xxKblDWjEGUXTldDhsLiC1lZXmxRAdnmZCEWn4MivjZbtofjiVyZOcHRMMmU_Im1d4-qRAObgrXuXvtRjjq3zO7SY7uw77-jCEAyVu4Y-9jpKvZkT7lO-J6QaThkzx9f37e0S5ySyqOm2oGw91k6UbaIgYkCtFQy-esPQ2QpDk9n6912RxJsWpHr6gzw_LW6--En36iG",
    category: "Retreats"
  },
  {
    id: 2,
    title: "Adopt a Redwood",
    price: "$50.00",
    location: "Humboldt County",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCN2OBmV1zQJHAjVbfIUkKYuYOlXxw87_ysTPo0oVJnZC8MIJv0XteJV1GK-sqsrwJ2GRIyFwIgMyRXo7_J7Lt5Jz_nk2nU4KZnAyUK4J_ghjv4mpm9X1x3swbpHPn9XR6dQIh-ke4guMVGAzmhBBdX15nU534TZAuI8jmlXc5t1Ovy0hxa1D_htKDHXj2_XxFuv5vmuRLZclzWBVCajIcH7uOShHcMJJTE7FGRsoaisrZOFKCAeuQKO9aWbgHamjhji3TTmbk1RyS",
    category: "Trees"
  },
  {
    id: 3,
    title: "Herbal Tincture Kit",
    price: "$35.00",
    location: "Organic Herbs",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2w_LQy-axjB80q8Rqn0xc9vKf39Ks2ECSTdKBW21HcMw-CIbq5v1OppDmmcratZmxC8yfknwT5K6-t4YFNLbeQ2-E3mKSk5F5B2hGsnQ7cuq7r0AXA_lgCxM-Bn2tsi7rOFq242HtE3vuLx8_aZFI4OA2b8LaIO-jJUqSErBu5z02Za4_VCfbmL72OzoLcGhgo55iVhJhy-xi0IrICkHuwDlokap-yHc-Z0rqslwVdaSUfOxN0JShmXvr7Ia0EZ3xQkQw7v1Gh-i0",
    category: "Products"
  },
  {
    id: 4,
    title: "Sunrise Yoga Workshop",
    price: "$45.00",
    location: "Online",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCI9mG8zsq6pfYzH5VBA1c9Xm3sQSUrZVvWv052P9b6Yp1C3d7WRrgIyupcAki_aulg0iRQsSN1sNteQOv1jPJnXvhm89kROvjVXr2FVajmg6wLFwzKTWj4YI4vLF0HNBBNcnGHFeiL49jv4UJ7653ziQszcd7kDro677JAJyH95MXNzE-WFNroGmcnUEeLwz48d5QQhdo6tmVj1oJsu64fIXYPXq0K3H7KJu0I5e09tXnRSyJBzrARw4h4kK0LtWsz_YSNtXZFPiF1",
    category: "Workshops"
  },
  {
    id: 5,
    title: "Terra Cotta Planter",
    price: "$29.99",
    location: "Handmade",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTvwNbWoqiyfMCJea5HtveYvTIcss0_gRxh9_JE9xiqo_daI_ssFlAlDVwWnz1a5JU_BCoRq6eo5FOJsTD5mb6kVBNCdBVqGCpLX2fNcwIfo_Xhm9MTUS9phA9EqZb5Un_oeR8iPv8C2wpcDhpnFuO2CnrDsZ7uakCHxQrJWSWtgzDk0drlMvXI2qSJpi2u_x23EW1xzR_fbtz4bHTRIqVdW3QXVi7xHYUpoWizYw00zM6jcD_CyD-GNnDWdkNHH4BLVb7ElwWRI2W",
    category: "Products"
  },
  {
    id: 6,
    title: "Waterfall Soundscape",
    price: "$9.99",
    location: "Digital",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxaJNhXeai0zRnpYL5xb0x2wXDKfSgv5qaCMCO8Hjj3lmiOIgs-6P3Xqg218og66f-2xbnQ_v6FPkiSBv0P7AV8LP0IR5bC_1dRhYjubHy9elwId_CQCy5ThGLTVq0H8b82MvViv1y6sQnOxS2Vs23a7f4fZd93ACWXn6G86W5cT1ueg50tMqpV6koczEQE3sziacQtcvF17eEX0pTfHC-jUBDlYHk76LLN3jtCVArh86Cmb1mEvwaz3Fe59Ud4hyL07ofHEDXKZaS",
    category: "Digital"
  }
];

interface StoreContextType {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([1, 5]); // Default items favorited

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: number) => favorites.includes(id);

  return (
    <StoreContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
