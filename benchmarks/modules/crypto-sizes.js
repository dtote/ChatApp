/**
 * Official Cryptographic Size Definitions
 * NIST-standardized sizes for keys, signatures, and ciphertexts
 */

export const CRYPTO_SIZES = {
  // ML-KEM (Kyber) - NIST FIPS 203 standard
  'ML-KEM-512': {
    publicKeySize: 800,
    privateKeySize: 1632,
    ciphertextSize: 768
  },
  'ML-KEM-768': {
    publicKeySize: 1184,
    privateKeySize: 2400,
    ciphertextSize: 1088
  },
  'ML-KEM-1024': {
    publicKeySize: 1568,
    privateKeySize: 3168,
    ciphertextSize: 1568
  },

  // ML-DSA (Dilithium) - NIST FIPS 204 standard
  'ML-DSA-44': {
    publicKeySize: 1952,
    privateKeySize: 4000,
    signatureSize: 2420
  },
  'ML-DSA-65': {
    publicKeySize: 2592,
    privateKeySize: 4864,
    signatureSize: 3293
  },
  'ML-DSA-87': {
    publicKeySize: 3360,
    privateKeySize: 6400,
    signatureSize: 4595
  },

  // Classical algorithms
  'RSA-2048': {
    publicKeySize: 256,
    privateKeySize: 2048,
    signatureSize: 256
  },
  'RSA-3072': {
    publicKeySize: 384,
    privateKeySize: 3072,
    signatureSize: 384
  },
  'RSA-4096': {
    publicKeySize: 512,
    privateKeySize: 4096,
    signatureSize: 512
  },

  // ECDSA - Approximate sizes by curve
  'ECDSA-prime256v1': {
    publicKeySize: 65,
    privateKeySize: 32,
    signatureSize: 71
  },
  'ECDSA-secp384r1': {
    publicKeySize: 97,
    privateKeySize: 48,
    signatureSize: 103
  },
  'ECDSA-secp521r1': {
    publicKeySize: 133,
    privateKeySize: 66,
    signatureSize: 139
  },

  // ECDH - Approximate sizes by curve
  'ECDH-prime256v1': {
    publicKeySize: 65,
    privateKeySize: 32,
    sharedSecretSize: 32
  },
  'ECDH-secp384r1': {
    publicKeySize: 97,
    privateKeySize: 48,
    sharedSecretSize: 48
  },
  'ECDH-secp521r1': {
    publicKeySize: 133,
    privateKeySize: 66,
    sharedSecretSize: 66
  }
};

/**
 * Obtiene los tamaños criptográficos para un algoritmo y variante específicos
 * @param {string} algorithm - Nombre del algoritmo
 * @param {string} variant - Variante del algoritmo
 * @param {Object} measuredSizes - Tamaños medidos (opcional)
 * @returns {Object} Objeto con los tamaños criptográficos
 */
export function getCryptoFootprint(algorithm, variant, measuredSizes = {}) {
  const key = `${algorithm}-${variant}`;
  const officialSizes = CRYPTO_SIZES[key] || CRYPTO_SIZES[algorithm] || {};

  return {
    publicKeySize: officialSizes.publicKeySize || measuredSizes.publicKeySize || 0,
    privateKeySize: officialSizes.privateKeySize || measuredSizes.privateKeySize || 0,
    signatureSize: officialSizes.signatureSize || measuredSizes.signatureSize || 0,
    ciphertextSize: officialSizes.ciphertextSize || measuredSizes.ciphertextSize || 0,
    sharedSecretSize: officialSizes.sharedSecretSize || measuredSizes.sharedSecretSize || 0
  };
}

export default CRYPTO_SIZES;
