import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const emptyForm = {
  title: '',
  category: 'Classroom',
  location: 'Main Building',
  description: '',
  priority: 'Medium',
};

function StudentDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    try {
      const response = await api.get('/requests');
      setRequests(response.data.requests || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await api.post('/requests', form);
      setForm(emptyForm);
      loadRequests();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit request.');
    }
  };

  return (
    <div className="dashboard-shell container">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Student portal</span>
          <h2>Welcome, {user?.name}</h2>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel-card form-panel">
          <div className="panel-title-row">
            <h3>Raise a service request</h3>
          </div>

          <form onSubmit={handleSubmit} className="stack-form">
            <label>
              Title
              <input type="text" name="title" value={form.title} onChange={handleChange} required />
            </label>

            <div className="split-grid">
              <label>
                Category
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="Classroom">Classroom</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Library">Library</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="IT / Network">IT / Network</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Priority
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
            </div>

            <label>
              Location
              <input type="text" name="location" value={form.location} onChange={handleChange} required />
            </label>

            <label>
              Description
              <textarea name="description" value={form.description} onChange={handleChange} rows={5} required />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="primary-button full-width">
              Submit Request
            </button>
          </form>
        </section>

        <section className="panel-card list-panel">
          <div className="panel-title-row">
            <h3>My requests</h3>
          </div>

          {loading ? (
            <p className="empty-state">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="empty-state">No requests submitted yet.</p>
          ) : (
            <div className="request-list">
              {requests.map((request) => (
                <article key={request.id} className="request-card">
                  <div className="request-card-header">
                    <div>
                      <Link to={`/requests/${request.id}`} className="request-title">
                        {request.title}
                      </Link>
                      <p className="muted-label">{request.category}</p>
                    </div>
                    <span className={`status-pill ${request.status === 'open' ? 'status-open' : request.status === 'in_progress' ? 'status-progress' : 'status-resolved'}`}>
                      {request.status === 'in_progress' ? 'In Progress' : request.status}
                    </span>
                  </div>

                  <div className="meta-row">
                    <span>Location: {request.location}</span>
                    <span>Priority: {request.priority}</span>
                  </div>

                  <p className="request-description">{request.description}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default StudentDashboard;
