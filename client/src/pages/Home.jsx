import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Search, ShieldCheck, Zap, Award, Calendar, ArrowRight, Star, Clock } from 'lucide-react';
import { getVehicles } from '../services/vehicleApi';
import VehicleGrid from '../components/VehicleGrid';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await getVehicles();
        if (res.success && res.data) {
          setFeaturedVehicles(res.data.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load home vehicles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/vehicles?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/vehicles');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      
      {/* HERO SECTION */}
      <section className="glass-panel" style={{ padding: '4rem 2rem', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--accent-glow)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span className="badge badge-confirmed" style={{ marginBottom: '1rem', padding: '0.4rem 1rem' }}>
            ⚡ Premium Vehicle Rental Platform
          </span>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: '1.15', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
            Drive Your Next Adventure With Confidence
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Book premium cars, luxury sedans, electric vehicles, and SUVs in seconds with transparent pricing, instant date-availability verification, and zero hidden fees.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleHeroSearch} className="hero-search-form" style={{ display: 'flex', gap: '0.5rem', maxWidth: '600px', margin: '0 auto', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingLeft: '0.75rem', gap: '0.5rem' }}>
              <Search size={20} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search brand, model or type (e.g. Tesla, BMW)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.95rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Find Vehicle
            </button>
          </form>
        </div>
      </section>

      {/* STATS HIGHLIGHT */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Car size={24} />
          </div>
          <div className="stat-info">
            <h3>50+</h3>
            <p>Verified Vehicles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-secondary)' }}>
            <Zap size={24} />
          </div>
          <div className="stat-info">
            <h3>Instant</h3>
            <p>Date Availability Check</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>100%</h3>
            <p>Double-Booking Protection</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Star size={24} />
          </div>
          <div className="stat-info">
            <h3>4.9 / 5</h3>
            <p>Verified Ratings</p>
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <section>
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>
              Handpicked Fleet
            </span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.2rem' }}>Featured Fleet Available Today</h2>
          </div>
          <Link to="/vehicles" className="btn btn-secondary">
            View All Fleet <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching fleet vehicles..." />
        ) : (
          <VehicleGrid vehicles={featuredVehicles} />
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="card" style={{ padding: '3rem 2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>
            Simple Booking Process
          </span>
          <h2 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>How DrivePulse Works</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
              1
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Choose Your Ride</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Browse our verified fleet ranging from electric vehicles to luxury SUVs and sports cars.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
              2
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Select Dates & Check</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Pick your pickup and drop-off dates. Our real-time algorithm checks date range availability.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>
              3
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Confirm & Drive</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Receive instant booking reference confirmation and hit the road smoothly.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)' }}>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Ready to Reserve Your Next Journey?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
          Join thousands of satisfied drivers. Search our available vehicles now and enjoy effortless vehicle rentals.
        </p>
        <Link to="/vehicles" className="btn btn-primary btn-lg">
          Browse Vehicles Now <ArrowRight size={18} />
        </Link>
      </section>

    </div>
  );
};

export default Home;
