import React, { useState, useEffect, useContext } from 'react';
import { Briefcase, MapPin, Calendar, CheckCircle, Plus, AlertCircle, CheckCircle2, Award, UserCheck, Search } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function EmploymentPage() {
  const { user, isAuthority, isAdmin } = useContext(AuthContext);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [appliedJobs, setAppliedJobs] = useState({});
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Authority Create Job Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    type: 'MGNREGA 100-Day Work',
    department: 'Panchayat Engineering Wing',
    stipendOrSalary: '₹311 / day',
    deadline: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    description: '',
  });

  // Citizen Skill Registration Modal State
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [userSkill, setUserSkill] = useState('Plumbing & Pipefitting');
  const [experienceYears, setExperienceYears] = useState('2');
  const [registeredSkills, setRegisteredSkills] = useState(['Electrician', 'Plumbing', 'MGNREGA Card Holder']);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/api/v1/jobs');
      setJobs(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch job opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      setError('');
      setSuccessMsg('');
      await axios.post(`/api/v1/jobs/${jobId}/apply`, {
        applicantName: user?.name || 'Verified Citizen',
        phone: user?.phoneNumber || '+919876543210',
      });
      setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
      setSuccessMsg('✅ Application submitted! Ward Employment Officer will contact you.');
    } catch (err) {
      setError(err.response?.data?.error || 'Application failed');
    }
  };

  const handleCreateJobSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await axios.post('/api/v1/jobs', {
        ...newJob,
        locationName: `Ward ${user?.wardNumber || '4'} Panchayat Center`,
      });
      setSuccessMsg(`✅ Employment posting "${newJob.title}" created successfully!`);
      setShowAddModal(false);
      setNewJob({
        title: '',
        type: 'MGNREGA 100-Day Work',
        department: 'Panchayat Engineering Wing',
        stipendOrSalary: '₹311 / day',
        deadline: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
        description: '',
      });
      fetchJobs();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create job posting.');
    }
  };

  const handleRegisterSkill = (e) => {
    e.preventDefault();
    if (!registeredSkills.includes(userSkill)) {
      setRegisteredSkills([...registeredSkills, userSkill]);
    }
    setShowSkillModal(false);
    setSuccessMsg(`🌟 Skill "${userSkill}" added to your verified citizen employment profile!`);
  };

  const filteredJobs = jobs.filter((j) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Internship') return j.type === 'internship';
    if (selectedFilter === 'Workshop & Technical') return j.category === 'Workshop' || j.category === 'Electrical' || j.category === 'Tailoring & Craft';
    if (selectedFilter === 'Front Office') return j.category === 'Front Office' || j.category === 'Clerical';
    return j.type === selectedFilter || j.category === selectedFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div
        className="card glass-panel"
        style={{
          background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '16px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderLeft: '4px solid #3B82F6',
        }}
      >
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontWeight: '700', color: '#60A5FA' }}>
            <Briefcase size={30} /> Community Employment & Internship Exchange
          </h2>
          <p style={{ margin: '6px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
            Panchayat Internships, Auto Workshop Traineeships, Front Office Jobs & MGNREGA Allocations
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setShowSkillModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px' }}
          >
            <Award size={18} /> Register My Skills
          </button>

          {(isAuthority || isAdmin) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px' }}
            >
              <Plus size={18} /> Post Work Vacancy
            </button>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div style={{ background: '#FEE2E2', borderLeft: '4px solid #EF4444', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={20} /> <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#D1FAE5', borderLeft: '4px solid #10B981', color: '#065F46', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} /> <span>{successMsg}</span>
        </div>
      )}

      {/* Citizen Registered Skills Tags */}
      <div className="card glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserCheck size={18} color="var(--primary)" /> Your Citizen Skill Passport:
        </span>
        {registeredSkills.map((s) => (
          <span key={s} className="badge badge-success" style={{ background: '#DBEAFE', color: '#1E40AF', padding: '6px 12px', borderRadius: '16px', fontWeight: '600', fontSize: '0.85rem' }}>
            ✓ {s}
          </span>
        ))}
      </div>

      {/* Job Type Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {['All', 'Internship', 'Workshop & Technical', 'Front Office', 'MGNREGA 100-Day Work'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className="btn"
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              border: selectedFilter === cat ? 'none' : '1px solid #D1D5DB',
              background: selectedFilter === cat ? 'var(--primary)' : 'white',
              color: selectedFilter === cat ? 'white' : 'var(--text-main)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Job Directory List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading local job opportunities...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="card glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Briefcase size={48} opacity={0.3} style={{ marginBottom: '12px' }} />
          <h3>No employment listings found in category '{selectedFilter}'</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredJobs.map((job) => (
            <div key={job._id} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderRadius: '12px', padding: '22px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--primary)', fontWeight: '700' }}>{job.title}</h3>
                <span className="badge" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: '700', fontSize: '0.75rem' }}>
                  {job.type}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} /> {job.department || 'Panchayat Wing'} - {job.locationName || `Ward ${user?.wardNumber || '4'}`}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} /> Apply Deadline: {new Date(job.deadline || Date.now() + 86400000 * 7).toLocaleDateString()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#059669', fontSize: '1rem' }}>
                  💰 Wage: {job.stipendOrSalary}
                </span>
              </div>

              <button
                className={`btn ${appliedJobs[job._id] ? 'btn-secondary' : 'btn-primary'}`}
                style={{ marginTop: 'auto', width: '100%', padding: '10px', fontWeight: '600' }}
                onClick={() => handleApply(job._id)}
                disabled={appliedJobs[job._id]}
              >
                {appliedJobs[job._id] ? <><CheckCircle size={18} /> Application Registered</> : '1-Click Apply via Citizen Profile'}
              </button>

            </div>
          ))}
        </div>
      )}

      {/* Authority Add Job Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '16px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)', fontWeight: '700' }}>Post Work Opportunity</h3>
              <button onClick={() => setShowAddModal(false)} className="btn" style={{ background: 'transparent', padding: '4px 8px', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleCreateJobSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Work Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ward 4 Canal Desiltation & Repair"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="glass-panel"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Work Category *</label>
                  <select
                    value={newJob.type}
                    onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                    className="glass-panel"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  >
                    <option value="MGNREGA 100-Day Work">MGNREGA 100-Day Work</option>
                    <option value="Panchayat Maintenance">Panchayat Maintenance</option>
                    <option value="Local Business Vacancy">Local Business Vacancy</option>
                    <option value="Skill Training">Skill Training Camp</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Wage / Stipend *</label>
                  <input
                    type="text"
                    required
                    placeholder="₹311 / day"
                    value={newJob.stipendOrSalary}
                    onChange={(e) => setNewJob({ ...newJob, stipendOrSalary: e.target.value })}
                    className="glass-panel"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Deadline *</label>
                <input
                  type="date"
                  required
                  value={newJob.deadline}
                  onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                  className="glass-panel"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '8px', fontWeight: '600' }}>
                Post to Employment Directory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Citizen Register Skill Modal */}
      {showSkillModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '28px', borderRadius: '16px', background: 'white' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)', fontWeight: '700' }}>Register Skill in Exchange</h3>
              <button onClick={() => setShowSkillModal(false)} className="btn" style={{ background: 'transparent', padding: '4px 8px', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleRegisterSkill} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Skill Specialization</label>
                <select
                  value={userSkill}
                  onChange={(e) => setUserSkill(e.target.value)}
                  className="glass-panel"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontWeight: '600' }}
                >
                  <option value="Plumbing & Pipefitting">Plumbing & Pipefitting</option>
                  <option value="Electrical Repair & Wiring">Electrical Repair & Wiring</option>
                  <option value="Masonry & Concrete Construction">Masonry & Construction</option>
                  <option value="Organic Farming & Gardening">Organic Farming & Gardening</option>
                  <option value="Motor Driver & Transport">Heavy Vehicle / LMV Driver</option>
                  <option value="MGNREGA Job Card Holder">MGNREGA Card Holder</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="glass-panel"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '8px', fontWeight: '600' }}>
                Save Skill to Citizen Profile
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
