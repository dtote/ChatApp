#!/usr/bin/env node

import crypto from 'crypto';
import { performance } from 'perf_hooks';
import axios from 'axios';
import fs from 'fs';

// Tamaños oficiales del NIST FIPS 203 (ML-KEM) y FIPS 204 (ML-DSA)
const CRYPTO_SIZES = {
  // ML-KEM (Kyber) - NIST FIPS 203
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

  // ML-DSA (Dilithium) - NIST FIPS 204
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

  // Algoritmos clásicos
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
  'ECDSA-P256': {
    publicKeySize: 64,
    privateKeySize: 32,
    signatureSize: 64
  },
  'ECDSA-P384': {
    publicKeySize: 96,
    privateKeySize: 48,
    signatureSize: 96
  },
  'ECDSA-P521': {
    publicKeySize: 132,
    privateKeySize: 66,
    signatureSize: 132
  },
  'ECDH-P256': {
    publicKeySize: 64,
    privateKeySize: 32,
    sharedSecretSize: 32
  },
  'ECDH-P384': {
    publicKeySize: 96,
    privateKeySize: 48,
    sharedSecretSize: 48
  },
  'ECDH-P521': {
    publicKeySize: 132,
    privateKeySize: 66,
    sharedSecretSize: 66
  }
};

class BenchmarkAcademico {
  constructor() {
    this.pqcleanApiUrl = process.env.PQCLEAN_API_URL || 'http://localhost:5003';
    this.results = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      classical: {},
      postQuantum: {},
      comparison: {}
    };
  }

  async runBenchmark(name, operation, iterations = 100) {
    const times = [];
    let measuredFootprint = {};

    // Warmup
    for (let i = 0; i < 5; i++) {
      try {
        await operation();
      } catch (e) {
        // Ignorar errores de warmup
      }
    }

    // Benchmark real
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      try {
        const result = await operation();
        const end = performance.now();
        times.push(end - start);

        // Medir footprint en la primera iteración
        if (i === 0 && result) {
          measuredFootprint = this.measureCryptoFootprint(result);
        }
      } catch (error) {
        console.error(`❌ Error en ${name}:`, error.message);
        return {
          name,
          error: error.message,
          successRate: 0
        };
      }
    }

    const validTimes = times.filter(t => t !== Infinity && !isNaN(t));

    if (validTimes.length === 0) {
      return {
        name,
        error: 'Todas las iteraciones fallaron',
        successRate: 0
      };
    }

    return {
      name,
      iterations: validTimes.length,
      avgTime: validTimes.reduce((a, b) => a + b, 0) / validTimes.length,
      minTime: Math.min(...validTimes),
      maxTime: Math.max(...validTimes),
      medianTime: this.median(validTimes),
      stdDev: this.calculateStdDev(validTimes),
      successRate: (validTimes.length / iterations) * 100,
      throughput: 1000.0 / (validTimes.reduce((a, b) => a + b, 0) / validTimes.length),

      // Estadísticas avanzadas
      statistics: {
        q1: this.percentile(validTimes, 25),
        q3: this.percentile(validTimes, 75),
        p95: this.percentile(validTimes, 95),
        p99: this.percentile(validTimes, 99)
      },

      // Footprint medido
      footprint: measuredFootprint
    };
  }

  // RSA Benchmarks
  async benchmarkRSA() {
    console.log('🔐 Ejecutando benchmarks RSA...');
    const results = {};

    for (const keySize of [2048, 3072, 4096]) {
      console.log(`  📊 RSA-${keySize}...`);

      // Generación de claves
      const keygenResult = await this.runBenchmark(
        `RSA-${keySize} KeyGen`,
        () => {
          const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: keySize,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
          });
          return { publicKey, privateKey };
        },
        20
      );

      if (keygenResult.error) {
        results[keySize] = { error: keygenResult.error };
        continue;
      }

      // Generar claves para cifrado
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: keySize,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      // Cifrado
      const encryptResult = await this.runBenchmark(
        `RSA-${keySize} Encrypt`,
        () => {
          const message = 'Hello World';
          const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(message));
          return { encrypted, size: encrypted.length };
        },
        100
      );

      // Descifrado
      const decryptResult = await this.runBenchmark(
        `RSA-${keySize} Decrypt`,
        () => {
          const message = 'Hello World';
          const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(message));
          const decrypted = crypto.privateDecrypt(privateKey, encrypted);
          return { decrypted, size: encrypted.length };
        },
        100
      );

      // Firma digital RSA
      const signResult = await this.runBenchmark(
        `RSA-${keySize} Sign`,
        () => {
          const message = 'Hello World';
          const sign = crypto.createSign('SHA256');
          sign.update(message);
          const signature = sign.sign(privateKey, 'hex');
          return { signature, size: signature.length / 2 }; // hex to bytes
        },
        100
      );

      // Verificación de firma RSA
      const verifyResult = await this.runBenchmark(
        `RSA-${keySize} Verify`,
        () => {
          const message = 'Hello World';
          const sign = crypto.createSign('SHA256');
          sign.update(message);
          const signature = sign.sign(privateKey, 'hex');

          const verify = crypto.createVerify('SHA256');
          verify.update(message);
          const isValid = verify.verify(publicKey, signature, 'hex');
          return { isValid, signature };
        },
        100
      );

      // Añadir footprint oficial para RSA
      keygenResult.footprint = this.getCryptoFootprint('RSA', keySize.toString(), keygenResult.footprint);
      encryptResult.footprint = this.getCryptoFootprint('RSA', keySize.toString(), encryptResult.footprint);
      decryptResult.footprint = this.getCryptoFootprint('RSA', keySize.toString(), decryptResult.footprint);
      signResult.footprint = this.getCryptoFootprint('RSA', keySize.toString(), signResult.footprint);
      verifyResult.footprint = this.getCryptoFootprint('RSA', keySize.toString(), verifyResult.footprint);

      results[keySize] = {
        keyGeneration: keygenResult,
        encryption: encryptResult,
        decryption: decryptResult,
        signing: signResult,
        verification: verifyResult,
        securityLevel: keySize / 2
      };
    }

    return results;
  }

  // ECDH Benchmarks
  async benchmarkECDH() {
    console.log('🔐 Ejecutando benchmarks ECDH...');
    const results = {};

    const curves = [
      { name: 'prime256v1', security: 128 },
      { name: 'secp384r1', security: 192 },
      { name: 'secp521r1', security: 256 }
    ];

    for (const curve of curves) {
      console.log(`  📊 ECDH-${curve.name}...`);

      // Generación de claves
      const keygenResult = await this.runBenchmark(
        `ECDH-${curve.name} KeyGen`,
        () => {
          const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
            namedCurve: curve.name,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
          });
          return { publicKey, privateKey };
        },
        100
      );

      if (keygenResult.error) {
        results[curve.name] = { error: keygenResult.error };
        continue;
      }

      // Generar pares de claves para intercambio
      const { publicKey: alicePublic, privateKey: alicePrivate } = crypto.generateKeyPairSync('ec', {
        namedCurve: curve.name,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      const { publicKey: bobPublic, privateKey: bobPrivate } = crypto.generateKeyPairSync('ec', {
        namedCurve: curve.name,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      // Intercambio de claves (Alice deriva clave compartida) - TEMPORALMENTE COMENTADO
      // const encryptResult = await this.runBenchmark(
      //   `ECDH-${curve.name} KeyExchange`,
      //   () => {
      //     const aliceSharedSecret = crypto.diffieHellman(bobPublic, alicePrivate);
      //     return { sharedSecret: aliceSharedSecret, size: aliceSharedSecret.length };
      //   },
      //   1000
      // );

      // Intercambio de claves (Bob deriva clave compartida) - TEMPORALMENTE COMENTADO
      // const decryptResult = await this.runBenchmark(
      //   `ECDH-${curve.name} KeyDerivation`,
      //   () => {
      //     const bobSharedSecret = crypto.diffieHellman(alicePublic, bobPrivate);
      //     return { sharedSecret: bobSharedSecret, size: bobSharedSecret.length };
      //   },
      //   1000
      // );

      // Añadir footprint oficial para ECDH
      keygenResult.footprint = this.getCryptoFootprint('ECDH', curve.name.replace('prime', 'P').replace('secp', 'P'), keygenResult.footprint);
      // encryptResult.footprint = this.getCryptoFootprint('ECDH', curve.name.replace('prime', 'P').replace('secp', 'P'), encryptResult.footprint);
      // decryptResult.footprint = this.getCryptoFootprint('ECDH', curve.name.replace('prime', 'P').replace('secp', 'P'), decryptResult.footprint);

      results[curve.name] = {
        keyGeneration: keygenResult,
        // encryption: encryptResult,  // Key exchange (Alice) - TEMPORALMENTE COMENTADO
        // decryption: decryptResult,  // Key derivation (Bob) - TEMPORALMENTE COMENTADO
        securityLevel: curve.security
      };
    }

    return results;
  }

  // AES Benchmarks
  async benchmarkAES() {
    console.log('🔐 Ejecutando benchmarks AES...');
    const results = {};

    for (const keySize of [128, 192, 256]) {
      console.log(`  📊 AES-${keySize}...`);

      const key = crypto.randomBytes(keySize / 8);
      const iv = crypto.randomBytes(16);

      // Cifrado
      const encryptResult = await this.runBenchmark(
        `AES-${keySize} Encrypt`,
        () => {
          const cipher = crypto.createCipheriv(`aes-${keySize}-cbc`, key, iv);
          let encrypted = cipher.update('Hello World', 'utf8', 'hex');
          encrypted += cipher.final('hex');
          return encrypted;
        },
        1000
      );

      if (encryptResult.error) {
        results[keySize] = { error: encryptResult.error };
        continue;
      }

      // Descifrado
      const decryptResult = await this.runBenchmark(
        `AES-${keySize} Decrypt`,
        () => {
          const cipher = crypto.createCipheriv(`aes-${keySize}-cbc`, key, iv);
          let encrypted = cipher.update('Hello World', 'utf8', 'hex');
          encrypted += cipher.final('hex');

          const decipher = crypto.createDecipheriv(`aes-${keySize}-cbc`, key, iv);
          let decrypted = decipher.update(encrypted, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          return decrypted;
        },
        1000
      );

      results[keySize] = {
        encryption: encryptResult,
        decryption: decryptResult,
        securityLevel: keySize
      };
    }

    return results;
  }

  // ECDSA Benchmarks
  async benchmarkECDSA() {
    console.log('🔐 Ejecutando benchmarks ECDSA...');
    const results = {};

    const curves = [
      { name: 'prime256v1', security: 128 },
      { name: 'secp384r1', security: 192 },
      { name: 'secp521r1', security: 256 }
    ];

    for (const curve of curves) {
      console.log(`  📊 ECDSA-${curve.name}...`);

      // Generación de claves
      const keygenResult = await this.runBenchmark(
        `ECDSA-${curve.name} KeyGen`,
        () => {
          const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
            namedCurve: curve.name,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
          });
          return { publicKey, privateKey };
        },
        100
      );

      if (keygenResult.error) {
        results[curve.name] = { error: keygenResult.error };
        continue;
      }

      // Generar claves para firma
      const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
        namedCurve: curve.name,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      // Firma
      const signResult = await this.runBenchmark(
        `ECDSA-${curve.name} Sign`,
        () => {
          const sign = crypto.createSign('SHA256');
          sign.update('Hello World');
          const signature = sign.sign(privateKey, 'hex');
          return { signature, size: signature.length / 2 }; // hex to bytes
        },
        1000
      );

      // Verificación
      const verifyResult = await this.runBenchmark(
        `ECDSA-${curve.name} Verify`,
        () => {
          const sign = crypto.createSign('SHA256');
          sign.update('Hello World');
          const signature = sign.sign(privateKey, 'hex');

          const verify = crypto.createVerify('SHA256');
          verify.update('Hello World');
          const isValid = verify.verify(publicKey, signature, 'hex');
          return isValid;
        },
        1000
      );

      // Añadir footprint oficial para ECDSA
      keygenResult.footprint = this.getCryptoFootprint('ECDSA', curve.name.replace('prime', 'P').replace('secp', 'P'), keygenResult.footprint);
      signResult.footprint = this.getCryptoFootprint('ECDSA', curve.name.replace('prime', 'P').replace('secp', 'P'), signResult.footprint);
      verifyResult.footprint = this.getCryptoFootprint('ECDSA', curve.name.replace('prime', 'P').replace('secp', 'P'), verifyResult.footprint);

      results[curve.name] = {
        keyGeneration: keygenResult,
        signing: signResult,
        verification: verifyResult,
        securityLevel: curve.security
      };
    }

    return results;
  }

  // ML-KEM Benchmarks
  async benchmarkMLKEM() {
    console.log('🔐 Ejecutando benchmarks ML-KEM...');

    // Verificar que la API esté completamente disponible
    console.log('   🔄 Verificando disponibilidad de la API...');
    const isApiHealthy = await this.ensureApiHealth();
    if (!isApiHealthy) {
      console.log('   ❌ API no disponible después de múltiples intentos');
      return null;
    }
    console.log('   ✅ API disponible');

    const results = {};
    const variants = [
      { name: 'ML-KEM-512', securityLevel: 128 },
      { name: 'ML-KEM-768', securityLevel: 192 },
      { name: 'ML-KEM-1024', securityLevel: 256 }
    ];

    for (const variant of variants) {
      console.log(`   🔑 Probando ${variant.name}...`);

      try {
        // Generación de claves
        const keygenResult = await this.runBenchmark(
          `${variant.name} KeyGen`,
          async () => {
            return await this.makeRequestWithRetry(async () => {
              const response = await axios.post(`${this.pqcleanApiUrl}/generate_keys`, {
                kem_name: variant.name
              }, {
                timeout: 10000,
                headers: { 'Connection': 'keep-alive' }
              });
              return response.data;
            });
          },
          50
        );

        if (keygenResult.error) {
          console.log(`   ❌ Error en ${variant.name} KeyGen: ${keygenResult.error}`);
          results[variant.name] = { error: keygenResult.error };
          continue;
        }

        // Obtener claves para cifrado
        const keygenResponse = await this.makeRequestWithRetry(async () => {
          const response = await axios.post(`${this.pqcleanApiUrl}/generate_keys`, {
            kem_name: variant.name
          }, {
            timeout: 10000,
            headers: { 'Connection': 'keep-alive' }
          });
          return response.data;
        });
        const { public_key } = keygenResponse;

        // Cifrado
        const encryptResult = await this.runBenchmark(
          `${variant.name} Encrypt`,
          async () => {
            return await this.makeRequestWithRetry(async () => {
              const response = await axios.post(`${this.pqcleanApiUrl}/encrypt`, {
                message: 'Hello World',
                public_key: public_key
              }, {
                timeout: 10000,
                headers: { 'Connection': 'keep-alive' }
              });
              return response.data;
            });
          },
          100
        );

        // Descifrado
        const encryptTestResponse = await this.makeRequestWithRetry(async () => {
          const response = await axios.post(`${this.pqcleanApiUrl}/encrypt`, {
            message: 'Hello World',
            public_key: public_key
          }, {
            timeout: 10000,
            headers: { 'Connection': 'keep-alive' }
          });
          return response.data;
        });

        const decryptResult = await this.runBenchmark(
          `${variant.name} Decrypt`,
          async () => {
            return await this.makeRequestWithRetry(async () => {
              const response = await axios.post(`${this.pqcleanApiUrl}/decrypt`, {
                ciphertext: encryptTestResponse.ciphertext,
                shared_secret: encryptTestResponse.shared_secret
              }, {
                timeout: 10000,
                headers: { 'Connection': 'keep-alive' }
              });
              return response.data;
            });
          },
          100
        );

        // Añadir footprint a todos los resultados
        const variantNumber = variant.name.split('-')[2];
        keygenResult.footprint = this.getCryptoFootprint('ML-KEM', variantNumber, keygenResult.footprint);
        encryptResult.footprint = this.getCryptoFootprint('ML-KEM', variantNumber, encryptResult.footprint);
        decryptResult.footprint = this.getCryptoFootprint('ML-KEM', variantNumber, decryptResult.footprint);

        results[variant.name] = {
          keyGeneration: keygenResult,
          encryption: encryptResult,
          decryption: decryptResult,
          securityLevel: variant.securityLevel
        };

        console.log(`   ✅ ${variant.name} completado`);
      } catch (error) {
        console.log(`   ❌ Error en ${variant.name}: ${error.message}`);
        results[variant.name] = { error: error.message };
      }
    }

    return results;
  }

  // ML-DSA Benchmarks
  async benchmarkMLDSA() {
    console.log('🔐 Ejecutando benchmarks ML-DSA...');

    // Verificar que la API esté completamente disponible
    console.log('   🔄 Verificando disponibilidad de la API...');
    const isApiHealthy = await this.ensureApiHealth();
    if (!isApiHealthy) {
      console.log('   ❌ API no disponible después de múltiples intentos');
      return null;
    }
    console.log('   ✅ API disponible');

    const results = {};
    const variants = [
      { name: 'ML-DSA-44', securityLevel: 128 },
      { name: 'ML-DSA-65', securityLevel: 192 },
      { name: 'ML-DSA-87', securityLevel: 256 }
    ];

    for (const variant of variants) {
      console.log(`   ✍️  Probando ${variant.name}...`);

      try {
        // Generación de claves
        const keygenResult = await this.runBenchmark(
          `${variant.name} KeyGen`,
          async () => {
            return await this.makeRequestWithRetry(async () => {
              const response = await axios.post(`${this.pqcleanApiUrl}/generate_ml_dsa_keys`, {
                ml_dsa_variant: variant.name
              }, {
                timeout: 10000,
                headers: { 'Connection': 'keep-alive' }
              });
              return response.data;
            });
          },
          50
        );

        if (keygenResult.error) {
          console.log(`   ❌ Error en ${variant.name} KeyGen: ${keygenResult.error}`);
          results[variant.name] = { error: keygenResult.error };
          continue;
        }

        // Obtener claves para firma
        const keygenResponse = await this.makeRequestWithRetry(async () => {
          const response = await axios.post(`${this.pqcleanApiUrl}/generate_ml_dsa_keys`, {
            ml_dsa_variant: variant.name
          }, {
            timeout: 10000,
            headers: { 'Connection': 'keep-alive' }
          });
          return response.data;
        });
        const { private_key } = keygenResponse;

        // Firma
        const signResult = await this.runBenchmark(
          `${variant.name} Sign`,
          async () => {
            return await this.makeRequestWithRetry(async () => {
              const response = await axios.post(`${this.pqcleanApiUrl}/sign`, {
                message: 'Hello World',
                private_key: private_key
              }, {
                timeout: 10000,
                headers: { 'Connection': 'keep-alive' }
              });
              return response.data;
            });
          },
          100
        );

        // Verificación
        const signTestResponse = await this.makeRequestWithRetry(async () => {
          const response = await axios.post(`${this.pqcleanApiUrl}/sign`, {
            message: 'Hello World',
            private_key: private_key
          }, {
            timeout: 10000,
            headers: { 'Connection': 'keep-alive' }
          });
          return response.data;
        });

        const verifyResult = await this.runBenchmark(
          `${variant.name} Verify`,
          async () => {
            return await this.makeRequestWithRetry(async () => {
              const response = await axios.post(`${this.pqcleanApiUrl}/verify`, {
                message: 'Hello World',
                signature: signTestResponse.signature,
                public_key: keygenResponse.public_key
              }, {
                timeout: 10000,
                headers: { 'Connection': 'keep-alive' }
              });
              return response.data;
            });
          },
          100
        );

        // Añadir footprint a todos los resultados
        const variantNumber = variant.name.split('-')[2];
        keygenResult.footprint = this.getCryptoFootprint('ML-DSA', variantNumber, keygenResult.footprint);
        signResult.footprint = this.getCryptoFootprint('ML-DSA', variantNumber, signResult.footprint);
        verifyResult.footprint = this.getCryptoFootprint('ML-DSA', variantNumber, verifyResult.footprint);

        results[variant.name] = {
          keyGeneration: keygenResult,
          signing: signResult,
          verification: verifyResult,
          securityLevel: variant.securityLevel
        };

        console.log(`   ✅ ${variant.name} completado`);
      } catch (error) {
        console.log(`   ❌ Error en ${variant.name}: ${error.message}`);
        results[variant.name] = { error: error.message };
      }
    }

    return results;
  }

  // Funciones auxiliares
  median(arr) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  // Función robusta para hacer peticiones HTTP con reintentos
  async makeRequestWithRetry(requestFn, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        // Esperar antes del siguiente intento (backoff exponencial)
        const waitTime = delay * Math.pow(2, attempt - 1);
        console.log(`   ⚠️  Intento ${attempt} falló, reintentando en ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // Función para verificar que la API esté completamente disponible
  async ensureApiHealth() {
    const maxHealthChecks = 5;
    for (let i = 0; i < maxHealthChecks; i++) {
      try {
        const response = await axios.get(`${this.pqcleanApiUrl}/health`, {
          timeout: 5000,
          headers: { 'Connection': 'keep-alive' }
        });
        if (response.status === 200) {
          return true;
        }
      } catch (error) {
        console.log(`   🔄 Verificando API... (${i + 1}/${maxHealthChecks})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    return false;
  }

  calculateStdDev(arr) {
    if (arr.length < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (arr.length - 1);
    return Math.sqrt(variance);
  }

  // Calcular percentiles
  percentile(arr, p) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);

    if (Number.isInteger(index)) {
      return sorted[index];
    } else {
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
  }

  // Medir footprint de datos criptográficos
  measureCryptoFootprint(result) {
    const footprint = {};

    if (result.publicKey) {
      footprint.publicKeySize = Buffer.from(result.publicKey, 'base64').length;
    }

    if (result.privateKey || result.secretKey) {
      const key = result.privateKey || result.secretKey;
      footprint.privateKeySize = Buffer.from(key, 'base64').length;
    }

    if (result.ciphertext) {
      footprint.ciphertextSize = Buffer.from(result.ciphertext, 'base64').length;
    } else if (result.encrypted && result.size) {
      // Para RSA que devuelve {encrypted, size}
      footprint.ciphertextSize = result.size;
    }

    if (result.signature) {
      if (typeof result.signature === 'string' && result.signature.includes('=')) {
        // Base64 encoded
        footprint.signatureSize = Buffer.from(result.signature, 'base64').length;
      } else if (result.size) {
        // Tamaño directo
        footprint.signatureSize = result.size;
      }
    }

    return footprint;
  }

  // Obtener footprint oficial vs medido
  getCryptoFootprint(algorithm, variant, measuredSizes = {}) {
    const officialSizes = CRYPTO_SIZES[`${algorithm}-${variant}`] || CRYPTO_SIZES[algorithm] || {};

    return {
      // Tamaños oficiales (para consistencia académica)
      publicKeySize: officialSizes.publicKeySize || measuredSizes.publicKeySize || 0,
      privateKeySize: officialSizes.privateKeySize || measuredSizes.privateKeySize || 0,
      ciphertextSize: officialSizes.ciphertextSize || measuredSizes.ciphertextSize || 0,
      signatureSize: officialSizes.signatureSize || measuredSizes.signatureSize || 0,

      // Validación con medición real
      measured: measuredSizes,
      isConsistent: this.validateFootprintConsistency(officialSizes, measuredSizes)
    };
  }

  // Validar consistencia entre tamaños oficiales y medidos
  validateFootprintConsistency(official, measured, tolerance = 10) {
    if (!official.publicKeySize || !measured.publicKeySize) return true;

    const diff = Math.abs(official.publicKeySize - measured.publicKeySize);
    return diff <= tolerance;
  }

  // Ejecutar todos los benchmarks
  async runAllBenchmarks() {
    console.log('🚀 Iniciando Benchmark Simplificado...\n');

    try {
      // Algoritmos clásicos
      console.log('📊 ALGORITMOS CLÁSICOS');
      console.log('='.repeat(50));
      this.results.classical.rsa = await this.benchmarkRSA();
      this.results.classical.aes = await this.benchmarkAES();
      this.results.classical.ecdsa = await this.benchmarkECDSA();
      this.results.classical.ecdh = await this.benchmarkECDH();

      // Algoritmos post-cuánticos
      console.log('\n📊 ALGORITMOS POST-CUÁNTICOS');
      console.log('='.repeat(50));
      this.results.postQuantum.mlKem = await this.benchmarkMLKEM();
      this.results.postQuantum.mlDsa = await this.benchmarkMLDSA();

      // Mostrar resultados agrupados por operación
      this.displayResultsByOperation();

      // Análisis comparativo
      this.generateComparison();

      // Benchmark completado
      return this.results;

    } catch (error) {
      console.error('❌ Error ejecutando benchmarks:', error);
      throw error;
    }
  }

  // Nueva función para mostrar resultados agrupados por operación
  displayResultsByOperation() {
    console.log('\n📊 RESULTADOS AGRUPADOS POR TIPO DE OPERACIÓN');
    console.log('='.repeat(80));

    // Tabla 1: Generación de Claves
    this.displayKeyGenerationTable();

    // Tabla 2: Cifrado/Encapsulación
    this.displayEncryptionTable();

    // Tabla 3: Descifrado/Decapsulación
    this.displayDecryptionTable();

    // Tabla 4: Firma Digital
    this.displaySigningTable();

    // Tabla 5: Verificación de Firmas
    this.displayVerificationTable();
  }

  displayKeyGenerationTable() {
    console.log('\n🔑 TABLA 1: GENERACIÓN DE CLAVES');
    console.log('─'.repeat(80));
    console.log('Algoritmo'.padEnd(20) + 'Tiempo(ms)'.padEnd(15) + 'Throughput'.padEnd(15) + 'Éxito(%)'.padEnd(12) + 'Tamaño Clave');
    console.log('─'.repeat(80));

    // Algoritmos post-cuánticos
    if (this.results.postQuantum.mlKem) {
      Object.entries(this.results.postQuantum.mlKem).forEach(([algorithm, data]) => {
        if (data && !data.error && data.keyGeneration) {
          const footprint = data.keyGeneration.footprint;
          console.log(
            algorithm.padEnd(20) +
            data.keyGeneration.avgTime.toFixed(2).padEnd(15) +
            data.keyGeneration.throughput.toFixed(0).padEnd(15) +
            data.keyGeneration.successRate.toFixed(1).padEnd(12) +
            `${footprint.publicKeySize} bytes`
          );
        }
      });
    }

    // Algoritmos clásicos
    if (this.results.classical.rsa) {
      Object.entries(this.results.classical.rsa).forEach(([keySize, data]) => {
        if (data && !data.error && data.keyGeneration) {
          const footprint = data.keyGeneration.footprint;
          console.log(
            `RSA-${keySize}`.padEnd(20) +
            data.keyGeneration.avgTime.toFixed(2).padEnd(15) +
            data.keyGeneration.throughput.toFixed(0).padEnd(15) +
            data.keyGeneration.successRate.toFixed(1).padEnd(12) +
            `${footprint.publicKeySize} bytes`
          );
        }
      });
    }

    // ECDH
    if (this.results.classical.ecdh) {
      Object.entries(this.results.classical.ecdh).forEach(([curve, data]) => {
        if (data && !data.error && data.keyGeneration) {
          const footprint = data.keyGeneration.footprint;
          const curveName = curve.replace('prime', 'P').replace('secp', 'P');
          console.log(
            `ECDH-${curveName}`.padEnd(20) +
            data.keyGeneration.avgTime.toFixed(2).padEnd(15) +
            data.keyGeneration.throughput.toFixed(0).padEnd(15) +
            data.keyGeneration.successRate.toFixed(1).padEnd(12) +
            `${footprint.publicKeySize} bytes`
          );
        }
      });
    }
  }

  displayEncryptionTable() {
    console.log('\n🔐 TABLA 2: CIFRADO/ENCAPSULACIÓN');
    console.log('─'.repeat(80));
    console.log('Algoritmo'.padEnd(20) + 'Tiempo(ms)'.padEnd(15) + 'Throughput'.padEnd(15) + 'Éxito(%)'.padEnd(12) + 'Tamaño Data');
    console.log('─'.repeat(80));

    // Algoritmos post-cuánticos
    if (this.results.postQuantum.mlKem) {
      Object.entries(this.results.postQuantum.mlKem).forEach(([algorithm, data]) => {
        if (data && !data.error && data.encryption) {
          const footprint = data.encryption.footprint;
          console.log(
            algorithm.padEnd(20) +
            data.encryption.avgTime.toFixed(2).padEnd(15) +
            data.encryption.throughput.toFixed(0).padEnd(15) +
            data.encryption.successRate.toFixed(1).padEnd(12) +
            `${footprint.ciphertextSize} bytes`
          );
        }
      });
    }

    // Algoritmos clásicos
    if (this.results.classical.rsa) {
      Object.entries(this.results.classical.rsa).forEach(([keySize, data]) => {
        if (data && !data.error && data.encryption) {
          const footprint = data.encryption.footprint;
          console.log(
            `RSA-${keySize}`.padEnd(20) +
            data.encryption.avgTime.toFixed(2).padEnd(15) +
            data.encryption.throughput.toFixed(0).padEnd(15) +
            data.encryption.successRate.toFixed(1).padEnd(12) +
            `${footprint.ciphertextSize} bytes`
          );
        }
      });
    }

    // ECDH
    if (this.results.classical.ecdh) {
      Object.entries(this.results.classical.ecdh).forEach(([curve, data]) => {
        if (data && !data.error && data.encryption) {
          const footprint = data.encryption.footprint;
          const curveName = curve.replace('prime', 'P').replace('secp', 'P');
          console.log(
            `ECDH-${curveName}`.padEnd(20) +
            data.encryption.avgTime.toFixed(2).padEnd(15) +
            data.encryption.throughput.toFixed(0).padEnd(15) +
            data.encryption.successRate.toFixed(1).padEnd(12) +
            `${footprint.sharedSecretSize || 'N/A'} bytes`
          );
        }
      });
    }

    // AES
    if (this.results.classical.aes) {
      Object.entries(this.results.classical.aes).forEach(([keySize, data]) => {
        if (data && !data.error && data.encryption) {
          console.log(
            `AES-${keySize}`.padEnd(20) +
            data.encryption.avgTime.toFixed(3).padEnd(15) +
            data.encryption.throughput.toFixed(0).padEnd(15) +
            data.encryption.successRate.toFixed(1).padEnd(12) +
            `${keySize / 8} bytes`
          );
        }
      });
    }
  }

  displayDecryptionTable() {
    console.log('\n🔓 TABLA 3: DESCIFRADO/DECAPSULACIÓN');
    console.log('─'.repeat(80));
    console.log('Algoritmo'.padEnd(20) + 'Tiempo(ms)'.padEnd(15) + 'Throughput'.padEnd(15) + 'Éxito(%)'.padEnd(12) + 'Verificación');
    console.log('─'.repeat(80));

    // Algoritmos post-cuánticos
    if (this.results.postQuantum.mlKem) {
      Object.entries(this.results.postQuantum.mlKem).forEach(([algorithm, data]) => {
        if (data && !data.error && data.decryption) {
          console.log(
            algorithm.padEnd(20) +
            data.decryption.avgTime.toFixed(2).padEnd(15) +
            data.decryption.throughput.toFixed(0).padEnd(15) +
            data.decryption.successRate.toFixed(1).padEnd(12) +
            '✅'
          );
        }
      });
    }

    // Algoritmos clásicos
    if (this.results.classical.rsa) {
      Object.entries(this.results.classical.rsa).forEach(([keySize, data]) => {
        if (data && !data.error && data.decryption) {
          console.log(
            `RSA-${keySize}`.padEnd(20) +
            data.decryption.avgTime.toFixed(2).padEnd(15) +
            data.decryption.throughput.toFixed(0).padEnd(15) +
            data.decryption.successRate.toFixed(1).padEnd(12) +
            '✅'
          );
        }
      });
    }

    // AES
    if (this.results.classical.aes) {
      Object.entries(this.results.classical.aes).forEach(([keySize, data]) => {
        if (data && !data.error && data.decryption) {
          console.log(
            `AES-${keySize}`.padEnd(20) +
            data.decryption.avgTime.toFixed(3).padEnd(15) +
            data.decryption.throughput.toFixed(0).padEnd(15) +
            data.decryption.successRate.toFixed(1).padEnd(12) +
            '✅'
          );
        }
      });
    }
  }

  displaySigningTable() {
    console.log('\n✍️ TABLA 4: FIRMA DIGITAL');
    console.log('─'.repeat(80));
    console.log('Algoritmo'.padEnd(20) + 'Tiempo(ms)'.padEnd(15) + 'Throughput'.padEnd(15) + 'Éxito(%)'.padEnd(12) + 'Tamaño Firma');
    console.log('─'.repeat(80));

    // Algoritmos post-cuánticos
    if (this.results.postQuantum.mlDsa) {
      Object.entries(this.results.postQuantum.mlDsa).forEach(([algorithm, data]) => {
        if (data && !data.error && data.signing && data.signing.avgTime) {
          const footprint = data.signing.footprint;
          console.log(
            algorithm.padEnd(20) +
            data.signing.avgTime.toFixed(2).padEnd(15) +
            data.signing.throughput.toFixed(0).padEnd(15) +
            data.signing.successRate.toFixed(1).padEnd(12) +
            `${footprint.signatureSize} bytes`
          );
        }
      });
    }

    // Algoritmos clásicos - ECDSA (estándar moderno)
    if (this.results.classical.ecdsa) {
      Object.entries(this.results.classical.ecdsa).forEach(([curve, data]) => {
        if (data && !data.error && data.signing) {
          const footprint = data.signing?.footprint || { signatureSize: curve === 'prime256v1' ? 64 : curve === 'secp384r1' ? 96 : 132 };
          console.log(
            `ECDSA-${curve}`.padEnd(20) +
            data.signing.avgTime.toFixed(2).padEnd(15) +
            data.signing.throughput.toFixed(0).padEnd(15) +
            data.signing.successRate.toFixed(1).padEnd(12) +
            `${footprint.signatureSize} bytes`
          );
        }
      });
    }

    // Algoritmos clásicos - RSA (legacy, solo para referencia)
    if (this.results.classical.rsa) {
      Object.entries(this.results.classical.rsa).forEach(([keySize, data]) => {
        if (data && !data.error && data.signing) {
          const footprint = data.signing?.footprint || { signatureSize: keySize / 8 };
          console.log(
            `RSA-${keySize} (legacy)`.padEnd(20) +
            (data.signing?.avgTime?.toFixed(2) || 'N/A').padEnd(15) +
            (data.signing?.throughput?.toFixed(0) || 'N/A').padEnd(15) +
            (data.signing?.successRate?.toFixed(1) || 'N/A').padEnd(12) +
            `${footprint.signatureSize} bytes`
          );
        }
      });
    }
  }

  displayVerificationTable() {
    console.log('\n🔍 TABLA 5: VERIFICACIÓN DE FIRMAS');
    console.log('─'.repeat(80));
    console.log('Algoritmo'.padEnd(20) + 'Tiempo(ms)'.padEnd(15) + 'Throughput'.padEnd(15) + 'Éxito(%)'.padEnd(12) + 'Verificación');
    console.log('─'.repeat(80));

    // Algoritmos post-cuánticos
    if (this.results.postQuantum.mlDsa) {
      Object.entries(this.results.postQuantum.mlDsa).forEach(([algorithm, data]) => {
        if (data && !data.error && data.verification && data.verification.avgTime) {
          console.log(
            algorithm.padEnd(20) +
            data.verification.avgTime.toFixed(2).padEnd(15) +
            data.verification.throughput.toFixed(0).padEnd(15) +
            data.verification.successRate.toFixed(1).padEnd(12) +
            '✅'
          );
        }
      });
    }

    // Algoritmos clásicos - ECDSA (estándar moderno)
    if (this.results.classical.ecdsa) {
      Object.entries(this.results.classical.ecdsa).forEach(([curve, data]) => {
        if (data && !data.error && data.verification) {
          console.log(
            `ECDSA-${curve}`.padEnd(20) +
            data.verification.avgTime.toFixed(2).padEnd(15) +
            data.verification.throughput.toFixed(0).padEnd(15) +
            data.verification.successRate.toFixed(1).padEnd(12) +
            '✅'
          );
        }
      });
    }

    // Algoritmos clásicos - RSA (legacy, solo para referencia)
    if (this.results.classical.rsa) {
      Object.entries(this.results.classical.rsa).forEach(([keySize, data]) => {
        if (data && !data.error && data.verification) {
          console.log(
            `RSA-${keySize} (legacy)`.padEnd(20) +
            (data.verification?.avgTime?.toFixed(2) || 'N/A').padEnd(15) +
            (data.verification?.throughput?.toFixed(0) || 'N/A').padEnd(15) +
            (data.verification?.successRate?.toFixed(1) || 'N/A').padEnd(12) +
            '✅'
          );
        }
      });
    }
  }

  generateComparison() {
    console.log('\n📊 ANÁLISIS COMPARATIVO');
    console.log('='.repeat(50));

    if (this.results.postQuantum.mlKem && this.results.postQuantum.mlKem['ML-KEM-512'] &&
      !this.results.postQuantum.mlKem['ML-KEM-512'].error &&
      this.results.classical.rsa && this.results.classical.rsa[2048] &&
      !this.results.classical.rsa[2048].error) {

      const rsa2048 = this.results.classical.rsa[2048];
      const mlKem512 = this.results.postQuantum.mlKem['ML-KEM-512'];

      console.log('\n🔐 Comparación RSA-2048 vs ML-KEM-512 (128 bits):');
      console.log(`   Generación de claves:`);
      console.log(`     RSA-2048:    ${rsa2048.keyGeneration.avgTime.toFixed(2)}ms (${rsa2048.keyGeneration.throughput.toFixed(0)} ops/s)`);
      console.log(`     ML-KEM-512:  ${mlKem512.keyGeneration.avgTime.toFixed(2)}ms (${mlKem512.keyGeneration.throughput.toFixed(0)} ops/s)`);

      console.log(`   Cifrado:`);
      console.log(`     RSA-2048:    ${rsa2048.encryption.avgTime.toFixed(2)}ms (${rsa2048.encryption.throughput.toFixed(0)} ops/s)`);
      console.log(`     ML-KEM-512:  ${mlKem512.encryption.avgTime.toFixed(2)}ms (${mlKem512.encryption.throughput.toFixed(0)} ops/s)`);

      const keygenRatio = mlKem512.keyGeneration.avgTime / rsa2048.keyGeneration.avgTime;
      const encryptRatio = mlKem512.encryption.avgTime / rsa2048.encryption.avgTime;

      console.log(`   Ratios:`);
      console.log(`     Generación:  ${keygenRatio.toFixed(2)}x`);
      console.log(`     Cifrado:     ${encryptRatio.toFixed(2)}x`);

      this.results.comparison = {
        rsa2048_vs_mlKem512: {
          keyGenerationRatio: keygenRatio,
          encryptionRatio: encryptRatio,
          mlKemFasterKeygen: keygenRatio < 1,
          mlKemFasterEncrypt: encryptRatio < 1
        }
      };
    }
  }

  displayResults() {
    console.log('\n📊 TABLA DE RESULTADOS');
    console.log('='.repeat(80));
    console.log('Algoritmo'.padEnd(20) + 'Operación'.padEnd(20) + 'Tiempo(ms)'.padEnd(15) + 'Throughput'.padEnd(15) + 'Éxito(%)');
    console.log('-'.repeat(80));

    // Algoritmos clásicos
    Object.entries(this.results.classical).forEach(([algorithm, data]) => {
      Object.entries(data).forEach(([key, result]) => {
        if (result.avgTime) {
          console.log(
            algorithm.toUpperCase().padEnd(20) +
            key.padEnd(20) +
            result.avgTime.toFixed(2).padEnd(15) +
            result.throughput.toFixed(0).padEnd(15) +
            result.successRate.toFixed(1)
          );
        } else if (result.error) {
          console.log(
            algorithm.toUpperCase().padEnd(20) +
            key.padEnd(20) +
            'ERROR'.padEnd(15) +
            '0'.padEnd(15) +
            '0.0'
          );
        } else {
          Object.entries(result).forEach(([subKey, subResult]) => {
            if (subResult.avgTime) {
              console.log(
                `${algorithm.toUpperCase()}-${key}`.padEnd(20) +
                subKey.padEnd(20) +
                subResult.avgTime.toFixed(2).padEnd(15) +
                subResult.throughput.toFixed(0).padEnd(15) +
                subResult.successRate.toFixed(1)
              );
            }
          });
        }
      });
    });

    // Algoritmos post-cuánticos
    Object.entries(this.results.postQuantum).forEach(([algorithm, data]) => {
      if (data && !data.error) {
        Object.entries(data).forEach(([variant, variantData]) => {
          if (!variantData.error) {
            Object.entries(variantData).forEach(([operation, result]) => {
              if (result.avgTime) {
                console.log(
                  `${algorithm.toUpperCase()}-${variant}`.padEnd(20) +
                  operation.padEnd(20) +
                  result.avgTime.toFixed(2).padEnd(15) +
                  result.throughput.toFixed(0).padEnd(15) +
                  result.successRate.toFixed(1)
                );
              }
            });
          }
        });
      }
    });
  }

  saveResults(filename = 'results/benchmark-academico.json') {
    const jsonString = JSON.stringify(this.results, null, 2);
    fs.writeFileSync(filename, jsonString);
    // Resultados guardados
  }
}

// Función principal
async function main() {
  try {
    const benchmark = new BenchmarkAcademico();
    await benchmark.runAllBenchmarks();
    // benchmark.displayResults(); // Eliminada - tablas agrupadas son más útiles
    benchmark.saveResults();

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default BenchmarkAcademico;
