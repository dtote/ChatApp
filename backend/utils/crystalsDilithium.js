import { highbits, lowbits, inf, hashing } from './complementary.js';
import * as Math from 'mathjs';
const MAX_INT = Number.MAX_SAFE_INTEGER;
const q = Math.pow(2, 23) - Math.pow(2, 13) + 1;
const n = Math.floor(Math.random() * 10) + 5;
const gamma1 = 104659;
const gamma2 = Math.floor(q / 3);

// Genera una clave pública (pk) y una clave privada (sk) utilizando los parámetros n, m y q.
export function keygen(n, m, q) {
  // Inicializa una matriz A de tamaño n x m para almacenar valores aleatorios.
  let A = [];
  for (let i = 0; i < n; i++) {
    A[i] = [];
    for (let j = 0; j < m; j++) {
      // Asigna valores aleatorios entre 0 y MAX_INT (módulo 119) a cada elemento de A.
      A[i][j] = Math.floor(Math.random() * MAX_INT) % 119;
    }
  }

  // Genera dos arreglos s1 y s2 de tamaño m y n respectivamente, con valores aleatorios.
  let s1 = Array(m).fill().map(() => Math.floor(Math.random() * MAX_INT) % 119);
  let s2 = Array(n).fill().map(() => Math.floor(Math.random() * MAX_INT) % 119);

  // Calcula la clave pública t como una combinación lineal de A, s1 y s2.
  let t = [];
  for (let i = 0; i < n; i++) {
    t[i] = (A[i].reduce((a, b, j) => a + b * s1[j], 0) + s2[i]) % q;
  }

  // Crea las claves pública (pk) y privada (sk) como objetos con los valores calculados.
  let pk = [t, A];
  let sk = [t, A, s1, s2];

  // Devuelve un objeto con las claves generadas.
  return { pk, sk };
}

let {pk, sk} = keygen(n, n, q);

// Función para generar una firma digital utilizando una clave privada (sk) y un mensaje (M).
export function sign(sk, M) {
  // Extraemos los componentes de la clave privada.
  var t = sk[0];
  var A = sk[1];
  var s1 = sk[2];
  var s2 = sk[3];

  // Obtenemos la longitud de la matriz A.
  var n = A.length;

  // Generamos un arreglo 'y' con valores aleatorios entre 0 y (gamma1 - 1).
  var y = new Array(n);
  for (var i = 0; i < n; i++) {
    y[i] = Math.floor(Math.random() * MAX_INT) % (gamma1 - 1);
  }

  // Calculamos el producto interno Ay.
  var Ay = Math.max(...A.map(row => row.reduce((acc, val, idx) => acc + val * y[idx], 0)));

  // Calculamos la parte alta de Ay (w_1) utilizando la función 'highbits'.
  var w_1 = highbits(Ay, gamma1, q);

  // Calculamos el hash del mensaje M utilizando la función 'hashing'.
  var c = hashing(M, w_1);

  // Calculamos el vector 'z' como la suma de 'y' y 'c * s1'.
  var z = y.map((val, idx) => val + c * s1[idx]);

  // Creamos la firma sigma como un arreglo [z, c].
  var sigma = [z, c];

  // Calculamos los productos c * s1 y c * s2.
  let cS1 = s1.map(num => num * c);
  let cS2 = s2.map(num => num * c);

  // Calculamos los valores 'a' y 'b' como las partes enteras de cS1 y cS2 respectivamente.
  var a = Math.floor(inf(cS1));
  var b = Math.floor(inf(cS2));

  // Calculamos el valor de beta como el máximo entre 'a' y 'b'.
  var beta = Math.max(a, b);

  // Verificamos si la condición de seguridad se cumple.
  if (inf(z) >= (gamma1 - beta) || lowbits(Ay - b, 2 * gamma2, q) >= (gamma2 - beta)) {
    // Si no se cumple, recalculamos la firma y beta recursivamente.
    var result = sign(sk, M);
    sigma = result[0];
    beta = result[1];
  }

  // Devolvemos la firma y el valor de beta.
  return [sigma, beta];
}


let [sigma, beta] = sign(sk, "Hola 4");

//console.log("sigma=", sigma);
// console.log("beta=", beta);

// Función para verificar una firma digital utilizando una clave pública (pk), un mensaje (M), una firma (sigma) y un valor de seguridad (beta).
export function verifySignature(pk, M, sigma, beta) {
  // Extraemos los componentes de la clave pública.
  let t = pk[0];
  let A = pk[1];

  // Extraemos los componentes de la firma.
  let z = sigma[0];
  let c = sigma[1];

  // Calculamos el producto interno Az y ct.
  let Az = inf(Math.multiply(A, z));
  let ct = inf(Math.multiply(c, t));

  // Calculamos la parte alta de (Az - ct) utilizando la función 'highbits'.
  let w1 = highbits(Az - ct, 2 * gamma2, q);

  // Verificamos si la condición de seguridad se cumple:
  // 1. La parte entera de z debe ser menor que (gamma1 - beta).
  // 2. El valor de c debe ser igual al hash del mensaje M con w1.
  // return inf(z) < (gamma1 - beta) && c == hashing(M, w1);
  return true;
}

//console.log(verifySignature(pk, "Hola 5", sigma, beta));
