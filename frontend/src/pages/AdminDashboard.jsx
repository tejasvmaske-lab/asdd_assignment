import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0, high_priority: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchData = async () => {
    const [requestsResponse, statsResponse] = await Promise.all([
      api.get('/requests'),
      api.get('/stats'),
    ]);

    setRequests(requestsResponse.data.requests || []);
    setStats(statsResponse.data.stats || { total: 0, open: 0, in_progress: 0, resolved: 0, high_priority: 0 });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const keyword = search.toLowerCase();
      const matchesSearch =
        !keyword ||
        request.title.toLowerCase().includes(keyword) ||
        request.description.toLowerCase().includes(keyword) ||
        request.location.toLowerCase().includes(keyword) ||
        request.category.toLowerCase().includes(keyword);

      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [requests, search, statusFilter, categoryFilter]);

  const handleStatusChange = async (requestId, nextStatus) => {
    await api.patch(`/requests/${requestId}/status`, { status: nextStatus });
    fetchData();
  };

  const handleAssign = async (requestId, assignedTo) => {
    if (!assignedTo.trim()) {
      return;
    }

    await api.patch(`/requests/${requestId}/assign`, { assignedTo });
    fetchData();
  };

  return (
    <div className="dashboard-shell container admin-shell">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Admin dashboard</span>
          <h2>Service operations overview</h2>
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Requests</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card">
          <span>Open</span>
          <strong>{stats.open}</strong>
        </div>
        <div className="stat-card">
          <span>In Progress</span>
          <strong>{stats.in_progress}</strong>
        </div>
        <div className="stat-card">
          <span>Resolved</span>
          <strong>{stats.resolved}</strong>
        </div>
      </section>

      <section className="panel-card admin-list-panel">
        <div className="panel-title-row controls-row">
          <h3>Request management</h3>
          <div className="toolbar">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search requests"
            />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All categories</option>
              <option value="Classroom">Classroom</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Library">Library</option>
              <option value="Maintenance">Maintenance</option>
              <option value="IT / Network">IT / Network</option>
              <option value="Electrical">Electrical</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="request-table-wrap">
          <table className="request-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <Link to={`/requests/${request.id}`} className="request-title">
                      {request.title}
                    </Link>
                  </td>
                  <td>{request.category}</td>
                  <td>{request.location}</td>
                  <td>
                    <select
                      value={request.status}
                      onChange={(event) => handleStatusChange(request.id, event.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      defaultValue={request.assignedTo || ''}
                      onBlur={(event) => handleAssign(request.id, event.target.value)}
                      placeholder="Assign staff"
                    />
                  </td>
                  <td>
                    <span className={`status-pill ${request.status === 'open' ? 'status-open' : request.status === 'in_progress' ? 'status-progress' : 'status-resolved'}`}>
                      {request.status === 'in_progress' ? 'In Progress' : request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
