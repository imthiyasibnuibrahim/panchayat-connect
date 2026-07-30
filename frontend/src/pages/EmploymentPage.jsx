import React, { useState, useEffect, useContext } from 'react';
import { Briefcase, MapPin, Calendar, CheckCircle, Plus, AlertCircle, CheckCircle2, Award, UserCheck } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Sleek Mobile Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
          color: 'white',
          padding: '18px 20px',
          borderRadius: '14px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 14px rgba(6, 78, 59, 0.15)',
          border: 'none',
        }}
      >
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: '600', color: 'white', fontSize: '1.15rem' }}>
            <Briefcase size={22} /> Community Employment & Internships
          </h2>
          <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.82rem', color: '#E2E8F0' }}>
            Panchayat Internships, Auto Workshop Traineeships, Front Office & MGNREGA
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowSkillModal(true)}
            className="btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', fontSize: '0.78rem', fontWeight: '600' }}
          >
            <Award size={15} /> Register Skills
          </button>

          {(isAuthority || isAdmin) && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', background: '#F59E0B', color: 'white', border: 'none', fontSize: '0.78rem', fontWeight: '600' }}
            >
              <Plus size={15} /> Post Vacancy
            </button>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div style={{ background: '#FEE2E2', borderLeft: '3px solid #EF4444', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#DCFCE7', borderLeft: '3px solid #16A34A', color: '#166534', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
          <CheckCircle2 size={18} /> <span>{successMsg}</span>
        </div>
      )}

      {/* Citizen Registered Skills Tags */}
      <div className="card" style={{ padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <UserCheck size={16} color="var(--primary)" /> Citizen Skill Passport:
        </span>
        {registeredSkills.map((s) => (
          <span key={s} className="badge" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '3px 8px', borderRadius: '12px', fontWeight: '500', fontSize: '0.75rem' }}>
            ✓ {s}
          </span>
        ))}
      </div>

      {/* Modern Horizontal Scroll Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px', scrollbarWidth: 'none' }}>
        {['All', 'Internship', 'Workshop & Technical', 'Front Office', 'MGNREGA 100-Day Work'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className="btn"
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: selectedFilter === cat ? '600' : '500',
              whiteSpace: 'nowrap',
              border: selectedFilter === cat ? 'none' : '1px solid #E2E8F0',
              background: selectedFilter === cat ? 'var(--primary)' : 'white',
              color: selectedFilter === cat ? 'white' : 'var(--text-main)',
              boxShadow: selectedFilter === cat ? '0 2px 6px rgba(6, 78, 59, 0.2)' : 'none',
              flexShrink: 0,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Job Directory List */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading local opportunities...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Briefcase size={36} opacity={0.3} style={{ marginBottom: '8px' }} />
          <h4 style={{ margin: 0 }}>No listings found in '{selectedFilter}'</h4>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {filteredJobs.map((job) => (
            <div key={job._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary)', fontWeight: '600', lineHeight: 1.3 }}>{job.title}</h3>
                <span className="badge" style={{ background: job.type === 'internship' ? '#FEF3C7' : '#DCFCE7', color: job.type === 'internship' ? '#92400E' : '#15803D', fontWeight: '600', textTransform: 'capitalize', flexShrink: 0 }}>
                  {job.type}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} color="#64748B" /> {job.department || 'Panchayat Wing'} - {job.locationName || `Ward ${user?.wardNumber || '4'}`}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={14} color="#64748B" /> Deadline: {new Date(job.deadline || Date.now() + 86400000 * 7).toLocaleDateString()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', color: '#16A34A', fontSize: '0.85rem', marginTop: '2px' }}>
                  💰 Wage: {job.stipendOrSalary}
                </span>
              </div>

              <button
                className={`btn ${appliedJobs[job._id] ? 'btn-secondary' : 'btn-primary'}`}
                style={{ marginTop: 'auto', width: '100%', padding: '9px', fontWeight: '600', borderRadius: '8px', fontSize: '0.8rem' }}
                onClick={() => handleApply(job._id)}
                disabled={appliedJobs[job._id]}
              >
                {appliedJobs[job._id] ? <><CheckCircle size={16} /> Application Registered</> : '1-Click Apply via Citizen Profile'}
              </button>

            </div>
          ))}
        </div>
      )}

      {/* Authority Add Job Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '20px', borderRadius: '14px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)', fontWeight: '600', fontSize: '1.05rem' }}>Post Work Opportunity</h3>
              <button onClick={() => setShowAddModal(false)} className="btn" style={{ background: 'transparent', padding: '4px', fontSize: '1.1rem' }}>✕</button>
            </div>

            <form onSubmit={handleCreateJobSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Work Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ward 4 Auto Workshop Trainee"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Category *</label>
                  <select
                    value={newJob.type}
                    onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  >
                    <option value="internship">Internship / Trainee</option>
                    <option value="vacancy">Vacancy / Office Job</option>
                    <option value="MGNREGA 100-Day Work">MGNREGA 100-Day Work</option>
                    <option value="Skill Training">Skill Training Camp</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Wage / Stipend *</label>
                  <input
                    type="text"
                    required
                    placeholder="₹7,500 / month"
                    value={newJob.stipendOrSalary}
                    onChange={(e) => setNewJob({ ...newJob, stipendOrSalary: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Deadline *</label>
                <input
                  type="date"
                  required
                  value={newJob.deadline}
                  onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '10px', marginTop: '6px', fontWeight: '600' }}>
                Post Opportunity
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Citizen Register Skill Modal */}
      {showSkillModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '20px', borderRadius: '14px', background: 'white' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)', fontWeight: '600', fontSize: '1.05rem' }}>Register Skill Profile</h3>
              <button onClick={() => setShowSkillModal(false)} className="btn" style={{ background: 'transparent', padding: '4px', fontSize: '1.1rem' }}>✕</button>
            </div>

            <form onSubmit={handleRegisterSkill} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Skill Specialization</label>
                <select
                  value={userSkill}
                  onChange={(e) => setUserSkill(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '500' }}
                >
                  <option value="Plumbing & Pipefitting">Plumbing & Pipefitting</option>
                  <option value="Electrical Repair & Wiring">Electrical Repair & Wiring</option>
                  <option value="Masonry & Construction">Masonry & Construction</option>
                  <option value="Auto Workshop Repair">Auto Workshop Repair</option>
                  <option value="Front Office Assistant">Front Office Assistant</option>
                  <option value="MGNREGA Card Holder">MGNREGA Card Holder</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '10px', marginTop: '6px', fontWeight: '600' }}>
                Save Skill to Profile
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
