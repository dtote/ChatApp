import React, { useState } from 'react';
import { FaShieldAlt, FaExclamationTriangle, FaClock, FaInfoCircle } from 'react-icons/fa';

const VerificationBadge = ({ verified, signature, publicKeyDSA, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getVerificationStatus = () => {
    if (verified === true) {
      return {
        icon: <FaShieldAlt className="w-3 h-3" />,
        text: "Verified",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        tooltip: "This message has been cryptographically verified"
      };
    } else if (verified === false) {
      return {
        icon: <FaExclamationTriangle className="w-3 h-3" />,
        text: "Unverified",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        tooltip: "This message could not be verified"
      };
    } else {
      return {
        icon: <FaClock className="w-3 h-3" />,
        text: "Verifying...",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        tooltip: "Verification in progress"
      };
    }
  };

  const status = getVerificationStatus();

  return (
    <div className="relative inline-block">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
          border shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer
          ${status.bgColor} ${status.borderColor} ${status.color}
        `}
      >
        {status.icon}
        <span>{status.text}</span>
        <FaInfoCircle className="w-2.5 h-2.5 opacity-60" />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 whitespace-nowrap backdrop-blur-sm">
          {status.tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default VerificationBadge; 