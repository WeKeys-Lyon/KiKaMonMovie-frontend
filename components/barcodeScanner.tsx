import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { Buttons } from './buttons'; 

type BarcodeScannerProps = {
  isScanning: boolean;
  scannedTitle: string | null;
  onBarcodeScanned: (result: { type: string; data: string }) => void;
  onRescan: () => void;
  onConfirm: () => void;
  onClose: () => void;
};

export default function BarcodeScanner({
  isScanning,
  scannedTitle,
  onBarcodeScanned,
  onRescan,
  onConfirm,
  onClose,
}: BarcodeScannerProps) {
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"], // Codes barres DVD standards
        }}
        onBarcodeScanned={isScanning ? onBarcodeScanned : undefined}
      >
        {/* L'OVERLAY QUI APPARAIT QUAND LE FILM EST TROUVÉ */}
        {scannedTitle && (
          <View style={styles.scanOverlay}>
            <Text style={styles.overlayText}>
              J'ai trouvé :{"\n"}
              <Text style={{ fontWeight: 'bold', color: '#e8be4b' }}>{scannedTitle}</Text>
            </Text>
            
            <View style={styles.overlayButtons}>
              <Buttons title="🔄 Relancer" onPress={onRescan} variant="secondary" />
              <Buttons title="✅ Ajouter" onPress={onConfirm} variant="primary" />
            </View>
          </View>
        )}
        
        {/* BOUTON CROIX POUR FERMER LA CAMERA */}
        <TouchableOpacity 
          style={styles.closeCameraButton} 
          onPress={onClose}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>X</Text>
        </TouchableOpacity>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    width: '90%',
    height: '60%', 
    borderRadius: 20,
    overflow: 'hidden', 
    borderWidth: 2,
    borderColor: '#e8be4b',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end', 
  },
  closeCameraButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  scanOverlay: {
    width: '100%',
    backgroundColor: 'rgba(28, 41, 66, 0.95)', 
    padding: 20,
    borderTopWidth: 2,
    borderColor: '#e8be4b',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  overlayButtons: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
    width: '100%',
  },
});