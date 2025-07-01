'use client';

import { useState } from 'react';
import WaitlistModal from './WaitlistModal'; // Will be created in the next step

export default function WaitlistFallback() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          No Workshops Currently Scheduled
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
          We're busy preparing our next lineup of insightful workshops. Join the waitlist to be the first to know when new cohorts are announced!
        </p>
        <button
          onClick={openModal}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-150 ease-in-out"
        >
          Join Waitlist
        </button>
      </div>
      <WaitlistModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
