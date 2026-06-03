import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Buttons } from './buttons'; 

type SelectionMenuProps = {
  onOpenScanner: () => void;
  onOpenSearch: () => void;
};

export default function SelectionMenu({ onOpenScanner, onOpenSearch }: SelectionMenuProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ajouter un film</Text>
      <Text style={styles.subtitle}>
        Comment souhaitez-vous trouver le film à ajouter à votre collection ?
      </Text>

      <View style={styles.buttonContainer}>
        <Buttons title="📷 Scanner un code-barre" onPress={onOpenScanner} variant="actionButton" />
        <View style={styles.spacer} />
        <Buttons title="🔍 Recherche manuelle" onPress={onOpenSearch} variant="actionButton" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    card: { marginHorizontal: 20, padding: 30, backgroundColor: 'rgba(0, 0, 0, 0.75)', borderRadius: 15, alignItems: 'center', width: '90%' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 15, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#ddd', textAlign: 'center', marginBottom: 35, lineHeight: 22 },
  buttonContainer: { width: '100%', alignItems: 'center' },
  actionButton: { width: '100%' },
  spacer: { height: 15 },
});