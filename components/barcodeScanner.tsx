import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { CameraView } from 'expo-camera';
import { Buttons } from './buttons'; 


type BarcodeScannerProps = {
  onRescan: () => void;
  onConfirm: (title: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({
  onRescan,
  onConfirm,
  onClose,
}: BarcodeScannerProps) {

  const [isScanning, setIsScanning] = useState(true);
  const [scannedTitle, setScannedTitle] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState("");

  const BACKEND_URL = process.env.BACKEND_URL;

  useEffect(() => {
    if (scannedTitle) {
      setEditableTitle(scannedTitle);
      setIsEditing(false); 
    }
  }, [scannedTitle]);

  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
    console.log("Code-barres détecté :", data, "de type", type);
    
    if (!isScanning) return;
    setIsScanning(false); 

    try {
      const response = await fetch(`${BACKEND_URL}/movies/searchean/${data}`);
      const json = await response.json();

      if (json.result && json.answer) {
        let rawTitle = json.answer; 
        let cleanTitle = rawTitle;
        
        cleanTitle = cleanTitle.replace(/dvd|blu-ray|bleu-ray|bluray|achat|pas cher|ean|cd|édition|edition|collector|neuf|occasion|dvdfr|vhs/gi, '');
        cleanTitle = cleanTitle.replace(/[\[\]\(\)]/g, '');
        cleanTitle = cleanTitle.replace(/\s*-\s*$/g, '');
        cleanTitle = cleanTitle.replace(/-/g, ' ');
        cleanTitle = cleanTitle.replace(/\s{2,}/g, ' ');
        cleanTitle = cleanTitle.trim();
        
        console.log("Titre nettoyé prêt pour l'affichage :", cleanTitle);
        setScannedTitle(cleanTitle); 

      } else {
        Alert.alert("Mince !", json.error || "Aucun film trouvé pour ce code-barres.");
        setIsScanning(true); 
      }
    } catch (error) {
      console.error("Erreur de scan :", error);
      setIsScanning(true); 
    }
  };

  const handleLocalRescan = () => {
    setScannedTitle(null);
    setIsScanning(true);
    onRescan(); 
  };

  return (
    <View style={styles.cameraContainer}>

      {/* --- AFFICHAGE CONDITIONNEL EN 3 ÉTAPES --- */}
      {isScanning ? (
        // ÉTAPE 1 : LA CAMÉRA
        <CameraView
          style={styles.camera}
          facing="back"
          autofocus="on"
          zoom={0.15}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"], 
          }}
          onBarcodeScanned={handleBarCodeScanned}
        />
      ) : !scannedTitle ? (
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingLogo}>🎞️</Text>
          <ActivityIndicator size="large" color="#e8be4b" style={{ marginVertical: 15 }} />
          <Text style={styles.loadingText}>Recherche du film en cours...</Text>
        </View>
      ) : (
        
        <View style={styles.resultBackground} />
      )}


      
      {scannedTitle && (
        <View style={styles.scanOverlay}>
          <Text style={styles.overlayText}>
            J'ai trouvé :
          </Text>

          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={editableTitle}
              onChangeText={setEditableTitle}
              autoFocus={true} 
              onSubmitEditing={() => setIsEditing(false)} 
              onBlur={() => setIsEditing(false)} 
            />
          ) : (
            <View style={styles.titleRow}>
              <Text style={styles.movieTitleText}>{editableTitle}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.pencilIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
            
            
          )}
          <View style={styles.titleRow}>
              <Text style={styles.overlayText}>Cliquez sur le crayon pour affiner votre recherche</Text>
              </View>
          <View style={styles.overlayButtons}>
            <Buttons title="🔄 Relancer" onPress={handleLocalRescan} variant="secondary" />
            <Buttons title="✅ Ajouter" onPress={() => onConfirm(editableTitle || scannedTitle)} variant="primary" />
          </View>
        </View>
      )}
      
      
      <TouchableOpacity style={styles.closeCameraButton} onPress={onClose}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>X</Text>
      </TouchableOpacity>
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
    position: 'relative', 
  },
  camera: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#1C2942', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    fontSize: 50,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  resultBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
    zIndex: 10,
  },
  scanOverlay: {
    position: 'absolute', 
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(28, 41, 66, 0.95)', 
    padding: 20,
    borderTopWidth: 2,
    borderColor: '#e8be4b',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  overlayButtons: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  movieTitleText: {
    fontWeight: 'bold', 
    color: '#e8be4b',
    fontSize: 18,
    textAlign: 'center',
  },
  pencilIcon: {
    fontSize: 22,
    marginLeft: 10,
  },
  editInput: {
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    width: '90%',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e8be4b',
  },
});