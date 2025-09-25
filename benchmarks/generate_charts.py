#!/usr/bin/env python3
"""
Generador de Gráficas Final para Benchmark de Criptografía Post-Cuántica
Estructura específica: Una gráfica por cada tipo de operación
"""

import json
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

# Configurar estilo académico
plt.style.use('seaborn-v0_8-whitegrid')

class FinalChartGenerator:
    def __init__(self, json_file="results/benchmark-academico.json"):
        self.json_file = json_file
        self.data = self.load_data()
        
    def load_data(self):
        """Cargar datos del archivo JSON del benchmark"""
        try:
            with open(self.json_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ Archivo {self.json_file} no encontrado")
            return None
    
    def create_all_charts(self):
        """Crear todas las gráficas según la estructura específica"""
        print("🚀 Generador de Gráficas Final")
        print("=" * 50)
        print("📊 Estructura: Una gráfica por cada tipo de operación")
        print()
        
        # 1. Key Generation (Generación de Claves)
        self.create_keygen_chart()
        
        # 2. Key Encapsulation (Encapsulación de Claves)
        self.create_encapsulation_chart()
        
        # 3. Key Decapsulation (Decapsulación de Claves)
        self.create_decapsulation_chart()
        
        # 4. Digital Signing (Firma Digital)
        self.create_signing_chart()
        
        # 5. Signature Verification (Verificación de Firmas)
        self.create_verification_chart()
        
        print("✅ Todas las gráficas finales generadas exitosamente!")
    
    def create_keygen_chart(self):
        """Key Generation: ML-KEM vs RSA vs ECDH"""
        fig, ax = plt.subplots(figsize=(14, 8))
        
        pq_values = []
        pq_labels = []
        classical_values = []
        classical_labels = []
        
        # ML-KEM (Post-Quantum)
        if 'postQuantum' in self.data and 'mlKem' in self.data['postQuantum']:
            ml_kem = self.data['postQuantum']['mlKem']
            for variant in ['ML-KEM-512', 'ML-KEM-768', 'ML-KEM-1024']:
                if variant in ml_kem and 'keyGeneration' in ml_kem[variant]:
                    time_ms = ml_kem[variant]['keyGeneration']['avgTime'] * 1000  # Convert to µs
                    pq_values.append(time_ms)
                    pq_labels.append(variant)
        
        # RSA (Classical)
        if 'classical' in self.data and 'rsa' in self.data['classical']:
            rsa = self.data['classical']['rsa']
            for variant in ['2048', '3072', '4096']:
                if variant in rsa and 'keyGeneration' in rsa[variant]:
                    time_ms = rsa[variant]['keyGeneration']['avgTime'] * 1000  # Convert to µs
                    classical_values.append(time_ms)
                    classical_labels.append(f'RSA-{variant}')
        
        # ECDH (Classical)
        if 'classical' in self.data and 'ecdh' in self.data['classical']:
            ecdh = self.data['classical']['ecdh']
            for variant in ['prime256v1', 'secp384r1', 'secp521r1']:
                if variant in ecdh and 'keyGeneration' in ecdh[variant]:
                    time_ms = ecdh[variant]['keyGeneration']['avgTime'] * 1000  # Convert to µs
                    classical_values.append(time_ms)
                    curve_name = variant.replace('prime', 'P').replace('secp', 'P')
                    classical_labels.append(f'ECDH-{curve_name}')
        
        # Crear posiciones agrupadas
        x_pq = range(len(pq_values))
        x_classical = range(len(pq_values), len(pq_values) + len(classical_values))
        
        # Colores únicos para cada algoritmo
        all_colors = ['#4ECDC4', '#45B7D1', '#96CEB4', '#FF7675', '#74B9FF', '#A29BFE', '#00B894', '#FDCB6E', '#E17055']
        all_values = pq_values + classical_values
        all_labels = pq_labels + classical_labels
        all_positions = list(x_pq) + list(x_classical)
        
        # Crear barras individuales con colores únicos
        bars = []
        for i, (pos, val, label, color) in enumerate(zip(all_positions, all_values, all_labels, all_colors)):
            bar = ax.bar(pos, val, color=color, alpha=0.8, label=label)
            bars.append(bar)
        
        # Configurar gráfica
        ax.set_yscale('log')
        ax.set_ylabel('Average Time in Logarithmic Scale (µs)', fontsize=12, fontweight='bold')
        ax.set_xlabel('Key Generation Algorithms', fontsize=12, fontweight='bold')
        ax.set_title('Key Generation Performance: Post-Quantum vs Classical\n(ML-KEM vs RSA vs ECDH)', fontsize=14, fontweight='bold')
        
        # Etiquetas del eje X
        ax.set_xticks(all_positions)
        ax.set_xticklabels(all_labels, rotation=45, ha='right')
        
        # Línea separadora
        if pq_values and classical_values:
            separator_pos = len(pq_values) - 0.5
            ax.axvline(x=separator_pos, color='black', linestyle='--', alpha=0.5, linewidth=1)
        
        ax.grid(True, alpha=0.3)
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        
        # Valores en barras
        for i, (pos, val) in enumerate(zip(all_positions, all_values)):
            ax.text(pos, val, f'{val:.1f}', ha='center', va='bottom', fontsize=9)
        
        plt.tight_layout()
        plt.savefig('benchmark_keygen_final.png', dpi=300, bbox_inches='tight')
        plt.show()
        print("✅ Gráfica de KeyGen guardada: benchmark_keygen_final.png")
    
    def create_encapsulation_chart(self):
        """Key Encapsulation: ML-KEM vs RSA vs ECDH"""
        fig, ax = plt.subplots(figsize=(14, 8))
        
        pq_values = []
        pq_labels = []
        classical_values = []
        classical_labels = []
        
        # ML-KEM Encryption (Post-Quantum)
        if 'postQuantum' in self.data and 'mlKem' in self.data['postQuantum']:
            ml_kem = self.data['postQuantum']['mlKem']
            for variant in ['ML-KEM-512', 'ML-KEM-768', 'ML-KEM-1024']:
                if variant in ml_kem and 'encryption' in ml_kem[variant]:
                    time_ms = ml_kem[variant]['encryption']['avgTime'] * 1000
                    pq_values.append(time_ms)
                    pq_labels.append(variant)
        
        # RSA Encryption (Classical)
        if 'classical' in self.data and 'rsa' in self.data['classical']:
            rsa = self.data['classical']['rsa']
            for variant in ['2048', '3072', '4096']:
                if variant in rsa and 'encryption' in rsa[variant]:
                    time_ms = rsa[variant]['encryption']['avgTime'] * 1000
                    classical_values.append(time_ms)
                    classical_labels.append(f'RSA-{variant}')
        
        # ECDH - Usar datos de KeyGen ya que no tenemos encapsulación separada
        # En ECDH, la "encapsulación" es parte del intercambio de claves
        if 'classical' in self.data and 'ecdh' in self.data['classical']:
            ecdh = self.data['classical']['ecdh']
            for variant in ['prime256v1', 'secp384r1', 'secp521r1']:
                if variant in ecdh and 'keyGeneration' in ecdh[variant]:
                    # Usar tiempo de generación como proxy para encapsulación
                    time_ms = ecdh[variant]['keyGeneration']['avgTime'] * 1000
                    classical_values.append(time_ms)
                    curve_name = variant.replace('prime', 'P').replace('secp', 'P')
                    classical_labels.append(f'ECDH-{curve_name}')
        
        # Crear posiciones agrupadas
        x_pq = range(len(pq_values))
        x_classical = range(len(pq_values), len(pq_values) + len(classical_values))
        
        # Colores únicos para cada algoritmo
        all_colors = ['#4ECDC4', '#45B7D1', '#96CEB4', '#FF7675', '#74B9FF', '#A29BFE', '#00B894', '#FDCB6E', '#E17055']
        all_values = pq_values + classical_values
        all_labels = pq_labels + classical_labels
        all_positions = list(x_pq) + list(x_classical)
        
        # Crear barras individuales con colores únicos
        bars = []
        for i, (pos, val, label, color) in enumerate(zip(all_positions, all_values, all_labels, all_colors)):
            bar = ax.bar(pos, val, color=color, alpha=0.8, label=label)
            bars.append(bar)
        
        # Configurar gráfica
        ax.set_yscale('log')
        ax.set_ylabel('Average Time in Logarithmic Scale (µs)', fontsize=12, fontweight='bold')
        ax.set_xlabel('Key Encapsulation Algorithms', fontsize=12, fontweight='bold')
        ax.set_title('Key Encapsulation Performance: Post-Quantum vs Classical\n(ML-KEM vs RSA vs ECDH)', fontsize=14, fontweight='bold')
        
        # Etiquetas del eje X
        ax.set_xticks(all_positions)
        ax.set_xticklabels(all_labels, rotation=45, ha='right')
        
        # Línea separadora
        if pq_values and classical_values:
            separator_pos = len(pq_values) - 0.5
            ax.axvline(x=separator_pos, color='black', linestyle='--', alpha=0.5, linewidth=1)
        
        ax.grid(True, alpha=0.3)
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        
        # Valores en barras
        for i, (pos, val) in enumerate(zip(all_positions, all_values)):
            ax.text(pos, val, f'{val:.3f}', ha='center', va='bottom', fontsize=9)
        
        plt.tight_layout()
        plt.savefig('benchmark_encapsulation_final.png', dpi=300, bbox_inches='tight')
        plt.show()
        print("✅ Gráfica de Encapsulation guardada: benchmark_encapsulation_final.png")
    
    def create_decapsulation_chart(self):
        """Key Decapsulation: ML-KEM vs RSA vs ECDH"""
        fig, ax = plt.subplots(figsize=(14, 8))
        
        pq_values = []
        pq_labels = []
        classical_values = []
        classical_labels = []
        
        # ML-KEM Decryption (Post-Quantum)
        if 'postQuantum' in self.data and 'mlKem' in self.data['postQuantum']:
            ml_kem = self.data['postQuantum']['mlKem']
            for variant in ['ML-KEM-512', 'ML-KEM-768', 'ML-KEM-1024']:
                if variant in ml_kem and 'decryption' in ml_kem[variant]:
                    time_ms = ml_kem[variant]['decryption']['avgTime'] * 1000
                    pq_values.append(time_ms)
                    pq_labels.append(variant)
        
        # RSA Decryption (Classical)
        if 'classical' in self.data and 'rsa' in self.data['classical']:
            rsa = self.data['classical']['rsa']
            for variant in ['2048', '3072', '4096']:
                if variant in rsa and 'decryption' in rsa[variant]:
                    time_ms = rsa[variant]['decryption']['avgTime'] * 1000
                    classical_values.append(time_ms)
                    classical_labels.append(f'RSA-{variant}')
        
        # ECDH - Usar datos de KeyGen ya que no tenemos decapsulación separada
        # En ECDH, la "decapsulación" es parte del intercambio de claves
        if 'classical' in self.data and 'ecdh' in self.data['classical']:
            ecdh = self.data['classical']['ecdh']
            for variant in ['prime256v1', 'secp384r1', 'secp521r1']:
                if variant in ecdh and 'keyGeneration' in ecdh[variant]:
                    # Usar tiempo de generación como proxy para decapsulación
                    time_ms = ecdh[variant]['keyGeneration']['avgTime'] * 1000
                    classical_values.append(time_ms)
                    curve_name = variant.replace('prime', 'P').replace('secp', 'P')
                    classical_labels.append(f'ECDH-{curve_name}')
        
        # Crear posiciones agrupadas
        x_pq = range(len(pq_values))
        x_classical = range(len(pq_values), len(pq_values) + len(classical_values))
        
        # Colores únicos para cada algoritmo
        all_colors = ['#4ECDC4', '#45B7D1', '#96CEB4', '#FF7675', '#74B9FF', '#A29BFE', '#00B894', '#FDCB6E', '#E17055']
        all_values = pq_values + classical_values
        all_labels = pq_labels + classical_labels
        all_positions = list(x_pq) + list(x_classical)
        
        # Crear barras individuales con colores únicos
        bars = []
        for i, (pos, val, label, color) in enumerate(zip(all_positions, all_values, all_labels, all_colors)):
            bar = ax.bar(pos, val, color=color, alpha=0.8, label=label)
            bars.append(bar)
        
        # Configurar gráfica
        ax.set_yscale('log')
        ax.set_ylabel('Average Time in Logarithmic Scale (µs)', fontsize=12, fontweight='bold')
        ax.set_xlabel('Key Decapsulation Algorithms', fontsize=12, fontweight='bold')
        ax.set_title('Key Decapsulation Performance: Post-Quantum vs Classical\n(ML-KEM vs RSA vs ECDH)', fontsize=14, fontweight='bold')
        
        # Etiquetas del eje X
        ax.set_xticks(all_positions)
        ax.set_xticklabels(all_labels, rotation=45, ha='right')
        
        # Línea separadora
        if pq_values and classical_values:
            separator_pos = len(pq_values) - 0.5
            ax.axvline(x=separator_pos, color='black', linestyle='--', alpha=0.5, linewidth=1)
        
        ax.grid(True, alpha=0.3)
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        
        # Valores en barras
        for i, (pos, val) in enumerate(zip(all_positions, all_values)):
            ax.text(pos, val, f'{val:.3f}', ha='center', va='bottom', fontsize=9)
        
        plt.tight_layout()
        plt.savefig('benchmark_decapsulation_final.png', dpi=300, bbox_inches='tight')
        plt.show()
        print("✅ Gráfica de Decapsulation guardada: benchmark_decapsulation_final.png")
    
    def create_signing_chart(self):
        """Digital Signing: ML-DSA vs RSA vs ECDSA"""
        fig, ax = plt.subplots(figsize=(14, 8))
        
        pq_values = []
        pq_labels = []
        classical_values = []
        classical_labels = []
        
        # ML-DSA Signing (Post-Quantum)
        if 'postQuantum' in self.data and 'mlDsa' in self.data['postQuantum']:
            ml_dsa = self.data['postQuantum']['mlDsa']
            for variant in ['ML-DSA-44', 'ML-DSA-65', 'ML-DSA-87']:
                if variant in ml_dsa and 'signing' in ml_dsa[variant]:
                    time_ms = ml_dsa[variant]['signing']['avgTime'] * 1000
                    pq_values.append(time_ms)
                    pq_labels.append(variant)
        
        # RSA Signing (Classical)
        if 'classical' in self.data and 'rsa' in self.data['classical']:
            rsa = self.data['classical']['rsa']
            for variant in ['2048', '3072', '4096']:
                if variant in rsa and 'signing' in rsa[variant]:
                    time_ms = rsa[variant]['signing']['avgTime'] * 1000
                    classical_values.append(time_ms)
                    classical_labels.append(f'RSA-{variant}')
        
        # ECDSA Signing (Classical)
        if 'classical' in self.data and 'ecdsa' in self.data['classical']:
            ecdsa = self.data['classical']['ecdsa']
            for variant in ['prime256v1', 'secp384r1', 'secp521r1']:
                if variant in ecdsa and 'signing' in ecdsa[variant]:
                    time_ms = ecdsa[variant]['signing']['avgTime'] * 1000
                    classical_values.append(time_ms)
                    curve_name = variant.replace('prime', 'P').replace('secp', 'P')
                    classical_labels.append(f'ECDSA-{curve_name}')
        
        # Crear posiciones agrupadas
        x_pq = range(len(pq_values))
        x_classical = range(len(pq_values), len(pq_values) + len(classical_values))
        
        # Colores únicos para cada algoritmo
        all_colors = ['#96CEB4', '#FFEAA7', '#DDA0DD', '#FF7675', '#74B9FF', '#A29BFE', '#00B894', '#FDCB6E', '#E17055']
        all_values = pq_values + classical_values
        all_labels = pq_labels + classical_labels
        all_positions = list(x_pq) + list(x_classical)
        
        # Crear barras individuales con colores únicos
        bars = []
        for i, (pos, val, label, color) in enumerate(zip(all_positions, all_values, all_labels, all_colors)):
            bar = ax.bar(pos, val, color=color, alpha=0.8, label=label)
            bars.append(bar)
        
        # Configurar gráfica
        ax.set_yscale('log')
        ax.set_ylabel('Average Time in Logarithmic Scale (µs)', fontsize=12, fontweight='bold')
        ax.set_xlabel('Digital Signing Algorithms', fontsize=12, fontweight='bold')
        ax.set_title('Digital Signing Performance: Post-Quantum vs Classical\n(ML-DSA vs RSA vs ECDSA)', fontsize=14, fontweight='bold')
        
        # Etiquetas del eje X
        ax.set_xticks(all_positions)
        ax.set_xticklabels(all_labels, rotation=45, ha='right')
        
        # Línea separadora
        if pq_values and classical_values:
            separator_pos = len(pq_values) - 0.5
            ax.axvline(x=separator_pos, color='black', linestyle='--', alpha=0.5, linewidth=1)
        
        ax.grid(True, alpha=0.3)
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        
        # Valores en barras
        for i, (pos, val) in enumerate(zip(all_positions, all_values)):
            ax.text(pos, val, f'{val:.1f}', ha='center', va='bottom', fontsize=9)
        
        plt.tight_layout()
        plt.savefig('benchmark_signing_final.png', dpi=300, bbox_inches='tight')
        plt.show()
        print("✅ Gráfica de Signing guardada: benchmark_signing_final.png")
    
    def create_verification_chart(self):
        """Signature Verification: ML-DSA vs RSA vs ECDSA"""
        fig, ax = plt.subplots(figsize=(14, 8))
        
        pq_values = []
        pq_labels = []
        classical_values = []
        classical_labels = []
        
        # ML-DSA Verification (Post-Quantum)
        if 'postQuantum' in self.data and 'mlDsa' in self.data['postQuantum']:
            ml_dsa = self.data['postQuantum']['mlDsa']
            for variant in ['ML-DSA-44', 'ML-DSA-65', 'ML-DSA-87']:
                if variant in ml_dsa and 'verification' in ml_dsa[variant]:
                    time_ms = ml_dsa[variant]['verification']['avgTime'] * 1000
                    pq_values.append(time_ms)
                    pq_labels.append(variant)
        
        # RSA Verification (Classical)
        if 'classical' in self.data and 'rsa' in self.data['classical']:
            rsa = self.data['classical']['rsa']
            for variant in ['2048', '3072', '4096']:
                if variant in rsa and 'verification' in rsa[variant]:
                    time_ms = rsa[variant]['verification']['avgTime'] * 1000
                    classical_values.append(time_ms)
                    classical_labels.append(f'RSA-{variant}')
        
        # ECDSA Verification (Classical)
        if 'classical' in self.data and 'ecdsa' in self.data['classical']:
            ecdsa = self.data['classical']['ecdsa']
            for variant in ['prime256v1', 'secp384r1', 'secp521r1']:
                if variant in ecdsa and 'verification' in ecdsa[variant]:
                    time_ms = ecdsa[variant]['verification']['avgTime'] * 1000
                    classical_values.append(time_ms)
                    curve_name = variant.replace('prime', 'P').replace('secp', 'P')
                    classical_labels.append(f'ECDSA-{curve_name}')
        
        # Crear posiciones agrupadas
        x_pq = range(len(pq_values))
        x_classical = range(len(pq_values), len(pq_values) + len(classical_values))
        
        # Colores únicos para cada algoritmo
        all_colors = ['#96CEB4', '#FFEAA7', '#DDA0DD', '#FF7675', '#74B9FF', '#A29BFE', '#00B894', '#FDCB6E', '#E17055']
        all_values = pq_values + classical_values
        all_labels = pq_labels + classical_labels
        all_positions = list(x_pq) + list(x_classical)
        
        # Crear barras individuales con colores únicos
        bars = []
        for i, (pos, val, label, color) in enumerate(zip(all_positions, all_values, all_labels, all_colors)):
            bar = ax.bar(pos, val, color=color, alpha=0.8, label=label)
            bars.append(bar)
        
        # Configurar gráfica
        ax.set_yscale('log')
        ax.set_ylabel('Average Time in Logarithmic Scale (µs)', fontsize=12, fontweight='bold')
        ax.set_xlabel('Signature Verification Algorithms', fontsize=12, fontweight='bold')
        ax.set_title('Signature Verification Performance: Post-Quantum vs Classical\n(ML-DSA vs RSA vs ECDSA)', fontsize=14, fontweight='bold')
        
        # Etiquetas del eje X
        ax.set_xticks(all_positions)
        ax.set_xticklabels(all_labels, rotation=45, ha='right')
        
        # Línea separadora
        if pq_values and classical_values:
            separator_pos = len(pq_values) - 0.5
            ax.axvline(x=separator_pos, color='black', linestyle='--', alpha=0.5, linewidth=1)
        
        ax.grid(True, alpha=0.3)
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        
        # Valores en barras
        for i, (pos, val) in enumerate(zip(all_positions, all_values)):
            ax.text(pos, val, f'{val:.1f}', ha='center', va='bottom', fontsize=9)
        
        plt.tight_layout()
        plt.savefig('benchmark_verification_final.png', dpi=300, bbox_inches='tight')
        plt.show()
        print("✅ Gráfica de Verification guardada: benchmark_verification_final.png")

def main():
    generator = FinalChartGenerator()
    if generator.data:
        generator.create_all_charts()
    else:
        print("❌ No se pudieron cargar los datos del benchmark")

if __name__ == "__main__":
    main()
