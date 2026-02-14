import React from 'react';

function PlaceholderView({ title }) {
    return (
        <div className="container text-center mt-5">
            <i className="fas fa-cogs fa-5x text-muted mb-4"></i>
            <h2>{title}</h2>
            <p className="lead text-muted">This module is not yet available.</p>
        </div>
    );
}

export default PlaceholderView;
