import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type ProfileMenuModalProps = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
};

export default function ProfileMenuModal({ visible, onClose, onNavigate, onLogout }: ProfileMenuModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      {/* TouchableWithoutFeedback permet de fermer le menu si on clique dans le vide */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          
          {/* On empêche le clic de fermer le menu si on clique sur la boîte elle-même */}
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { onClose(); onNavigate('MyAccount'); }}
              >
                <FontAwesome name="user" size={18} color="#e8be4b" style={styles.icon} />
                <Text style={styles.menuText}>Mon Compte</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { onClose(); onNavigate('MyFriends'); }}
              >
                <FontAwesome name="users" size={18} color="#e8be4b" style={styles.icon} />
                <Text style={styles.menuText}>Mes Amis</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { onClose(); onLogout(); }}
              >
                <FontAwesome name="sign-out" size={18} color="#d9534f" style={styles.icon} />
                <Text style={[styles.menuText, { color: '#d9534f' }]}>Me déconnecter</Text>
              </TouchableOpacity>

            </View>
          </TouchableWithoutFeedback>

        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Fond très légèrement grisé
  },
  menuContainer: {
    position: 'absolute',
    top: 90, 
    left: 20, 
    backgroundColor: '#2A3B5C',
    borderRadius: 12,
    width: 200,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e8be4b',
    
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  icon: {
    width: 25,
    textAlign: 'center',
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 15,
  },
});