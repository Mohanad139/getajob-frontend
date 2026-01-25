import React, { useState, useEffect } from 'react';
import { jobsAPI } from '../services/api';
import { parseError } from '../services/utils';

const SkippedJobs = () => {
  const [skippedJobs, setSkippedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSkippedJobs();
  }, []);

  const loadSkippedJobs = async () => {
    try {
      const response = await jobsAPI.getSkipped();
      setSkippedJobs(response.data || []);
    } catch (error) {
      console.error('Error loading skipped jobs:', error);
      setMessage({ type: 'error', text: 'Failed to load skipped jobs.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (job) => {
    try {
      await jobsAPI.save({
        title: job.title,
        company: job.company,
        location: job.location || null,
        salary: job.salary || null,
        description: job.description || null,
        url: job.url || null,
        job_type: job.job_type || null,
        posted_date: job.posted_date || null
      });
      // Remove from skipped list
      await jobsAPI.removeSkipped(job.id);
      setSkippedJobs(prev => prev.filter(j => j.id !== job.id));
      setMessage({ type: 'success', text: 'Job saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: parseError(error) || 'Failed to save job.' });
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to remove this job from skipped list?')) return;

    try {
      await jobsAPI.removeSkipped(jobId);
      setSkippedJobs(prev => prev.filter(job => job.id !== jobId));
      setMessage({ type: 'success', text: 'Job removed from skipped list!' });
    } catch (error) {
      setMessage({ type: 'error', text: parseError(error) || 'Failed to remove job.' });
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Skipped Jobs</h1>
        <p style={{ color: '#6b7280', marginTop: '8px' }}>
          Jobs you've skipped. Save them or remove them permanently.
        </p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : skippedJobs.length === 0 ? (
        <div className="empty-state">
          <h3>No skipped jobs</h3>
          <p>Jobs you skip during search will appear here</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {skippedJobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <div>
                  <h3>{job.title}</h3>
                  <p className="company">{job.company}</p>
                  <p className="location">{job.location}</p>
                </div>
              </div>
              {job.salary && (
                <p style={{ color: '#059669', fontWeight: '500', marginBottom: '12px' }}>
                  {job.salary}
                </p>
              )}
              {job.description && (
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '12px' }}>
                  {job.description.substring(0, 150)}...
                </p>
              )}
              {job.posted_date && (
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '12px' }}>
                  Posted: {new Date(job.posted_date).toLocaleDateString()}
                </p>
              )}
              <div className="job-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleSaveJob(job)}>
                  Save
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(job.id)}>
                  Delete
                </button>
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                    View
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkippedJobs;
