import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { CameraView } from 'expo-camera';
import { Buttons } from './buttons'; 
import { useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';


type BarcodeScannerProps = {
  isScanning: boolean;
  scannedTitle: string | null;
  onBarcodeScanned: (result: { type: string; data: string }) => void;
  onRescan: () => void;
  onConfirm: (title: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({
  onBarcodeScanned,
  onRescan,
  onConfirm,
  onClose,
}: BarcodeScannerProps) {

  const [isScanning, setIsScanning] = useState(true);
  const [scannedTitle, setScannedTitle] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState("");

  useEffect(() => {
    if (scannedTitle) {
      setEditableTitle(scannedTitle);
      setIsEditing(false); // On repasse en mode texte normal par défaut
    }
  }, [scannedTitle]);
    //Gestion de la camera: 
    
    const BACKEND_URL = process.env.BACKEND_URL;


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
        
        if (cleanTitle.includes('-')) {
          cleanTitle = cleanTitle.split('-')[0]; 
        }
        cleanTitle = cleanTitle.replace(/dvd|blu-ray|bleu-ray|bluray|achat|pas cher|ean|cd|édition|edition|collector|neuf|occasion|dvdfr/gi, '');
        cleanTitle = cleanTitle.replace(/[\[\]\(\)]/g, '');
        cleanTitle = cleanTitle.trim();
        
        console.log("Titre nettoyé prêt pour l'affichage :", cleanTitle);

        
        setScannedTitle(cleanTitle);

      } else {
        Alert.alert("Mince !", json.error || "Aucun film trouvé pour ce code-barres.");
        
        setIsScanning(true); 
      }
    } catch (error) {
      console.error("Erreur de scan :", error);
      // On relance la caméra en cas d'erreur serveur
      setIsScanning(true); 
    }
  };
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={styles.camera}
        facing="back"
        autofocus="on"
        zoom={0.15}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13"], // Codes barres DVD standards
        }}
        onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
      />
        {/* L'OVERLAY QUI APPARAIT QUAND LE FILM EST TROUVÉ */}
        {scannedTitle && (
          <View style={styles.scanOverlay}>
            <Text style={styles.overlayText}>
              J'ai trouvé :{"\n"}
              <Text style={{ fontWeight: 'bold', color: '#e8be4b' }}>{scannedTitle}</Text>
            </Text>
             <View>
                <Text style={styles.overlayText}>Modifier le titre ?</Text>
              </View>

            {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={editableTitle}
              onChangeText={setEditableTitle}
              autoFocus={true} // Ouvre le clavier direct
              onSubmitEditing={() => setIsEditing(false)} // Ferme quand on fait "Entrée"
              onBlur={() => setIsEditing(false)} // Ferme si on clique à côté
            />
          ) : (
            <View style={styles.titleRow}>
              <Text style={styles.movieTitleText}>{editableTitle}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.pencilIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}
            
            <View style={styles.overlayButtons}>
              <Buttons title="🔄 Relancer" onPress={onRescan} variant="secondary" />
              <Buttons title="✅ Ajouter" onPress={() => onConfirm((editableTitle) ? editableTitle as string : scannedTitle as string)} variant="primary" />
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