import { highbits, lowbits, inf, hashing } from './complementary.js';
const MAX_INT = Number.MAX_SAFE_INTEGER;
const q = Math.pow(2, 23) - Math.pow(2, 13) + 1;
const n = Math.floor(Math.random() * 10) + 5;
const gamma1 = 104659;
const gamma2 = Math.floor(q / 3);

export function keygen(n, m, q) {
  let A = [];
  for(let i = 0; i < n; i++) {
    A[i] = [];
    for(let j = 0; j < m; j++) {
      A[i][j] = Math.floor(Math.random() * MAX_INT) % 119;
    }
  }

  let s1 = Array(m).fill().map(() => Math.floor(Math.random() * MAX_INT) % 119);
  let s2 = Array(n).fill().map(() => Math.floor(Math.random() * MAX_INT) % 119);

  let t = [];
  for(let i = 0; i < n; i++) {
    t[i] = (A[i].reduce((a, b, j) => a + b * s1[j], 0) + s2[i]) % q;
  }

  let pk = [t, A];
  let sk = [t, A, s1, s2];

  return {pk, sk};
}

let {pk, sk} = keygen(n, n, q);

export function sign(sk, M) {
  let t = sk[0];
  let A = sk[1];
  let s1 = sk[2];
  let s2 = sk[3];

  let [n, m] = [A.length, A[0].length];

  let y = Array(m).fill().map(() => Math.floor(Math.random() * MAX_INT) % (gamma1 - 1));
  let Ay = A.map((row, i) => row.reduce((a, b, j) => a + b * y[j], 0)).reduce((a, b) => Math.max(a, b));

  let w_1 = highbits(Ay, gamma1, q);
  let c = hashing(M, w_1);
  let z = y.map((val, i) => (val + c * s1[i]) % q);

  let sigma = [z, c];

  let a = Math.floor(inf(c * s1.reduce((a, b) => a + b, 0)));
  let b = Math.floor(inf(c * s2.reduce((a, b) => a + b, 0)));

  let beta = Math.max(a, b);

  if (inf(z.reduce((a, b) => a + b, 0)) >= (gamma1 - beta) || lowbits(Ay - b, 2 * gamma2, q) >= (gamma2 - beta)) {
    return sign(sk, M);
  }
    
  return {sigma, beta};
}

let {sigma, beta} = sign(sk, "Mensaje a firmar");
console.log(sigma, beta);

export function verifySignature(pk, M, sigma, beta) {
  let t = pk[0];
  let A = pk[1];

  let [n, m] = [A.length, A[0].length];

  let z = sigma[0];
  let c = sigma[1];


  let Az = inf(A.map((row, i) => row.reduce((a, b, j) => a + b * z[j], 0)));
  let ct = inf(t.map((val, i) => val * c));

  let w1 = highbits(Az - ct, 2 * gamma2, q);

  return inf(z) < (gamma1 - beta) && c === hashing(M, w1);
}

console.log(verifySignature(pk, "Mensaje a firmar", sigma, beta));