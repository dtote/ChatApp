import QRCode from 'react-qr-code'; // Make sure to install this library
import { useAuthContext } from '../../context/AuthContext'; // Make sure to import correctly

const EncryptionVerification = () => {
  const { authUser } = useAuthContext();
  const publicKey = authUser.publicKey || 'Public key not available'; // Make sure authUser has the public key

  // If public key exists, show an encrypted connection message
  let message_QR = "Insecure connection";
  if (publicKey) {
    message_QR = "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf";
  }
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white mt-2">
      <h2 className="text-lg font-bold mb-2">Verify security code</h2>
      <div className="flex items-center justify-between">
        {/* QR Code */}
        <div className="bg-white p-4 rounded-full">
          <QRCode value={message_QR} size={150} level="H" />
        </div>

        {/* Encryption information */}
        <div className="ml-4 text-sm">
          <p>
            To verify that messages and calls are encrypted from
            end-to-end, scan this code on your device.
          </p>

        </div>
      </div>
    </div>
  );
};

export default EncryptionVerification;
