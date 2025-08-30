import React, { useState } from "react";
import { toast } from "react-toastify";
import instance from "../../Axios/axiosConfig";

const ReportModal = ({ isOpen, onClose, postId }) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason.trim()) {
            toast.error('Please enter a reason for reporting');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await instance.post('/api/report/create', {
                PostId: postId,
                Reason: reason.trim()
            });

            if (response.data.success) {
                toast.success('Report submitted successfully');
                onClose();
                setReason('');
            } else {
                toast.error(response.data.message || 'Failed to submit report');
            }
        } catch (error) {
            console.error('Error submitting report:', error);

            if (error.response?.status === 409) {
                toast.info('You have already reported this post');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('An error occurred while submitting the report');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Report Post</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isSubmitting}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Why are you reporting this post?
                        </label>
                        <textarea
                            placeholder="Please describe the reason for reporting this post..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows={4}
                            disabled={isSubmitting}
                            maxLength={500}
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">
                            {reason.length}/500 characters
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            disabled={isSubmitting || !reason.trim()}
                        >
                            {isSubmitting && <i className="fas fa-spinner fa-spin mr-2"></i>}
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;