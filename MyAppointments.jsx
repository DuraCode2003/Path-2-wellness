import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaEdit, FaTrash, FaArrowLeft, FaFilePdf, FaDownload, FaSpinner } from 'react-icons/fa';
import jsPDF from 'jspdf';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Mock patient ID - in a real app, get from context/auth
  const patientId = '659631b7bace152d00f8b6a0';
  
  useEffect(() => {
    fetchAppointments();
  }, []);
  
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching appointments for patient:', patientId);
      
      // Try using fetch API instead of axios for better error handling
      const response = await fetch(`http://localhost:5000/api/appointments/patient/${patientId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fetched appointments:', data);
      
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to fetch appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (id) => {
    setDeleteConfirmation(id);
  };
  
  const confirmDelete = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Attempting to delete appointment ID:', deleteConfirmation);
      
      // Use the direct deletion endpoint instead of the regular route
      const response = await fetch(`http://localhost:5000/api/direct-delete-appointment/${deleteConfirmation}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Log the raw response status and headers
      console.log('Delete response status:', response.status);
      console.log('Delete response headers:', Object.fromEntries([...response.headers.entries()]));
      
      // Get the full response text
      const responseText = await response.text();
      console.log('Delete response text:', responseText);
      
      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Delete response parsed as JSON:', responseData);
      } catch (e) {
        responseData = { message: responseText || 'Unknown response' };
        console.log('Delete response is not valid JSON, using text instead');
      }
      
      // Handle based on response status
      if (response.ok) {
        console.log('Appointment successfully deleted');
        // Optimistically update UI by removing deleted appointment
        setAppointments(appointments.filter(app => app._id !== deleteConfirmation));
        setDeleteConfirmation(null);
        
        // Show success message
        setError(''); // Clear any previous errors
      } else {
        // Handle specific error cases
        if (response.status === 404) {
          throw new Error('Appointment not found - it may have already been deleted');
        } else {
          throw new Error(responseData.message || `Server error (${response.status})`);
        }
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setError(`Failed to delete appointment: ${error.message}`);
    } finally {
      setLoading(false);
      // Always refresh the appointments list to ensure it's up to date
      fetchAppointments();
    }
  };
  
  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating appointment:', selectedAppointment._id);
      console.log('Update data:', { reason: selectedAppointment.reason });
      
      // Only send the data that's changing to simplify the update
      const updateData = {
        reason: selectedAppointment.reason,
        // Don't include other fields unless they're being changed
      };
      
      // Use try/catch with fetch instead of axios for better error handling
      const response = await fetch(`http://localhost:5000/api/appointments/${selectedAppointment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Server returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Appointment updated successfully:', data);
      
      setAppointments(
        appointments.map(app => 
          app._id === selectedAppointment._id ? data : app
        )
      );
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pending</span>;
      case 'confirmed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Confirmed</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Cancelled</span>;
      case 'no-show':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">No-show</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const generateReport = () => {
    try {
      setGeneratingReport(true);
      
      // Create PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 255);
      doc.text("MY APPOINTMENTS REPORT", 20, 20);
      
      // Add report metadata
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
      doc.text(`Patient ID: ${patientId}`, 20, 40);
      
      // Add appointments header
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 150);
      doc.text("APPOINTMENTS", 20, 50);
      
      if (appointments.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("No appointments found.", 20, 60);
      } else {
        let yPos = 60;
        
        // Add appointments
        appointments.forEach((appointment, index) => {
          doc.setFillColor(240, 240, 240);
          doc.rect(20, yPos - 5, 170, 40, 'F');
          
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text(`Appointment ${index + 1}`, 25, yPos);
          
          doc.setFontSize(10);
          doc.text(`Queue Number: ${appointment.queueNumber}`, 30, yPos + 8);
          doc.text(`Doctor: ${appointment.doctor?.name || 'Unknown'}`, 30, yPos + 16);
          doc.text(`Date & Time: ${formatDate(appointment.appointmentDate)}`, 30, yPos + 24);
          doc.text(`Status: ${appointment.status.toUpperCase()}`, 120, yPos + 8);
          
          // Reason is often longer, so we give it more space
          doc.text("Reason for visit:", 30, yPos + 32);
          
          // Word wrap for the reason text
          const splitReason = doc.splitTextToSize(appointment.reason, 150);
          doc.text(splitReason, 35, yPos + 40);
          
          // Increase vertical position based on reason text length
          yPos += 50 + (splitReason.length - 1) * 5;
          
          // Add a page if we're near the bottom
          if (yPos > 270 && index < appointments.length - 1) {
            doc.addPage();
            yPos = 20;
          }
        });
      }
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount} - Doctor Appointment System`, 20, 290);
      }
      
      // Save the PDF
      doc.save(`appointments-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setGeneratingReport(false);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      setError('Failed to generate PDF report');
      setGeneratingReport(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
          <div className="flex space-x-4">
            <button
              onClick={generateReport}
              disabled={loading || generatingReport || appointments.length === 0}
              className={`flex items-center text-white px-4 py-2 rounded-md ${
                loading || generatingReport || appointments.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {generatingReport ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FaDownload className="mr-2" />
                  Generate Report
                </>
              )}
            </button>
            <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Loading appointments...</p>
          </div>
        ) : (
          <>
            {appointments.length === 0 ? (
              <div className="text-center py-10">
                <FaCalendarAlt className="mx-auto text-5xl text-gray-300 mb-4" />
                <p className="text-gray-600 mb-6">You don't have any appointments yet.</p>
                <Link
                  to="/appointment"
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Book an Appointment
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left">Queue #</th>
                      <th className="p-3 text-left">Doctor</th>
                      <th className="p-3 text-left">Date & Time</th>
                      <th className="p-3 text-left">Reason</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{appointment.queueNumber}</td>
                        <td className="p-3">{appointment.doctor?.name || 'Unknown'}</td>
                        <td className="p-3">{formatDate(appointment.appointmentDate)}</td>
                        <td className="p-3 max-w-xs truncate">{appointment.reason}</td>
                        <td className="p-3">{getStatusBadge(appointment.status)}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleEditClick(appointment)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(appointment._id)}
                            className="text-red-500 hover:text-red-700 p-1 ml-2"
                            disabled={appointment.status === 'completed'}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Edit Modal */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Update Appointment</h2>
            
            <form onSubmit={handleUpdateAppointment}>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Doctor</label>
                <p className="p-2 bg-gray-50 rounded">{selectedAppointment.doctor?.name || 'Unknown'}</p>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Appointment Date</label>
                <p className="p-2 bg-gray-50 rounded">{formatDate(selectedAppointment.appointmentDate)}</p>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Reason for Visit</label>
                <textarea
                  value={selectedAppointment.reason}
                  onChange={(e) => setSelectedAppointment({...selectedAppointment, reason: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium">Status</label>
                <p className="p-2 bg-gray-50 rounded">{getStatusBadge(selectedAppointment.status)}</p>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this appointment? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
