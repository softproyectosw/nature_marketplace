import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import WelcomeScreen from './screens/WelcomeScreen';
import LandingPage from './screens/LandingPage';
import HomeScreen from './screens/HomeScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import CartScreen from './screens/CartScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import TreeTrackerScreen from './screens/TreeTrackerScreen';
import BottomNav from './components/BottomNav';
import { StoreProvider } from './context/StoreContext';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  // Hide bottom nav on Landing, Welcome, Details, Login and Tracker screens
  const hideNavRoutes = ['/', '/welcome', '/details', '/login', '/tracker']; 

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark overflow-x-hidden">
      <main className="flex-grow">
        {children}
      </main>
      {!hideNavRoutes.includes(location.pathname) && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/welcome" element={<WelcomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/details" element={<ProductDetailsScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/favorites" element={<FavoritesScreen />} />
            <Route path="/tracker" element={<TreeTrackerScreen />} />
          </Routes>
        </Layout>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;