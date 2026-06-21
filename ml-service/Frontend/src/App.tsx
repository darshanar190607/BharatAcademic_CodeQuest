import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoadingScreen from './components/ui/LoadingScreen.tsx';
import Header from './components/layout/Header.tsx';
import HomePage from './pages/home/HomePage.tsx';
import CollaborationPage from './pages/collaboration/CollaborationPage.tsx';
import RoadmapCreator from './pages/roadmap/RoadmapCreatorPage.tsx';
import PersonalDashboard from './pages/dashboard/PersonalDashboardPage.tsx';
import AboutUs from './pages/about/About.tsx';
import Footer from './components/layout/Footer.tsx';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // Show loading screen for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }



  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/courses" element={<HomePage />} /> {/* Placeholder for now, or redirect */}
          <Route path="/roadmap" element={<RoadmapCreator />} />
          <Route path="/collaboration" element={<CollaborationPage />} />
          <Route path="/dashboard" element={<PersonalDashboard />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      {location.pathname !== '/about' && <Footer />}
    </div>
  );
};

export default App;