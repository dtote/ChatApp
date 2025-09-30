# Módulos del Benchmark Académico

Este directorio contiene la implementación modular del benchmark académico, siguiendo principios de código limpio y separación de responsabilidades.

## 📁 Estructura de Módulos

### 🔧 **config.js**
- **Propósito**: Configuración centralizada del sistema
- **Contenido**: URLs de API, timeouts, iteraciones, rutas de archivos
- **Uso**: Importar `CONFIG` para acceder a configuraciones

### 📏 **crypto-sizes.js**
- **Propósito**: Tamaños criptográficos oficiales según NIST
- **Contenido**: Tamaños de claves, firmas y ciphertexts
- **Uso**: Importar `CRYPTO_SIZES` y `getCryptoFootprint()`

### 🛠️ **utils.js**
- **Propósito**: Utilidades y funciones auxiliares
- **Contenido**: Cálculos estadísticos, formateo, validaciones
- **Uso**: Importar funciones específicas según necesidad

### 🌐 **api-client.js**
- **Propósito**: Cliente para comunicación con PQClean API
- **Contenido**: Métodos para llamadas HTTP con retry automático
- **Uso**: Instanciar `APIClient` para operaciones de API

### 🔐 **classical-benchmarks.js**
- **Propósito**: Benchmarks de algoritmos clásicos
- **Contenido**: RSA, ECDSA, ECDH
- **Uso**: Instanciar `ClassicalBenchmarks` para ejecutar benchmarks

### 🚀 **pqc-benchmarks.js**
- **Propósito**: Benchmarks de algoritmos post-cuánticos
- **Contenido**: ML-KEM, ML-DSA
- **Uso**: Instanciar `PostQuantumBenchmarks` para ejecutar benchmarks

### 📊 **display.js**
- **Propósito**: Visualización de resultados
- **Contenido**: Tablas, formateo, análisis comparativo
- **Uso**: Instanciar `ResultDisplay` para mostrar resultados

## 🎯 **Principios Aplicados**

### ✅ **Single Responsibility Principle (SRP)**
Cada módulo tiene una responsabilidad específica y bien definida.

### ✅ **Open/Closed Principle (OCP)**
Los módulos están abiertos para extensión pero cerrados para modificación.

### ✅ **Dependency Inversion Principle (DIP)**
Los módulos dependen de abstracciones (interfaces) no de implementaciones concretas.

### ✅ **Don't Repeat Yourself (DRY)**
Funcionalidad común extraída a módulos de utilidades.

### ✅ **Separation of Concerns**
Cada módulo maneja un aspecto específico del sistema.

## 🔄 **Flujo de Ejecución**

```
benchmark-refactored.js
├── config.js (configuración)
├── classical-benchmarks.js (RSA, ECDSA, ECDH)
├── pqc-benchmarks.js (ML-KEM, ML-DSA)
│   └── api-client.js (comunicación API)
├── display.js (visualización)
└── utils.js (utilidades)
```

## 📝 **Uso**

```javascript
import BenchmarkAcademico from './benchmark-refactored.js';

const benchmark = new BenchmarkAcademico();
await benchmark.runAllBenchmarks();
```

## 🧪 **Testing**

Cada módulo puede ser probado independientemente:

```javascript
import { ClassicalBenchmarks } from './modules/classical-benchmarks.js';

const benchmarks = new ClassicalBenchmarks();
const results = await benchmarks.benchmarkRSA();
```

## 🔧 **Mantenimiento**

- **Agregar algoritmo**: Extender el módulo correspondiente
- **Cambiar configuración**: Modificar `config.js`
- **Nueva visualización**: Extender `display.js`
- **Nueva API**: Extender `api-client.js`
