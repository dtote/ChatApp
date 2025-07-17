import QRCode from 'react-qr-code'; // Asegúrate de instalar esta biblioteca
import { useAuthContext } from '../../context/AuthContext'; // Asegúrate de importar correctamente

const EncryptionVerification = () => {
  const { authUser } = useAuthContext(); // Obtener el usuario autenticado
  console.log(authUser);
  const publicKey = authUser.publicKey || 'Public key not available'; // Asegúrate de que authUser tenga la clave pública


  // Si existe clave publica mostrar un mensaje de Conexión cifrada
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
