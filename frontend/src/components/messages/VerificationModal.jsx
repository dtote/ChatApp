import React from 'react';
import { FaTimes, FaShieldAlt, FaExclamationTriangle, FaKey, FaSignature, FaCopy } from 'react-icons/fa';

const VerificationModal = ({ isOpen, onClose, verified, signature, publicKeyDSA, messageText }) => {
  if (!isOpen) return null;

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusInfo = () => {
    if (verified === true) {
      return {
        icon: <FaShieldAlt className="w-8 h-8 text-green-500" />,
        title: "Message Verified",
        subtitle: "This message has been cryptographically verified",
        color: "text-green-600",
        bgColor: "bg-green-50"
      };
    } else if (verified === false) {
      return {
        icon: <FaExclamationTriangle className="w-8 h-8 text-orange-500" />,
        title: "Verification Failed",
        subtitle: "This message could not be cryptographically verified",
        color: "text-orange-600",
        bgColor: "bg-orange-50"
      };
    } else {
      return {
        icon: <FaShieldAlt className="w-8 h-8 text-blue-500" />,
        title: "Verification Pending",
        subtitle: "This message is being verified",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 ${statusInfo.bgColor} rounded-t-lg`}>
          <div className="flex items-center gap-3">
            {statusInfo.icon}
            <div>
              <h2 className={`text-xl font-bold ${statusInfo.color}`}>
                {statusInfo.title}
              </h2>
              <p className="text-gray-600 text-sm">
                {statusInfo.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Message Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Message Content</h3>
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800 max-h-20 overflow-y-auto">
              {messageText || "No message content available"}
            </div>
          </div>

          {/* Signature */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FaSignature className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Digital Signature</h3>
              </div>
              <button
                onClick={() => handleCopy(signature, 'signature')}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Copy signature"
              >
                <FaCopy className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <code className="text-xs text-gray-600 break-all">
                {signature ?
                  `${signature.substring(0, 32)}...${signature.substring(signature.length - 8)}` :
                  "No signature available"
                }
              </code>
            </div>
          </div>

          {/* Public Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FaKey className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Public Key</h3>
              </div>
              <button
                onClick={() => handleCopy(publicKeyDSA, 'public key')}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Copy public key"
              >
                <FaCopy className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <code className="text-xs text-gray-600 break-all">
                {publicKeyDSA ?
                  `${publicKeyDSA.substring(0, 32)}...${publicKeyDSA.substring(publicKeyDSA.length - 8)}` :
                  "No public key available"
                }
              </code>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">How Verification Works</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Messages are signed using ML-DSA-44 algorithm</li>
              <li>• Signatures are verified against the sender's public key</li>
              <li>• Verification ensures message authenticity and integrity</li>
              <li>• Failed verification may indicate tampering or key issues</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal; 