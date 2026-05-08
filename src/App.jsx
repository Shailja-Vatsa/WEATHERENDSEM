import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { calculateDistance, calculateSpeed } from './utils/haversine';
import { IssTracker } from './components/iss/IssTracker';
import { NewsSection } from './components/news/NewsSection';
import { SpeedChart } from './components/charts/SpeedChart';
import { NewsChart } from './components/charts/NewsChart';
import { AiChatbot } from './components/chat/AiChatbot';

function App() {
  const [issHistory, setIssHistory] = useState([]);
  const [astros, setAstros] = useState({ count: 0, names: [] });
  const [nearestCity, setNearestCity] = useState("Loading...");
  
  // Lifted state for news
  const [newsData, setNewsData] = useState([]);
  const [newsCategory, setNewsCategory] = useState('all');

  // Fetch Astros
  useEffect(() => {
    axios.get('http://api.open-notify.org/astros.json')
      .then(res => {
        setAstros({
          count: res.data.number || 0,
          names: (res.data.people || []).map(p => p.name)
        });
      })
      .catch(err => console.error("Error fetching astros:", err));
  }, []);

  // Poll ISS coordinates every 15s
  useEffect(() => {
    const fetchIss = async () => {
      try {
        const res = await axios.get('http://api.open-notify.org/iss-now.json');
        const { latitude, longitude } = res.data.iss_position;
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const timestamp = res.data.timestamp;

        setIssHistory(prev => {
          let speed = 0;
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            // Explicit Haversine usage: distance between t and t-15s
            const distance = calculateDistance(last.lat, last.lon, lat, lon);
            // Time diff in seconds between t and t-15s (approximately 15s)
            const timeDiff = timestamp - last.timestamp;
            speed = calculateSpeed(distance, timeDiff);
            
            // Cap unrealistic speeds due to tiny time diffs in initial fast re-renders
            if (speed > 30000 || speed < 0) speed = 28000; 
          } else {
            // Default ISS average speed ~27,600 km/h if no history
            speed = 27600;
          }

          const newPoint = { lat, lon, speed, timestamp };
          // Keep last 30 for chart
          return [...prev, newPoint].slice(-30);
        });

        // Reverse Geocode
        try {
          const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
          if (geoRes.data && geoRes.data.address) {
            const addr = geoRes.data.address;
            const city = addr.city || addr.town || addr.village || addr.state || geoRes.data.name;
            setNearestCity(`${city}, ${addr.country || ''}`);
          } else {
            setNearestCity("Over Ocean/Unmapped Area");
          }
        } catch (e) {
          setNearestCity("Over Ocean/Unmapped Area");
        }

      } catch (error) {
        console.error("Error fetching ISS:", error);
        toast.error("ISS Connection Lost");
      }
    };

    fetchIss();
    const interval = setInterval(fetchIss, 15000);
    return () => clearInterval(interval);
  }, []);

  const currentIss = issHistory.length > 0 ? issHistory[issHistory.length - 1] : null;

  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <DashboardLayout>
        {/* Left Column: ISS Tracker & Speed Chart */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🛰️ Live ISS Tracker
            </h2>
            <IssTracker history={issHistory} current={currentIss} city={nearestCity} astros={astros} />
          </section>

          <section className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-xl font-bold mb-4">Speed Trajectory (Last 30 points)</h3>
            <div className="h-64">
              <SpeedChart history={issHistory} />
            </div>
          </section>
        </div>

        {/* Right Column: News & Distribution Chart */}
        <div className="space-y-8">
          <section className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <NewsSection 
              newsData={newsData} 
              setNewsData={setNewsData} 
              category={newsCategory}
              setCategory={setNewsCategory}
            />
          </section>

          <section className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-xl font-bold mb-4">News Distribution</h3>
            <div className="text-sm text-slate-500 mb-2">Click a slice to filter news</div>
            <div className="h-64">
              <NewsChart 
                newsData={newsData} 
                onCategorySelect={setNewsCategory}
              />
            </div>
          </section>
        </div>

        <AiChatbot issData={currentIss} nearestCity={nearestCity} newsData={newsData} />
      </DashboardLayout>
    </ThemeProvider>
  );
}

export default App;
