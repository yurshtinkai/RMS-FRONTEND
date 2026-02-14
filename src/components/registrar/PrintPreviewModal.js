import React, { useState, useEffect } from 'react';
import './PrintPreviewModal.css'; // We will create this CSS file next

function PrintPreviewModal({ initialContent, styles, onClose }) {
    const [editedContent, setEditedContent] = useState(initialContent);

    // This allows the content to be editable directly in the modal
    useEffect(() => {
        const editableContent = document.getElementById('printable-content');
        if (editableContent) {
            editableContent.innerHTML = initialContent;
        }
    }, [initialContent]);

    const handleFinalPrint = () => {
        const contentToPrint = document.getElementById('printable-content').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Document</title>
                    <style>${styles}</style>
                </head>
                <body>
                    ${contentToPrint}
                    <script>
                        setTimeout(() => { 
                            window.print(); 
                            window.close(); 
                        }, 250);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
        onClose(); // Close the modal after printing
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content print-preview-modal" onClick={(e) => e.stopPropagation()}>
                <style>{styles}</style>
                <div className="modal-header">
                    <h4 className="modal-title">Edit and Print Document</h4>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>
                <div className="modal-body">
                    {/* The contenteditable attribute makes this div's content editable */}
                    <div id="printable-content" contentEditable={true} className="editable-area">
                        {/* The content will be injected here by the useEffect hook */}
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={handleFinalPrint}>
                        <i className="fas fa-print me-2"></i>Print Now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PrintPreviewModal;