import React, { useEffect, useState } from 'react';
import {
  getFarms,
  getWeatherForFarm,
  getResourceSummary,
  getRecommendationHistory,
  getActionPlans
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { HiCube, HiGlobeAlt, HiBeaker, HiChartBar, HiCog, HiPlus, HiArrowTrendingUp, HiSun, HiCloudArrowDown, HiCalendar } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

function DashboardPage() {
  const { user } = useAuth();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Real-time data fields
  const [weather, setWeather] = useState(null);
  const [resourceSummary, setResourceSummary] = useState(null);
  const [recommendationsCount, setRecommendationsCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const farmList = await getFarms();
        setFarms(Array.isArray(farmList) ? farmList : []);

        if (Array.isArray(farmList) && farmList.length > 0) {
          const mainFarmId = farmList[0].id;

          // Fetch Weather for main farm plot
          try {
            const wData = await getWeatherForFarm(mainFarmId);
            setWeather(wData);
          } catch (e) {
            console.warn('Weather load failed:', e?.message || e);
          }

          // Fetch Resource Summary for main farm plot
          try {
            const rData = await getResourceSummary(mainFarmId);
            setResourceSummary(rData);
          } catch (e) {
            console.warn('Resource load failed:', e?.message || e);
          }

          // Fetch Recommendation History to populate activity and count
          try {
            const recData = await getRecommendationHistory(mainFarmId);
            const historyList = Array.isArray(recData) ? recData : [];
            setRecommendationsCount(historyList.length);
            
            // Map top 3 recommendations into activities
            const mappedActivities = historyList.slice(0, 3).map((rec) => {
              const score = typeof rec.suitabilityScore === 'number' ? rec.suitabilityScore.toFixed(1) : (rec.suitabilityScore || 'N/A');
              const dateStr = rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : 'Recent';
              return {
                id: rec.id,
                action: `Recommendation generated for ${rec.cropName || 'Crop'}`,
                detail: `Suitability score: ${score}% | pH: ${rec.pH ?? 'N/A'}`,
                time: dateStr,
                type: 'success'
              };
            });
            
            // Fetch Task List to append to activities
            try {
              const taskData = await getActionPlans(mainFarmId);
              const taskList = Array.isArray(taskData) ? taskData : [];
              const mappedTasks = taskList.slice(0, 2).map((task) => ({
                id: `t-${task.id}`,
                action: `Task Scheduled: ${task.title}`,
                detail: `Priority ${task.priority} | Due ${task.dueDate} | Status ${task.status}`,
                time: task.status,
                type: 'info'
              }));
              setRecentActivities([...mappedActivities, ...mappedTasks]);
            } catch (taskErr) {
              setRecentActivities(mappedActivities);
            }
            
          } catch (e) {
            console.warn('Recommendations load failed:', e?.message || e);
          }
        }
      } catch (err) {
        console.warn('Could not load farms:', err?.message || err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalFarms = farms.length;
  const totalArea = farms.reduce((sum, f) => sum + (Number(f.area) || 0), 0);

  // Fallback default activities if empty
  const activitiesToDisplay = recentActivities.length > 0 ? recentActivities : [
    { id: 1, action: 'AgriSmart Dashboard ready', detail: 'Register farm plots to populate details.', time: 'Now', type: 'accent' }
  ];

  const sectionStyle = {
    background: 'var(--gradient-card)',
    border: '1px solid var(--border-primary)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    backdropFilter: 'blur(10px)',
  };

  const sectionTitleStyle = {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 600,
    fontFamily: "'Outfit', var(--font-family)",
    marginBottom: 'var(--space-4)',
    color: 'var(--text-primary)',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div style={{
      padding: 'var(--space-6) var(--space-8)',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
    }} className="animate-fade-in">

      {/* Welcome Section */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{
          fontSize: 'var(--font-size-4xl)',
          fontFamily: "'Outfit', var(--font-family)",
          marginBottom: 'var(--space-2)',
        }}>
          Welcome back, <span style={{ color: 'var(--accent-primary)' }}>{user?.name || 'Farmer'}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-base)' }}>
          Here's an overview of your smart farming dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)',
      }}>
        <StatCard icon={<HiCube size={24} />} label="Total Farms" value={totalFarms} trend="up" trendValue="+1" color="green" />
        <StatCard icon={<HiGlobeAlt size={24} />} label="Total Area (acres)" value={totalArea || 0} trend="up" trendValue="Acres" color="blue" />
        <StatCard icon={<HiBeaker size={24} />} label="Recommendations Generated" value={recommendationsCount} trend="up" trendValue="Advice" color="green" />
        <StatCard icon={<HiChartBar size={24} />} label="Est. Profit (INR / acre)" value={farms.length > 0 ? "₹15K - ₹35K" : "₹0"} trend="up" trendValue="Yield" color="blue" />
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-8)',
      }}>

        {/* Weather Card */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <HiSun size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--warning)' }} />
            Weather Forecast {farms.length > 0 ? `(${farms[0].name})` : ''}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-4)',
          }}>
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Temperature</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {weather ? `${weather.temperature.toFixed(1)}°C` : '28.5°C'}
              </div>
            </div>
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Condition</div>
              <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                {weather ? weather.condition : 'Partly Cloudy'}
              </div>
            </div>
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Humidity</div>
              <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--info)' }}>
                {weather ? `${weather.humidity}%` : '65.0%'}
              </div>
            </div>
            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>Wind Speed</div>
              <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                {weather ? `${weather.windSpeed} km/h` : '12.0 km/h'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <HiCog size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--accent-primary)' }} />
            Quick Actions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Link to="/farms/new" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
              <HiPlus size={18} /> Add Farm
            </Link>
            <Link to="/recommendation" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <HiBeaker size={18} /> Get Crop Advice
            </Link>
            <Link to="/irrigation" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <HiCloudArrowDown size={18} /> Irrigation Plan
            </Link>
            <Link to="/resources" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <HiCube size={18} /> Track Resources
            </Link>
            <Link to="/action-plans" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <HiCalendar size={18} /> Task Planner
            </Link>
            <Link to="/farms" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              <HiGlobeAlt size={18} /> View Plots
            </Link>
          </div>
        </div>
      </div>

      {/* Resource & Tasks Summaries */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-8)',
      }}>
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <HiCube size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--info)' }} />
            Resource Management Summary
          </h3>
          {resourceSummary ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                <span>Remaining Water:</span>
                <strong style={{ color: 'var(--info)' }}>{resourceSummary.waterRemaining.toLocaleString()} Liters</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                <span>Remaining Budget:</span>
                <strong style={{ color: 'var(--success)' }}>₹{resourceSummary.budgetRemaining.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                <span>Remaining Labour:</span>
                <strong style={{ color: 'var(--warning)' }}>{resourceSummary.labourRemaining.toLocaleString()} hours</strong>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              No resource log allocations recorded yet. Allocate seeds, fertilizer funds, and water cycles to see summaries here.
            </p>
          )}
        </div>

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <HiArrowTrendingUp size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--success)' }} />
            Crop Advisory Insights
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Soil type: <strong>{farms.length > 0 ? (farms[0].soilType || 'Not Specified') : 'Register plot'}</strong>.
            Coordinates: <strong>{farms.length > 0 && farms[0].latitude ? `${farms[0].latitude}, ${farms[0].longitude}` : 'No coordinates'}</strong>.
          </p>
          <Link to="/recommendation" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            Run Suitability Assessment →
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Recent Activity & Scheduled Tasks</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {activitiesToDisplay.map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              borderLeft: `3px solid var(--${item.type === 'accent' ? 'accent-primary' : item.type})`,
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{item.action}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>{item.detail}</div>
              </div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 'var(--space-4)' }}>
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
