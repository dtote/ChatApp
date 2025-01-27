import { randomFillSync, createHash, randomBytes } from 'crypto';

// Función para comprobar si un número es primo
function esPrimo(n) {
    if (n < 2) {
        return false;
    }
    for (let i = 2; i <= Math.floor(Math.sqrt(n)); i++) {
        if (n % i === 0) {
            return false;
        }
    }
    return true;
}

// Función para realizar la transformación bit-reversal de un entero i
function bitrev(z, n) {
    // Crear la secuencia de números de 0 a n-1
    let seq = [...Array(n).keys()];
    // Calcular el número de bits necesarios para representar n
    let m = Math.floor(Math.log2(n));
    // Inicializar el array de salida
    let out = new Array(n).fill(0);

    // Iterar sobre los elementos de la secuencia
    for (let i = 0; i < n; i++) {
        // Calcular el índice con los bits invertidos
        let j = parseInt(i.toString(2).padStart(m, '0').split('').reverse().join(''), 2);
        // Asignar el elemento al índice correspondiente
        out[j] = seq[i];
    }

    return out[z];
}

// Función para calcular la traspuesta de una matriz
function traspuesta(A) {
    return A[0].map((_, colIndex) => A.map(row => row[colIndex]));
}

// Función para convertir bytes a un array de bits en notación little-endian
function bytes2bits(inputBytes) {
    let bitString = Array.from(inputBytes).map(byte => byte.toString(2).padStart(8, '0').split('').reverse().join('')).join('');
    return bitString.split('').map(bit => parseInt(bit, 10));
}

// Función para convertir un string de bits a bytes
function bits2bytes(s) {
    let bytes = [];
    for (let i = 0; i < s.length; i += 8) {
        let byte = s.slice(i, i + 8).split('').reverse().join('');
        bytes.push(parseInt(byte, 2));
    }
    return new Uint8Array(bytes);
}

// Función XOF utilizando shake128
function XOF(bytes32, a, b, length) {
    /**
     * XOF: B* x B x B -> B*
     */
    const inputBytes = Buffer.concat([bytes32, Buffer.from([a]), Buffer.from([b])]);
    return createHash('shake128').update(inputBytes).digest({ length });
}

// Función H utilizando sha3-256
function H(inputBytes) {
    /**
     * H: B* -> B^32
     */
    return createHash('sha3-256').update(inputBytes).digest();
}

// Función G utilizando sha3-512
function G(inputBytes) {
    /**
     * G: B* -> B^32 x B^32
     */
    const output = createHash('sha3-512').update(inputBytes).digest();
    return [output.slice(0, 32), output.slice(32, 64)];
}

// Función PRF utilizando shake256
function PRF(s, b, length) {
  // Verifica que 's' sea un Buffer de 32 bytes
  if (!Buffer.isBuffer(s) || s.length !== 32) {
      throw new Error("El input 's' debe ser un Buffer de 32 bytes.");
  }
  
  // Combina 's' y 'b' en un solo Buffer
  const inputBytes = Buffer.concat([s, Buffer.from([b])]);
  
  // Verifica la longitud total del input
  if (inputBytes.length !== 33) {
      throw new Error("El input de bytes debe ser una lista de 32 bytes y un único byte.");
  }
  
  // Crea el hash utilizando SHAKE256 y devuelve el número requerido de bytes
  return createHash('shake256').update(inputBytes).digest().slice(0, length);
}

// Función KDF utilizando shake256
function KDF(inputBytes, length) {
    /**
     * KDF: B* -> B*
     */
    return createHash('shake256').update(inputBytes).digest({ length });
}

// NTT 
// Raiz primitiva de la unidad


// Función para encontrar la primera raíz primitiva de n en Zq
function primeraRaizPrimitiva(n, q) {
  // Comprobamos las hipótesis
  if (!esPrimo(q)) {
      console.log('Error: Debe tomarse q primo.');
      return null;
  }
  if ((q - 1) % n !== 0) {
      console.log('Error: Se busca un n tal que n divida a q-1.');
      return null;
  }

  // Buscamos g tal que g^n = 1 y g^k != 1 para 1 <= k < n
  let raizPrimitiva = 0;

  // Iteramos desde g = 2 hasta q - 1
  for (let g = 2; g < q; g++) {
      let t = 0;
      let i = 2; // Empezamos en i = 2 ya que g^1 = g y g^0 = 1 no cuenta

      // Comprobamos si g^n = 1
      while (t !== 1 && i <= n) {
          t = Math.pow(g, i) % q;
          i++;
      }

      // Si g^n = 1 y no lo es para ningún exponente menor, encontramos la raíz primitiva
      if (t === 1 && i === n + 1) {
          raizPrimitiva = g;
          return raizPrimitiva;
      }
  }

  return null; // Si no se encuentra ninguna raíz primitiva
}

// Ejemplo de uso
// let n = 256;
// let q = 3329;
// let raizPrimitiva = primeraRaizPrimitiva(n, q);
// if (raizPrimitiva !== null) {
//   console.log(`La primera raíz primitiva de ${n} en Z${q} es: ${raizPrimitiva}`);
// }

// La funcion NTT es una implementacion de la Transformada de Fourier en el anillo Zq, es decir, es una herramienta que convierte una
// lista de números en otra lista de números, donde se puede ver la frecuencia de los datos, usando números especiales llamados n-raíces primitivas.
// se utiliza el algoritmo butterfly para haceerlo de manera más eficiente.

function NTT(a, q) {
  let n = a.length;
  let phi = primeraRaizPrimitiva(2 * n, q);

  let m = 1;
  let k = Math.floor(n / 2);

  while (m < n) {
    for (let i = 0; i < m; i++) {
      let j1 = 2 * i * k;
      let j2 = j1 + k - 1;
      let S = Math.pow(phi, bitrev(m + i, n));

      for (let j = j1; j <= j2; j++) {
        let u = a[j];
        let v = a[j + k];

        a[j] = (u + S * v) % q;
        a[j + k] = (u - S * v) % q;
      }
    }
    m = 2 * m;
    k = Math.floor(k / 2);
  }

  return a;
}

function NTT_kyber(a) {
  if (a.length < 256) {
    a = a.concat(new Array(256 - a.length).fill(0));
  }

  let q = 3329;
  let n = Math.floor(a.length / 2);

  let a_par = a.filter((_, idx) => idx % 2 === 0);
  let a_impar = a.filter((_, idx) => idx % 2 !== 0);

  let a_par_ntt = NTT(a_par, q);
  let a_impar_ntt = NTT(a_impar, q);

  a = Array.from({ length: 256 }, (_, i) => i % 2 === 0 ? a_par_ntt[Math.floor(i / 2)] : a_impar_ntt[Math.floor((i - 1) / 2)]);

  return a;
}

function INTT(a, q) {
  /**
   * Toma de entrada un polinomio en orden bit-reverse y devuelve en orden estándar.
   */
  let n = a.length;
  let phi = primeraRaizPrimitiva(2 * n, q);
  let phi_inversa = Math.pow(phi, 2 * n - 1) % q;

  // Inicializamos para el while
  let m = Math.floor(n / 2);
  let k = 1;

  while (m >= 1) {
    for (let i = 0; i < m; i++) {
      let j1 = 2 * i * k;
      let j2 = j1 + k - 1;
      let S = (Math.pow(phi_inversa, bitrev(m + i, n))) % (q);

      for (let j = j1; j <= j2; j++) {
        let u = (a[j]); // Copia de a[j]
        let v = (a[j + k]);

        a[j] = (u + v) % (q);
        a[j + k] = (u - v) * S % (q);
      }
    }

    m = Math.floor(m / 2);
    k = 2 * k;
  }

  // Multiplicamos el resultado por el inverso de n en q.
  let n_inverso = (Math.pow(n, q - 2)) % (q);
  a = a.map(x => ((n_inverso) * (x)) % (q));

  return a;
}

function INTT_kyber(a) {
  /**
   * Aquí no hay una raíz primitiva de 512 (en Zq).
   * Simplemente aplicamos a la parte par e impar y juntamos.
   * El input está en bit-reverse y el output en orden estándar.
   */

  if (a.length < 256) {
    a = a.concat(new Array(256 - a.length).fill(0)); // Rellenamos con ceros si es necesario
  }

  let q = 3329;
  let n = Math.floor(a.length / 2);

  // Separar en partes pares e impares
  let a_par = a.filter((_, idx) => idx % 2 === 0);
  let a_impar = a.filter((_, idx) => idx % 2 !== 0);

  let a_par_intt = INTT(a_par, q);
  let a_impar_intt = INTT(a_impar, q);

  // Juntamos las partes par e impar
  let result = new Array(256);
  for (let i = 0; i < 256; i++) {
    result[i] = i % 2 === 0 ? a_par_intt[Math.floor(i / 2)] : a_impar_intt[Math.floor((i - 1) / 2)];
  }

  return result;
}

function KyberConvolution(p, g, pnttdomain = false, gnttdomain = false) {
  /**
   * Función que realiza la convolución optimizada de dos polinomios usando NTT e INTT.
   * Esta implementación es específica para Kyber, con parámetros fijos q=3329 y n=256.
   */

  // Parámetros:
  const q = 3329;
  const n = 256;
  const phi = 17; // Primera 256-raíz primitiva de Z3329.

  // Rellenamos con ceros si los polinomios son menores de grado 256.
  if (p.length < n) {
      p = p.concat(Array(n - p.length).fill(0));
  }

  if (g.length < n) {
      g = g.concat(Array(n - g.length).fill(0));
  }

  // Dividimos los polinomios en partes pares e impares.
  const p_par = p.filter((coef, idx) => idx % 2 === 0);
  const p_impar = p.filter((coef, idx) => idx % 2 !== 0);

  const g_par = g.filter((coef, idx) => idx % 2 === 0);
  const g_impar = g.filter((coef, idx) => idx % 2 !== 0);

  let p_par_ntt, p_impar_ntt, g_par_ntt, g_impar_ntt;
  let point_wise_mult_par, point_wise_mult_impar;

  // Comprobamos si aplicamos NTT.
  if (!pnttdomain && !gnttdomain) {
      // Aplicamos NTT a los polinomios si no están en el dominio NTT.
      p_par_ntt = NTT(p_par, q);
      p_impar_ntt = NTT(p_impar, q);

      g_par_ntt = NTT(g_par, q);
      g_impar_ntt = NTT(g_impar, q);

      point_wise_mult_par = p_par_ntt.map((p_val, i) => 
          (p_val * g_par_ntt[i] + p_impar_ntt[i] * g_impar_ntt[i] * Math.pow(phi, 2 * bitrev(i, n / 2) + 1)) % q
      );

      point_wise_mult_impar = p_par_ntt.map((p_val, i) =>
          (p_val * g_impar_ntt[i] + p_impar_ntt[i] * g_par_ntt[i]) % q
      );

      const C_par = INTT(point_wise_mult_par, q);
      const C_impar = INTT(point_wise_mult_impar, q);

      return Array.from({ length: n }, (_, i) =>
          i % 2 === 0 ? C_par[Math.floor(i / 2)] : C_impar[Math.floor((i - 1) / 2)]
      );
  }

  if (pnttdomain && gnttdomain) {
      // Ambos polinomios ya están en el dominio NTT.
      point_wise_mult_par = p_par.map((p_val, i) =>
          (p_val * g_par[i] + p_impar[i] * g_impar[i] * Math.pow(phi, 2 * bitrev(i, n / 2) + 1)) % q
      );

      point_wise_mult_impar = p_par.map((p_val, i) =>
          (p_val * g_impar[i] + p_impar[i] * g_par[i]) % q
      );

      const C_par = INTT(point_wise_mult_par, q);
      const C_impar = INTT(point_wise_mult_impar, q);

      return Array.from({ length: n }, (_, i) =>
          i % 2 === 0 ? C_par[Math.floor(i / 2)] : C_impar[Math.floor((i - 1) / 2)]
      );
  }

  if (pnttdomain && !gnttdomain) {
      // Sólo p está en el dominio NTT.
      g_par_ntt = NTT(g_par, q);
      g_impar_ntt = NTT(g_impar, q);

      point_wise_mult_par = p_par.map((p_val, i) =>
          (p_val * g_par_ntt[i] + p_impar[i] * g_impar_ntt[i] * Math.pow(phi, 2 * bitrev(i, n / 2) + 1)) % q
      );

      point_wise_mult_impar = p_par.map((p_val, i) =>
          (p_val * g_impar_ntt[i] + p_impar[i] * g_par_ntt[i]) % q
      );

      const C_par = INTT(point_wise_mult_par, q);
      const C_impar = INTT(point_wise_mult_impar, q);

      return Array.from({ length: n }, (_, i) =>
          i % 2 === 0 ? C_par[Math.floor(i / 2)] : C_impar[Math.floor((i - 1) / 2)]
      );
  }

  if (!pnttdomain && gnttdomain) {
      // Sólo g está en el dominio NTT.
      p_par_ntt = NTT(p_par, q);
      p_impar_ntt = NTT(p_impar, q);

      point_wise_mult_par = p_par_ntt.map((p_val, i) =>
          (p_val * g_par[i] + p_impar_ntt[i] * g_impar[i] * Math.pow(phi, 2 * bitrev(i, n / 2) + 1)) % q
      );

      point_wise_mult_impar = p_par_ntt.map((p_val, i) =>
          (p_val * g_impar[i] + p_impar_ntt[i] * g_par[i]) % q
      );

      const C_par = INTT(point_wise_mult_par, q);
      const C_impar = INTT(point_wise_mult_impar, q);

      return Array.from({ length: n }, (_, i) =>
          i % 2 === 0 ? C_par[Math.floor(i / 2)] : C_impar[Math.floor((i - 1) / 2)]
      );
  }
}


function sumaPol(p, g) {
  return p.map((a, i) => (a + g[i]) % 3329);
}

function sumPols(v) {
  /**
   * Suma varios polinomios en lugar de solo una pareja.
   */
  let sum = v[0];
  for (let i = 1; i < v.length; i++) {
      sum = sumaPol(sum, v[i]);
  }
  return sum;
}

function vectorSum(u, v) {
  /**
   * Suma de dos vectores.
   */

  // Verificaciones:
  if (u[0].length !== v[0].length) {
      throw new Error('Las dimensiones deben ser iguales.');
  }

  for (let i = 0; i < u.length; i++) {
      for (let j = 0; j < u[0].length; j++) {
          if (u[i][j].length !== 256) {
              throw new Error('Los polinomios deben tener tamaño 256.');
          }
      }
  }

  // Código:
  let newElements = [];
  for (let i = 0; i < u.length; i++) {
      newElements.push(u[i].map((a, j) => sumaPol(a, v[i][j])));
  }
  return newElements;
}

function MatrizMultViaNTT(A, B, Anttdomain = false, Bnttdomain = false) {
  /**
   * Multiplicación de una Matriz A y otra B utilizando la multiplicación punto a punto en polinomios.
   */
  return A.map(A_row =>
      traspuesta(B).map(B_col =>
          sumPols(A_row.map((a, i) => pointwise(a, B_col[i])))
      )
  );
}

function pointwise(p, g) {
  /**
   * Multiplica dos polinomios usando la multiplicación punto a punto en Zq[x]/(x^2-w^2br(i)+1).
   */

  // Parámetros:
  const q = 3329;
  const n = 256;
  const phi = 17; // Primera 256-raíz primitiva de Z3329.

  // Rellenamos con ceros si los polinomios son menores de grado 256.
  if (p.length < n) {
      p = p.concat(Array(n - p.length).fill(0));
  }

  if (g.length < n) {
      g = g.concat(Array(n - g.length).fill(0));
  }

  const p_par = p.filter((_, idx) => idx % 2 === 0);
  const p_impar = p.filter((_, idx) => idx % 2 !== 0);

  const g_par = g.filter((_, idx) => idx % 2 === 0);
  const g_impar = g.filter((_, idx) => idx % 2 !== 0);

  const point_wise_mult_par = p_par.map((p_val, i) =>
      (p_val * g_par[i] + p_impar[i] * g_impar[i] * Math.pow(phi, 2 * bitrev(i, n / 2) + 1)) % q
  );

  const point_wise_mult_impar = p_par.map((p_val, i) =>
      (p_val * g_impar[i] + p_impar[i] * g_par[i]) % q
  );

  const pog = Array.from({ length: 256 }, (_, i) =>
      i % 2 === 0 ? point_wise_mult_par[Math.floor(i / 2)] : point_wise_mult_impar[Math.floor((i - 1) / 2)]
  );

  return pog;
}

// function traspuesta(matrix) {
//   return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
// }


function Parse(b) {
  /**
   * Función para cambiar de representación entre bytes y coeficientes de Zq[x]. (Parse)
   * Input: Conjunto de bytes arbitrario.
   * Output: Coeficientes de Zq[x] que se interpretarán como un elemento en el dominio NTT. (biyectivo)
   */
  let i = 0, j = 0;
  const n = 256;
  const q = 3329;
  let a = Array(n).fill(0);  // Serán nuestros coeficientes de Zq.

  while (j < n && i + 3 < b.length) {  // Por si el tamaño de bytes es pequeño.
      const d1 = b[i] + 256 * (b[i + 1] % 16);
      const d2 = Math.floor(b[i + 1] / 16) + 16 * b[i + 2];

      if (d1 < q) {
          a[j] = d1;
          j++;
      }
      if (d2 < q && j < n) {
          a[j] = d2;
          j++;
      }
      i += 3;
  }

  return a.map(elemento => parseInt(elemento));
}

function CBD(inputBytes, eta) {
  /**
   * Algoritmo 2 (Centered Binomial Distribution)
   * https://pq-crystals.org/kyber/data/kyber-specification-round3-20210804.pdf
   *
   * Se espera un inputBytes de al menos 64*eta de longitud.
   */
  const n = 256;
  if ((n >> 2) * eta !== inputBytes.length) {
      throw new Error("La longitud de inputBytes no es válida");
  }

  let coefficients = new Array(n).fill(0);
  const listOfBits = bytes2bits(inputBytes);

  for (let i = 0; i < n; i++) {
      let a = 0, b = 0;
      for (let j = 0; j < eta; j++) {
          a += listOfBits[2 * i * eta + j];
          b += listOfBits[2 * i * eta + eta + j];
      }
      coefficients[i] = a - b;
  }

  return coefficients;
}

function decode(inputBytes, l = null) {
  /**
   * Decode (Algorithm 3)
   * 
   * decode: B^32l -> R_q
   */
  const n = 256;
  const q = 3329;

  if (l === null) {
      const [calculatedL, r] = divmod(8 * inputBytes.length, n);
      l = calculatedL;
      if (r !== 0) {
          throw new Error("La lista de bytes de entrada debe tener una longitud múltiplo de 32.");
      }
  } else {
      if (n * l !== inputBytes.length * 8) {
          throw new Error("La lista de bytes de entrada debe tener una longitud múltiplo de 32.");
      }
  }

  let coefficients = new Array(n).fill(0);
  const listOfBits = bytes2bits(inputBytes);

  for (let i = 0; i < n; i++) {
      coefficients[i] = Array.from({ length: l }, (_, j) => listOfBits[i * l + j] << j)
          .reduce((a, b) => a + b, 0);
  }

  return coefficients;
}

function decodeMatrix(inputBytes, mFil, nCol, l = null) {
  /**
   * Decodificación de una matriz de polinomios.
   */
  const n = 256;

  if (l === null) {
      const [calculatedL, check] = divmod(8 * inputBytes.length, n * mFil * nCol);
      l = calculatedL;
      if (check !== 0) {
          throw new Error("La longitud del input de bytes debe ser múltiplo de 32.");
      }
  } else if (n * l * mFil * nCol > inputBytes.length * 8) {
      throw new Error("La longitud de bytes es pequeña para el l dado.");
  }

  const chunkLength = 32 * l;
  const byteChunks = [];

  for (let i = 0; i < inputBytes.length; i += chunkLength) {
      byteChunks.push(inputBytes.slice(i, i + chunkLength));
  }

  const matrix = Array.from({ length: mFil }, () => new Array(nCol).fill(0));

  for (let i = 0; i < mFil; i++) {
      for (let j = 0; j < nCol; j++) {
          matrix[i][j] = decode(byteChunks[nCol * i + j], l);
      }
  }

  return matrix;
}

function encode(p, l = null) {
  /**
   * Encode (Inverse of Algorithm 3)
   * 
   * R_q -> B^32l
   */
  if (l === null) {
      l = Math.max(...p.map(x => x.toString(2).length));
  }

  const bitString = p.map(c => c.toString(2).padStart(l, '0').split('').reverse().join('')).join('');
  return bits2bytes(bitString);
}

function encodeMatrix(A, l = null) {
  /**
   * Codificación de una matriz de polinomios.
   */
  let output = "";

  A.forEach(fila => {
      fila.forEach(elemento => {
          output += encode(elemento, l);
      });
  });

  return output;
}

// Función auxiliar para divmod (equivalente a divmod de Python)
function divmod(a, b) {
  return [Math.floor(a / b), a % b];
}

function roundUp(x) {
  /**
   * Redondea siempre hacia arriba si es 0.5.
   */
  return Math.round(x + 0.000001);
}

function compress(x, d) {
  /**
   * Comprime una lista de coeficientes/bytes de un polinomio.
   * No se conserva la invertibilidad con `decompress`, pero los resultados serán cercanos.
   */
  const q = 3329;  // Constante q para Kyber
  const comprMod = 2 ** d;
  const number = comprMod / q;
  const polComprimido = x.map(c => roundUp(number * c) % comprMod);
  return polComprimido;
}

function compressMatrix(A, d) {
  /**
   * Comprime los elementos de una matriz.
   */
  const B = Array.from({ length: A.length }, () => new Array(A[0].length).fill(0));

  for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A[0].length; j++) {
          B[i][j] = compress(A[i][j], d);
      }
  }
  return B;
}

function decompress(x, d) {
  /**
   * Descomprime una lista de coeficientes/bytes de un polinomio.
   * Aunque `x' = decompress(compress(x))`, no garantiza que `x' == x`, pero será cercano.
   */
  const q = 3329;
  const number = q / (2 ** d);
  const polDescomprimido = x.map(c => roundUp(number * c));
  return polDescomprimido;
}

function decompressMatrix(A, d) {
  /**
   * Descomprime los elementos de una matriz.
   */
  const B = Array.from({ length: A.length }, () => new Array(A[0].length).fill(0));

  for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A[0].length; j++) {
          B[i][j] = decompress(A[i][j], d);
      }
  }
  return B;
}

function generateErrorVector(k, sigma, eta, N) {
  /**
   * Función auxiliar que genera un elemento en el
   * módulo de la Distribución Binomial Centrada.
   */
  let elements = [];
  for (let i = 0; i < k; i++) {
      console.log("Sigma:",sigma);
      console.log("N:",N); 
      console.log("64 * eta:",64 * eta);
      let inputBytes = PRF(sigma, N, 64 * eta);
      console.log("Longitud de bytes:",inputBytes.length);
      if (inputBytes.length < 64 * eta) {
        throw new Error("La longitud de inputBytes generados no es válida.");
      }
      let poly = CBD(inputBytes, eta);
      elements.push(poly);
      N += 1;
  }

  let v = []; // Nuestro vector que entenderemos como matriz 2x1.
  v.push(elements); // Aquí estaría en 1x2, así que devolvemos la traspuesta.
  return [transpose(v), N];
}

function generateMatrixFromSeed(k, rho, transpose = false) {
  /**
   * Función auxiliar que genera un elemento de tamaño
   * k x k de una semilla `rho`.
   *
   * Cuando "transpose" se establece en True, la matriz A es
   * construida como la transposición.
   */
  let A = [];
  const n = 256;
  
  for (let i = 0; i < k; i++) {
      let row = [];
      for (let j = 0; j < k; j++) {
          let inputBytes;
          if (transpose) {
              inputBytes = XOF(rho, new Uint8Array([i]), new Uint8Array([j]), 3 * n);
          } else {
              inputBytes = XOF(rho, new Uint8Array([j]), new Uint8Array([i]), 3 * n);
          }
          let aij = Parse(inputBytes);
          row.push(aij);
      }
      A.push(row);
  }
  return A;
}

// Definir la función urandom
function urandom(byteCount) {
  const buffer = new Uint8Array(byteCount);
  randomFillSync(buffer); // Usar randomFillSync para Node.js
  return buffer;
}

export function keygen(k, n1) {
  /**
   * Algorithm 4 (Key Generation)
   * https://pq-crystals.org/kyber/data/kyber-specification-round3-20210804.pdf
   *
   * Input:
   *     None
   * Output:
   *     Secret Key (12*k*n) / 8      bytes
   *     Public Key (12*k*n) / 8 + 32 bytes
   */

  // Kyber parámetros
  const n = 256;
  const q = 3329;

  // Generamos 32 bytes aleatorios como semilla
  const d = randomBytes(32);

  // Generamos rho y sigma
  const [rho, sigma] = G(d);

  // Inicializamos contador para el PRF
  let N = 0;

  // Generamos la matriz A ∈ R^kxk
  const A_nt = generateMatrixFromSeed(k, rho);

  // Generamos el vector error s ∈ R^k
  let [s, N_new] = generateErrorVector(k, sigma, n1, N);
  N = N_new;
  const s_nt = s.map(si => [NTT_kyber(si[0])]);

  // Generamos el vector error e ∈ R^k
  let [e, N_new2] = generateErrorVector(k, sigma, n1, N);
  N = N_new2;
  const e_nt = e.map(ei => [NTT_kyber(ei[0])]);

  // Multiplicación de la matriz A y s_nt usando convolución
  let t = MatrizMultViaNTT(A_nt, s_nt);

  // Sumamos el vector error
  t = vectorSum(t, e_nt);

  // Codificamos la matriz t y el vector s_nt
  const pk = encodeMatrix(t, 12) + rho;
  const sk = encodeMatrix(s_nt, 12);

  // Imprimimos pk y sk (representados como listas de enteros)
  console.log('pk es:', Array.from(pk));
  console.log('sk es:', Array.from(sk));

  return [pk, sk];
}

function encryption(pk, m, r1, k, n1, n2, du, dv) {
  /**
   * Inputs: public key (pk), message (m), r = coins, k = dimension.
   * Output: Ciphertext as a combination of matrices and polynomials.
   */

  const n = 256;
  const q = 3329;
  let N = 0;

  const rho = pk.slice(-32);

  // Decodificamos la matriz de la clave pública
  const tt = decodeMatrix(pk, 1, k, 12);

  // Decodificamos y descomprimimos el mensaje
  const m_pol = decompress(decode(m, 1), 1);

  // Generamos matriz transpuesta, r aleatorio y error e2 desde la semilla
  const At = generateMatrixFromSeed(k, rho, true);

  let [r, N_new] = generateErrorVector(k, r1, n1, N);
  N = N_new;
  const r_nt = r.map(ri => [NTT_kyber(ri[0])]);

  let [e1, N_new2] = generateErrorVector(k, r1, n2, N);
  N = N_new2;

  const e2 = CBD(PRF(r1, N, 64 * n2), n2);

  // Operaciones de matrices y sumas en Rq
  let u = MatrizMultViaNTT(At, r_nt);
  u = u.map(ui => [INTT_kyber(ui[0])]);

  u = vectorSum(u, e1);

  let v = MatrizMultViaNTT(tt, r_nt)[0][0];
  v = INTT_kyber(v);
  v = sumaPol(v, e2);
  v = sumaPol(v, m_pol);

  // Codificamos
  const c1 = encodeMatrix(compressMatrix(u, du), du);
  const c2 = encode(compress(v, dv), dv);

  const c = c1 + c2;

  console.log('El mensaje cifrado es: ', c);
  return c;
}

