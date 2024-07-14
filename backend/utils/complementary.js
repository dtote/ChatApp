import crypto from 'crypto';

// Reducción modular de r respecto a alpha
export function modpm(r, alpha) {
  let a = Math.floor((alpha - 1) / 2) + 1;
  let b = Math.floor(r / 2 + 1);
  let r1 = r % alpha;

  if (alpha % 2 === 0) {
    if (!(r1 < b)) {
      r1 -= alpha;
    } else {
      if (!(r1 < a)) {
        r1 -= alpha;
      }
    }
  }
  return r1;
}

// Función para aplicar la descomposición de un módulo q
export function decompose(r, alpha, q) {
  r = r % q;
  let r0 = modpm(r, alpha);

  let r1;
  if (r - r0 === q - 1) {
    r1 = 0;
    r0 = r0 - 1;
  } else {
    r1 = Math.floor((r - r0) / alpha);
  }
  return [r1, r0];
}

// Funciones utilizadas en el proceso de la firma

// Función que devuelve la parte alta de un número
export function highbits(r, alpha, q) {
  return decompose(r, alpha, q)[0];
}

// Función que devuelve la parte baja de un número
export function lowbits(r, alpha, q) {
  return decompose(r, alpha, q)[1];
}

// Esta función calcula la norma infinito de una matriz
export function inf(matriz) {
  if (Array.isArray(matriz)) {
    return Math.max(...matriz.map(row => Array.isArray(row) ? Math.max(...row) : 0));
  }
}
  

// Función que se utiliza para calcular el hash de un mensaje
export function hashing(text, w_1) {
  const hash = crypto.createHash('sha256');
  hash.update(text);
  const hashResult = parseInt(hash.digest('hex'), 16) % Math.pow(10, w_1);
  return hashResult;
}

// Ejemplo de uso:

// Almacenar la contraseña de un usuario
// let contraseña = "mi_contraseña_segura";
// let w_1 = 5;
// let hash_contraseña = hashing(contraseña, w_1);
// let almacenamiento_seguro = hash_contraseña;
// let contraseña_introducida = "mi_contraseña_segura"; // Esta sería la contraseña introducida por el usuario
// let hash_contraseña_introducida = hashing(contraseña_introducida, w_1);

// if (hash_contraseña_introducida === almacenamiento_seguro) {
//     console.log("Inicio de sesión exitoso!");
// } else {
//     console.log("Contraseña incorrecta!");
// }
