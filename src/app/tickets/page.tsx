"use client";

import { useState } from 'react';
import ChatBot from '../components/ChatBot';

const TicketsPage = () => {
  const [fromLocation, setFromLocation] = useState('Gedera');
  const [toLocation, setToLocation] = useState('Rehovot');
  const [travelDate, setTravelDate] = useState('Sat, Nov 22');
  const [passengers, setPassengers] = useState(2);
  const [showResults, setShowResults] = useState(true);
  const [selectedTab, setSelectedTab] = useState('All');
  const [selectedClass, setSelectedClass] = useState<{[key: number]: string}>({});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  const dateTabs = ['Today', 'Tomorrow', 'Fri, Nov 21', 'Sat, Nov 22', 'Sun, Nov 23', 'Mon, Nov 24', 'Tue, Nov 25', 'Pick Date'];

  const mockResults = [
    {
      id: 1,
      type: 'Bus',
      company: 'Gedera Central Bus Station',
      operator: 'Rodov Tours',
      departure: '22:45',
      arrival: '08:15',
      duration: '9h 30m',
      distance: '| Rodov Tours | Bus',
      price: 81,
      badge: 'Recommended',
      popularClass: 'Most popular class',
      cabinTypes: [
        { name: 'Upper Single Cabin', rating: 4.5, price: 81, amenities: 'Aircon, TV' }
      ]
    },
    {
      id: 2,
      type: 'Bus',
      company: 'Bilu Central Bus Station',
      operator: 'Rodov Tours',
      departure: '22:45',
      arrival: '08:15',
      duration: '9h 30m',
      distance: '| Rodov Tours | Bus',
      price: 88,
      badge: 'Recommended',
      popularClass: 'Most popular class',
      cabinTypes: [
        { name: 'Lower Single Cabin', rating: 4.5, price: 88, amenities: 'Aircon, TV' }
      ]
    },
    {
      id: 3,
      type: 'Bus',
      company: 'Weizman 33, Gedera',
      operator: 'Rodov Tours',
      departure: '22:00',
      arrival: '07:45',
      duration: '9h 45m',
      distance: '| Bus',
      price: 75,
      badge: 'Recommended',
      popularClass: 'Most popular class',
      cabinTypes: [
        { name: 'Upper Single Cabin', rating: 4.4, price: 75, amenities: 'Aircon, TV' }
      ]
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Hero Section with Background */}
      <div style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1528127269322-539801943592?w=1600")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '3rem 2rem',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '600' }}>
            {fromLocation} to {toLocation}
          </h1>
          <p style={{ margin: '0 0 2rem 0', opacity: 0.9 }}>20 kms (distance • duration)</p>

          {/* Inline Search Form */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '1rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-end',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>FROM</label>
              <input
                type="text"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <button style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0.5rem'
            }}>⇄</button>

            <div style={{ flex: '1 1 150px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>DESTINATION</label>
              <input
                type="text"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ flex: '1 1 130px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>DEPARTURE</label>
              <input
                type="text"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ flex: '1 1 130px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>RETURN</label>
              <input
                type="text"
                placeholder="+ Add return"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                  color: '#999'
                }}
              />
            </div>

            <div style={{ flex: '0 0 120px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>PASSENGERS</label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '0.95rem'
                }}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSearch}
              style={{
                flex: '0 0 100px',
                padding: '0.6rem 1.5rem',
                backgroundColor: '#7cb342',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Date Tabs */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.5rem', padding: '1rem 2rem' }}>
          {dateTabs.map(date => (
            <button
              key={date}
              style={{
                padding: '0.5rem 1rem',
                border: date === travelDate ? '1px solid #7cb342' : '1px solid #e0e0e0',
                borderRadius: '4px',
                backgroundColor: date === travelDate ? '#f1f8e9' : 'white',
                color: date === travelDate ? '#7cb342' : '#666',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: date === travelDate ? '600' : '400'
              }}
            >
              {date}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {showResults && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'flex', gap: '2rem' }}>
          {/* Filters Sidebar */}
          <div style={{ flex: '0 0 280px' }}>
            {/* Transport Type Filter */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: selectedTab === 'All' ? '2px solid #7cb342' : '1px solid #e0e0e0',
                    borderRadius: '4px',
                    backgroundColor: selectedTab === 'All' ? '#f1f8e9' : 'white',
                    color: selectedTab === 'All' ? '#7cb342' : '#333',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}
                  onClick={() => setSelectedTab('All')}
                >
                  All <span style={{ color: '#7cb342' }}>20</span>
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: '#333',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  🚌 Buses 3
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: '#333',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  🚂 Trains 0
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Sort by</span>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Recommended ▼</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem' }}>Filters</h3>
                <div style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Departure time ▲</div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <input type="checkbox" style={{ marginRight: '0.5rem' }} />
                    00:00 - 06:00 <span style={{ color: '#999' }}>874+ 6</span>
                  </label>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <input type="checkbox" style={{ marginRight: '0.5rem' }} />
                    06:00 - 12:00 <span style={{ color: '#999' }}>869+ 16</span>
                  </label>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <input type="checkbox" style={{ marginRight: '0.5rem' }} />
                    12:00 - 18:00 <span style={{ color: '#999' }}>845+ 84</span>
                  </label>
                  <label style={{ display: 'block', fontSize: '0.85rem' }}>
                    <input type="checkbox" style={{ marginRight: '0.5rem' }} />
                    18:00 - 24:00 <span style={{ color: '#999' }}>859+ 109</span>
                  </label>
                </div>

                <div style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Transport type ▲</div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <input type="checkbox" style={{ marginRight: '0.5rem' }} />
                    🚌 Buses <span style={{ color: '#999' }}>845+ 192</span>
                  </label>
                  <label style={{ display: 'block', fontSize: '0.85rem' }}>
                    <input type="checkbox" style={{ marginRight: '0.5rem' }} />
                    🚂 Trains <span style={{ color: '#999' }}>876+ 17</span>
                  </label>
                </div>

                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Departure station ▲</div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                    Gedera Central Station 🚌🚂 64
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                    Bilu Central Station 🚌 50
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                    33 Weizman st. Gedera 🚌 26
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#7cb342', cursor: 'pointer' }}>See more</div>
                </div>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div style={{ flex: 1 }}>
            {mockResults.map(result => (
              <div
                key={result.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0'
                }}
              >
                {/* Badge */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {result.badge}
                  </span>
                </div>

                {/* Route Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {result.departure} {result.company}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                      🚌 {result.duration} {result.distance}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      🟢 {result.arrival} {result.operator}
                    </div>
                  </div>
                </div>

                {/* Cabin Class Options */}
                <div style={{
                  backgroundColor: '#f5f5f5',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    backgroundColor: '#3e2723',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    display: 'inline-block',
                    marginBottom: '0.5rem'
                  }}>
                    {result.popularClass}
                  </div>

                  {result.cabinTypes.map((cabin, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <div style={{
                            width: '60px',
                            height: '40px',
                            backgroundColor: '#ddd',
                            borderRadius: '4px',
                            backgroundImage: 'linear-gradient(135deg, #d4a574 50%, #8b6f47 50%)'
                          }} />
                          <div style={{
                            width: '60px',
                            height: '40px',
                            backgroundColor: '#ddd',
                            borderRadius: '4px',
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect fill=\'%2390caf9\' width=\'100\' height=\'100\'/%3E%3C/svg%3E")'
                          }} />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                            {cabin.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>
                            ⭐ {cabin.rating} 👤 {cabin.amenities}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#333', marginBottom: '0.25rem' }}>
                          {cabin.price} NIS
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#999', marginBottom: '0.5rem' }}>
                          Taxes included per adult
                        </div>
                        <button
                          style={{
                            padding: '0.5rem 1.5rem',
                            backgroundColor: '#7cb342',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Book now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#7cb342', cursor: 'pointer', marginTop: '0.5rem' }}>
                  ▼ 1 more class from {result.price} ILS
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ChatBot Component */}
      <ChatBot />
    </div>
  );
};

export default TicketsPage;
