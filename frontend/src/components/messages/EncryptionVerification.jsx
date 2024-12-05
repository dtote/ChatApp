
const EncryptionVerification = () => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md text-white mt-2">
      <h2 className="text-lg font-bold mb-2">Verificar código de seguridad</h2>
      <div className="flex items-center justify-between">
        {/* Código QR */}
        <div className="bg-white p-4 rounded-full">
          <img
            src="https://via.placeholder.com/150" // Aquí iría el código QR real o una imagen
            alt="Código QR"
            className="h-32 w-32"
          />
        </div>

        {/* Información del cifrado */}
        <div className="ml-4 text-sm">
          <p>
            Para verificar que los mensajes y las llamadas están cifrados de
            extremo a extremo, escanea este código en su dispositivo. También
            puedes comparar el número de la parte superior en su lugar.
          </p>
          <div className="mt-4 text-gray-400">
            <span>58982 43644 07457 41249</span>
            <br />
            <span>05492 43445 66788 46318</span>
            <br />
            <span>66702 37705 68016 69370</span>
          </div>
        </div>
      </div>        

      <div className="flex justify-center mt-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
          Escanear código
        </button>
      </div>
    </div>
  );
};

export default EncryptionVerification;
