#!/usr/bin/env python3
"""
Generador de Gráficas Simplificado para Benchmark de Criptografía Post-Cuántica
Solo comparaciones académicamente válidas: KeyGen + Signing + Verification
"""

import json
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

# Configurar estilo académico
plt.style.use('seaborn-v0_8-whitegrid')

def get_algorithm_colors():
    """Sistema de colores por algoritmo con tonalidades para mejor identificación"""
    colors = {}
    
    # ML-KEM (azules - transición suave)
    colors['ML-KEM-512'] = '#1e3a8a'    # azul muy oscuro
    colors['ML-KEM-768'] = '#3b82f6'    # azul medio
    colors['ML-KEM-1024'] = '#93c5fd'   # azul claro
    
    # ML-DSA (azules verdosos - transición suave)
    colors['ML-DSA-44'] = '#0f766e'     # azul verdoso muy oscuro
    colors['ML-DSA-65'] = '#14b8a6'     # azul verdoso medio
    colors['ML-DSA-87'] = '#5eead4'     # azul verdoso claro
    
    # RSA (naranjas - transición suave)
    colors['RSA-2048'] = '#ea580c'      # naranja oscuro
    colors['RSA-3072'] = '#f97316'      # naranja medio
    colors['RSA-4096'] = '#fed7aa'      # naranja claro
    
    # ECDH (azules grisáceos - transición suave)
    colors['ECDH-prime256v1'] = '#475569'   # azul grisáceo oscuro
    colors['ECDH-secp384r1'] = '#64748b'   # azul grisáceo medio
    colors['ECDH-secp521r1'] = '#94a3b8'   # azul grisáceo claro
    
    # ECDSA (grises - transición suave)
    colors['ECDSA-prime256v1'] = '#374151'    # gris muy oscuro
    colors['ECDSA-secp384r1'] = '#6b7280'    # gris medio
    colors['ECDSA-secp521r1'] = '#d1d5db'    # gris claro
    
    
    return colors

def get_ordered_legend_items(pq_values, pq_labels, classical_values, classical_labels):
    """Ordena los elementos de la leyenda agrupando por algoritmo"""
    # Definir orden específico para cada algoritmo (agrupado por familia)
    algorithm_order = {
        # ML-KEM (grupo 1)
        'ML-KEM-512': 1, 'ML-KEM-768': 2, 'ML-KEM-1024': 3,
        # ML-DSA (grupo 2)
        'ML-DSA-44': 4, 'ML-DSA-65': 5, 'ML-DSA-87': 6,
        # RSA (grupo 3)
        'RSA-2048': 7, 'RSA-3072': 8, 'RSA-4096': 9,
        # ECDH (grupo 4)
        'ECDH-prime256v1': 10, 'ECDH-secp384r1': 11, 'ECDH-secp521r1': 12,
        # ECDSA (grupo 5)
        'ECDSA-prime256v1': 13, 'ECDSA-secp384r1': 14, 'ECDSA-secp521r1': 15
    }
    
    # Crear lista combinada de todos los elementos
    all_items = []
    
    # Agregar elementos post-cuánticos
    for val, label in zip(pq_values, pq_labels):
        all_items.append((val, label, 'pq'))
    
    # Agregar elementos clásicos
    for val, label in zip(classical_values, classical_labels):
        all_items.append((val, label, 'classical'))
    
    # Ordenar por el orden definido del algoritmo
    all_items.sort(key=lambda x: algorithm_order.get(x[1], 999))
    
    # Retornar todos los elementos ordenados globalmente
    all_values_sorted = [item[0] for item in all_items]
    all_labels_sorted = [item[1] for item in all_items]
    
    # Separar en grupos post-cuánticos y clásicos para mantener compatibilidad
    pq_sorted = [(val, label) for val, label, group in all_items if group == 'pq']
    classical_sorted = [(val, label) for val, label, group in all_items if group == 'classical']
    
    pq_values_sorted = [item[0] for item in pq_sorted]
    pq_labels_sorted = [item[1] for item in pq_sorted]
    classical_values_sorted = [item[0] for item in classical_sorted]
    classical_labels_sorted = [item[1] for item in classical_sorted]
    
    return pq_values_sorted, pq_labels_sorted, classical_values_sorted, classical_labels_sorted

class SimplifiedChartGenerator:
    def __init__(self, json_file="results/benchmark-results.json"):
        self.json_file = json_file
        self.data = self.load_data()
        
    def load_data(self):
        """Cargar datos del benchmark desde JSON"""
        try:
            with open(self.json_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ Archivo {self.json_file} no encontrado")
            return None
    
    def create_all_charts(self):
        """Crear gráficas académicas: Solo comparaciones válidas"""
        print("🚀 Generador de Gráficas Simplificado")
        print("=" * 50)
        print("📊 Generando gráficas académicas para paper...")
        print("🎯 Solo comparaciones válidas: KeyGen + Signing + Verification")
        print()
        
        # 1. Key Generation (Generación de Claves) - TODOS los algoritmos
        self.create_keygen_chart()
        
        # 2. Digital Signing (Firma Digital) - Solo algoritmos de firma
        self.create_signing_chart()
        
        # 3. Signature Verification (Verificación de Firmas) - Solo algoritmos de firma
        self.create_verification_chart()
        
        print("✅ Gráficas académicas generadas exitosamente!")
        print("📋 3 gráficas: KeyGen + Signing + Verification")
    
    def create_keygen_chart(self):
        """Key Generation: Todos los algoritmos"""
        fig, ax = plt.subplots(figsize=(16, 10))
        
        pq_values = []
        pq_labels = []
        classical_values = []
        classical_labels = []
        
        # ML-KEM Key Generation (Post-Quantum)
        if 'postQuantum' in self.data and 'mlKem' in self.data['postQuantum']:
            ml_kem = self.data['postQuantum']['mlKem']
            for variant in ['ML-KEM-512', 'ML-KEM-768', 'ML-KEM-1024']:
                if variant in ml_kem and 'keyGeneration' in ml_kem[variant]:
                    time_us = ml_kem[variant]['keyGeneration']['avgTime'] * 1000  # Convertir a microsegundos
                    pq_values.append(time_us)
                    pq_labels.append(variant)
        
        
        
        # RSA Key Generation (Classical)
        if 'classical' in self.data and 'rsa' in self.data['classical']:
            rsa = self.data['classical']['rsa']
            for variant in ['RSA-2048', 'RSA-3072', 'RSA-4096']:
                if variant in rsa and 'keyGeneration' in rsa[variant]:
                    time_us = rsa[variant]['keyGeneration']['avgTime'] * 1000  # Convertir a microsegundos
                    classical_values.append(time_us)
                    classical_labels.append(variant)
        
        # ECDH Key Generation (Classical)
        if 'classical' in self.data and 'ecdh' in self.data['classical']:
            ecdh = self.data['classical']['ecdh']
            for variant in ['prime256v1', 'secp384r1', 'secp521r1']:
                if variant in ecdh and 'keyGeneration' in ecdh[variant]:
                    time_us = ecdh[variant]['keyGeneration']['avgTime'] * 1000  # Convertir a microsegundos
                    classical_values.append(time_us)
                    classical_labels.append(f'ECDH-{variant}')
        
        
        # Ordenar elementos para leyenda consistente
        pq_values_sorted, pq_labels_sorted, classical_values_sorted, classical_labels_sorted = get_ordered_legend_items(
            pq_values, pq_labels, classical_values, classical_labels
        )
        
        # Crear lista ordenada globalmente
        all_values = pq_values_sorted + classical_values_sorted
        all_labels = pq_labels_sorted + classical_labels_sorted
        all_positions = list(range(len(all_values)))
        
        # Sistema de colores por algoritmo con tonalidades
        color_map = get_algorithm_colors()
        
        # Crear barras individuales con colores por algoritmo
        bars = []
        for i, (pos, val, label) in enumerate(zip(all_positions, all_values, all_labels)):
            color = color_map.get(label, '#888888')
            bar = ax.bar(pos, val, color=color, alpha=0.8, edgecolor='black', linewidth=0.5)
            bars.append(bar)
        
        # Configurar ejes
        ax.set_xlabel('Algorithms', fontsize=12, fontweight='bold')
        ax.set_ylabel('Average time in logarithmic scale', fontsize=12, fontweight='bold')
        ax.set_title('A Performance Comparison of Key Generation Algorithms: Post-Quantum vs Classical', fontsize=14, fontweight='bold')
        
        # Configurar etiquetas del eje X
        ax.set_xticks(all_positions)
        ax.set_xticklabels(all_labels, rotation=45, ha='right')
        
        # Aplicar escala logarítmica solo si hay datos válidos
        if pq_values or classical_values:
            ax.set_yscale('log')
            ax.set_ylabel('Average Time (ms) - Logarithmic Scale', fontsize=12, fontweight='bold')
        
        # Añadir líneas separadoras entre grupos
        if pq_values and classical_values:
            separator_x = len(pq_values) - 0.5
            ax.axvline(x=separator_x, color='red', linestyle='--', alpha=0.7, linewidth=2)
        
        # Crear leyenda personalizada por algoritmo
        legend_elements = []
        for label in all_labels:
            color = color_map.get(label, '#888888')
            # Añadir nivel de seguridad solo en la leyenda según NIST
            if 'ML-KEM-512' in label or 'ML-DSA-44' in label or 'ECDH-prime256v1' in label or 'ECDSA-prime256v1' in label:
                security_level = " (NIST Level 1)"
            elif 'ML-KEM-768' in label or 'ML-DSA-65' in label or 'ECDH-secp384r1' in label or 'ECDSA-secp384r1' in label:
                security_level = " (NIST Level 3)"
            elif 'ML-KEM-1024' in label or 'ML-DSA-87' in label or 'ECDH-secp521r1' in label or 'ECDSA-secp521r1' in label:
                security_level = " (NIST Level 5)"
            elif 'RSA-2048' in label:
                security_level = " (~NIST Level 1)"
            elif 'RSA-3072' in label:
                security_level = " (~NIST Level 2)"
            elif 'RSA-4096' in label:
                security_level = " (~NIST Level 3)"
            else:
                security_level = ""
            
            legend_elements.append(plt.Rectangle((0,0),1,1, facecolor=color, label=f"{label}{security_level}"))
        
        ax.legend(handles=legend_elements, title='Algorithm', title_fontsize=10, fontsize=9, 
                 frameon=True, fancybox=True, shadow=True, loc='upper right')
        
        # Añadir valores en las barras
        for i, (pos, val) in enumerate(zip(all_positions, all_values)):
            # Formatear números sin .0 innecesarios y separar μs
            if val == int(val):
                formatted_val = f'{int(val)} μs'
            else:
                formatted_val = f'{val:.1f} μs'
            ax.text(pos, val, formatted_val, ha='center', va='bottom', fontsize=9)
        
        # Ajustar layout para que quepa todo
        plt.subplots_adjust(right=0.85, bottom=0.15)
        plt.savefig('results/benchmark_keygen.png', dpi=300, bbox_inches='tight')
        print("✅ Gráfica de KeyGen guardada: benchmark_keygen.png")
    
    def create_signing_chart(self):
        """Digital Signing: Solo algoritmos de firma"""
        fig, ax = plt.subplots(figsize=(16, 10))
        
        pq_values = []
        pq_labels = []
        classical_values = []
        classical_labels = []
        
        # ML-DSA Signing (Post-Quantum)
        if 'postQuantum' in self.data and 'mlDsa' in self.data['postQuantum']:
            ml_dsa = self.data['postQuantum']['mlDsa']
            for variant in ['ML-DSA-44', 'ML-DSA-65', 'ML-DSA-87']:
                if variant in ml_dsa and 'signing' in ml_dsa[variant]:
                    time_us = ml_dsa[variant]['signing']['avgTime'] * 1000  # Convertir a microsegundos
                    pq_values.append(time_us)
                    pq_labels.append(variant)
        
        
        # RSA Signing (Classical)
        if 'classical' in self.data and 'rsa' in self.data['classical']:
            rsa = self.data['classical']['rsa']
            for variant in ['RSA-2048', 'RSA-3072', 'RSA-4096']:
                if variant in rsa and 'signing' in rsa[variant]:
                    time_ms = rsa[variant]['signing']['avgTime'] * 1000
                    classical_values.append(time_ms)
                    classical_labels.append(variant)
        
        # ECDSA Signing (Classical)
        if 'classical' in self.data and 'ecdsa' in self.data['classical']:
            ecdsa = self.data['classical']['ecdsa']
            for variant in ['prime256v1', 'secp384r1', 'secp521r1']:
                if variant in ecdsa and 'signing' in ecdsa[variant]:
                    time_us = ecdsa[variant]['signing']['avgTime'] * 1000  # Convertir a microsegundos
                    classical_values.append(time_us)
                    classical_labels.append(f'ECDSA-{variant}')
        
        # Ordenar elementos para leyenda consistente
        pq_values_sorted, pq_labels_sorted, classical_values_sorted, classical_labels_sorted = get_ordered_legend_items(
            pq_values, pq_labels, classical_values, classical_labels
        )
        
        # Crear lista ordenada globalmente
        all_values = pq_values_sorted + classical_values_sorted
        all_labels = pq_labels_sorted + classical_labels_sorted
        all_positions = list(range(len(all_values)))
        
        # Sistema de colores por algoritmo con tonalidades
        color_map = get_algorithm_colors()
        
        # Crear barras individuales con colores por algoritmo
        bars = []
        for i, (pos, val, label) in enumerate(zip(all_positions, all_values, all_labels)):
            color = color_map.get(label, '#888888')
            bar = ax.bar(pos, val, color=color, alpha=0.8, edgecolor='black', linewidth=0.5)
            bars.append(bar)
        
        # Configurar ejes
        ax.set_xlabel('Algorithms', fontsize=12, fontweight='bold')
        ax.set_ylabel('Average Time (ms)', fontsize=12, fontweight='bold')
        ax.set_title('A Performance Comparison of Digital Signature Algorithms: Post-Quantum vs Classical', fontsize=14, fontweight='bold')
        
        # Configurar etiquetas del eje X
        ax.set_xticks(all_positions)
        ax.set_xticklabels(all_labels, rotation=45, ha='right')
        
        # Aplicar escala logarítmica solo si hay datos válidos
        if pq_values or classical_values:
            ax.set_yscale('log')
            ax.set_ylabel('Average Time (ms) - Logarithmic Scale', fontsize=12, fontweight='bold')
        
        # Añadir líneas separadoras entre grupos
        if pq_values and classical_values:
            separator_x = len(pq_values) - 0.5
            ax.axvline(x=separator_x, color='red', linestyle='--', alpha=0.7, linewidth=2)
        
        # Crear leyenda personalizada por algoritmo
        legend_elements = []
        for label in all_labels:
            color = color_map.get(label, '#888888')
            # Añadir nivel de seguridad solo en la leyenda según NIST
            if 'ML-KEM-512' in label or 'ML-DSA-44' in label or 'ECDH-prime256v1' in label or 'ECDSA-prime256v1' in label:
                security_level = " (NIST Level 1)"
            elif 'ML-KEM-768' in label or 'ML-DSA-65' in label or 'ECDH-secp384r1' in label or 'ECDSA-secp384r1' in label:
                security_level = " (NIST Level 3)"
            elif 'ML-KEM-1024' in label or 'ML-DSA-87' in label or 'ECDH-secp521r1' in label or 'ECDSA-secp521r1' in label:
                security_level = " (NIST Level 5)"
            elif 'RSA-2048' in label:
                security_level = " (~NIST Level 1)"
            elif 'RSA-3072' in label:
                security_level = " (~NIST Level 2)"
            elif 'RSA-4096' in label:
                security_level = " (~NIST Level 3)"
            else:
                security_level = ""
            
            legend_elements.append(plt.Rectangle((0,0),1,1, facecolor=color, label=f"{label}{security_level}"))
        
        ax.legend(handles=legend_elements, title='Algorithm', title_fontsize=10, fontsize=9, 
                 frameon=True, fancybox=True, shadow=True, loc='upper right')
        
        # Añadir valores en las barras
        for i, (pos, val) in enumerate(zip(all_positions, all_values)):
            # Formatear números sin .0 innecesarios y separar μs
            if val == int(val):
                formatted_val = f'{int(val)} μs'
            else:
                formatted_val = f'{val:.1f} μs'
            ax.text(pos, val, formatted_val, ha='center', va='bottom', fontsize=9)
        
        # Ajustar layout para que quepa todo
        plt.subplots_adjust(right=0.85, bottom=0.15)
        plt.savefig('results/benchmark_signing.png', dpi=300, bbox_inches='tight')
        print("✅ Gráfica de Signing guardada: benchmark_signing.png")
    
    def create_verification_chart(self):
        """Signature Verification: Solo algoritmos de firma"""
        fig, ax = plt.subplots(figsize=(16, 10))
        
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
            for variant in ['RSA-2048', 'RSA-3072', 'RSA-4096']:
                if variant in rsa and 'verification' in rsa[variant]:
                    time_ms = rsa[variant]['verification']['avgTime'] * 1000
                    classical_values.append(time_ms)
                    classical_labels.append(variant)
        
        # ECDSA Verification (Classical)
        if 'classical' in self.data and 'ecdsa' in self.data['classical']:
            ecdsa = self.data['classical']['ecdsa']
            for variant in ['prime256v1', 'secp384r1', 'secp521r1']:
                if variant in ecdsa and 'verification' in ecdsa[variant]:
                    time_ms = ecdsa[variant]['verification']['avgTime'] * 1000
                    classical_values.append(time_ms)
                    classical_labels.append(f'ECDSA-{variant}')
        
        # Ordenar elementos para leyenda consistente
        pq_values_sorted, pq_labels_sorted, classical_values_sorted, classical_labels_sorted = get_ordered_legend_items(
            pq_values, pq_labels, classical_values, classical_labels
        )
        
        # Crear lista ordenada globalmente
        all_values = pq_values_sorted + classical_values_sorted
        all_labels = pq_labels_sorted + classical_labels_sorted
        all_positions = list(range(len(all_values)))
        
        # Sistema de colores por algoritmo con tonalidades
        color_map = get_algorithm_colors()
        
        # Crear barras individuales con colores por algoritmo
        bars = []
        for i, (pos, val, label) in enumerate(zip(all_positions, all_values, all_labels)):
            color = color_map.get(label, '#888888')
            bar = ax.bar(pos, val, color=color, alpha=0.8, edgecolor='black', linewidth=0.5)
            bars.append(bar)
        
        # Configurar ejes
        ax.set_xlabel('Algorithms', fontsize=12, fontweight='bold')
        ax.set_ylabel('Average Time (ms)', fontsize=12, fontweight='bold')
        ax.set_title('A Performance Comparison of Signature Verification Algorithms: Post-Quantum vs Classical', fontsize=14, fontweight='bold')
        
        # Configurar etiquetas del eje X
        ax.set_xticks(all_positions)
        ax.set_xticklabels(all_labels, rotation=45, ha='right')
        
        # Aplicar escala logarítmica solo si hay datos válidos
        if pq_values or classical_values:
            ax.set_yscale('log')
            ax.set_ylabel('Average Time (ms) - Logarithmic Scale', fontsize=12, fontweight='bold')
        
        # Añadir líneas separadoras entre grupos
        if pq_values and classical_values:
            separator_x = len(pq_values) - 0.5
            ax.axvline(x=separator_x, color='red', linestyle='--', alpha=0.7, linewidth=2)
        
        # Crear leyenda personalizada por algoritmo
        legend_elements = []
        for label in all_labels:
            color = color_map.get(label, '#888888')
            # Añadir nivel de seguridad solo en la leyenda según NIST
            if 'ML-KEM-512' in label or 'ML-DSA-44' in label or 'ECDH-prime256v1' in label or 'ECDSA-prime256v1' in label:
                security_level = " (NIST Level 1)"
            elif 'ML-KEM-768' in label or 'ML-DSA-65' in label or 'ECDH-secp384r1' in label or 'ECDSA-secp384r1' in label:
                security_level = " (NIST Level 3)"
            elif 'ML-KEM-1024' in label or 'ML-DSA-87' in label or 'ECDH-secp521r1' in label or 'ECDSA-secp521r1' in label:
                security_level = " (NIST Level 5)"
            elif 'RSA-2048' in label:
                security_level = " (~NIST Level 1)"
            elif 'RSA-3072' in label:
                security_level = " (~NIST Level 2)"
            elif 'RSA-4096' in label:
                security_level = " (~NIST Level 3)"
            else:
                security_level = ""
            
            legend_elements.append(plt.Rectangle((0,0),1,1, facecolor=color, label=f"{label}{security_level}"))
        
        ax.legend(handles=legend_elements, title='Algorithm', title_fontsize=10, fontsize=9, 
                 frameon=True, fancybox=True, shadow=True, loc='upper right')
        
        # Añadir valores en las barras
        for i, (pos, val) in enumerate(zip(all_positions, all_values)):
            # Formatear números sin .0 innecesarios y separar μs
            if val == int(val):
                formatted_val = f'{int(val)} μs'
            else:
                formatted_val = f'{val:.1f} μs'
            ax.text(pos, val, formatted_val, ha='center', va='bottom', fontsize=9)
        
        # Ajustar layout para que quepa todo
        plt.subplots_adjust(right=0.85, bottom=0.15)
        plt.savefig('results/benchmark_verification.png', dpi=300, bbox_inches='tight')
        print("✅ Gráfica de Verification guardada: benchmark_verification.png")

def main():
    generator = SimplifiedChartGenerator()
    if generator.data:
        generator.create_all_charts()
    else:
        print("❌ No se pudieron cargar los datos del benchmark")

if __name__ == "__main__":
    main()
