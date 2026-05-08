import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CACHE_KEY = 'dashboard_news_cache';
const CACHE_EXPIRY = 15 * 60 * 1000; // 15 mins

export const NewsSection = ({ newsData, setNewsData, category, setCategory }) => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setNewsData(data);
            setLoading(false);
            return;
          }
        }

        const apiKey = import.meta.env.VITE_NEWS_API_KEY;
        if (!apiKey || apiKey === 'your_news_api_key_here') {
          console.warn("News API Key missing. Using mock data.");
          const mockData = [
            { source: { name: 'NASA' }, title: 'James Webb Discovers New Exoplanet', description: 'A new exoplanet with water signature found.', url: '#', publishedAt: new Date().toISOString() },
            { source: { name: 'SpaceX' }, title: 'Starship Launch Successful', description: 'SpaceX successfully launched and landed Starship.', url: '#', publishedAt: new Date().toISOString() },
            { source: { name: 'ESA' }, title: 'Mars Rover Sends New Images', description: 'High resolution images from Mars.', url: '#', publishedAt: new Date().toISOString() }
          ];
          setNewsData(mockData);
          setLoading(false);
          return;
        }

        const res = await axios.get(`https://newsapi.org/v2/everything?q=space OR NASA OR ISS&language=en&pageSize=10&apiKey=${apiKey}`);
        
        if (res.data.status === 'ok') {
          setNewsData(res.data.articles);
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: res.data.articles,
            timestamp: Date.now()
          }));
          toast.success("News Refreshed");
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        toast.error("Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [setNewsData]);

  const filteredNews = newsData.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || (article.source.name && article.source.name.toLowerCase() === category.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">📰 Space News</h2>
        {category !== 'all' && (
          <button 
            onClick={() => setCategory('all')}
            className="text-sm text-primary hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[500px]">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded"></div>
                    <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : filteredNews.length > 0 ? (
          filteredNews.map((article, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-xs text-primary font-semibold mb-1">{article.source.name}</div>
                  <h4 className="font-bold mb-2 line-clamp-2">{article.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                    {article.description}
                  </p>
                </div>
              </div>
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-indigo-500 transition-colors"
              >
                Read More <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-500 py-8">No articles found.</div>
        )}
      </div>
    </div>
  );
};
