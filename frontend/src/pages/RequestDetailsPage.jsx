import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

function RequestDetailsPage() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const response = await api.get(`/requests/${id}`);
        setRequest(response.data.request);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [id]);

  if (loading) {
    return <div className="container page-loading">Loading request...</div>;
  }

  if (!request) {
    return (
      <div className="container page-empty">
        <p>Request not found.</p>
        <Link to="/student" className="secondary-button">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container details-shell">
      <div className="details-header">
        <div>
          <span className="eyebrow">Request details</span>
          <h2>{request.title}</h2>
        </div>
        <Link to="/student" className="secondary-button">
          Back to dashboard
        </Link>
      </div>

      <article className="panel-card detail-panel">
        <div className="detail-meta-row">
          <span>Category: {request.category}</span>
          <span>Location: {request.location}</span>
          <span>Priority: {request.priority}</span>
          <span className={`status-pill ${request.status === 'open' ? 'status-open' : request.status === 'in_progress' ? 'status-progress' : 'status-resolved'}`}>
            {request.status === 'in_progress' ? 'In Progress' : request.status}
          </span>
        </div>

        <div className="detail-section">
          <h3>Description</h3>
          <p>{request.description}</p>
        </div>

        <div className="detail-grid">
          <div>
            <span className="label-text">Assigned to</span>
            <strong>{request.assignedTo || 'Unassigned'}</strong>
          </div>
          <div>
            <span className="label-text">Created</span>
            <strong>{new Date(request.createdAt).toLocaleString()}</strong>
          </div>
          <div>
            <span className="label-text">Last updated</span>
            <strong>{new Date(request.updatedAt).toLocaleString()}</strong>
          </div>
        </div>
      </article>
    </div>
  );
}

export default RequestDetailsPage;
