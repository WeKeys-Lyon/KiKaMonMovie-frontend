import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Header from '../components/header';
import { Buttons } from '../components/buttons';
import { logout, removeCollection } from '../reducers/user';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';


type MyAccountProps = {
  navigation: NavigationProp<ParamListBase>;
};

const BACKEND_URL = process.env.BACKEND_URL;

export default function MyAccount({ navigation }: MyAccountProps) {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user.value);

  // Les variables d'état pour le formulaire
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const isLengthValid = newPassword.length >= 8;
  const isUpperValid = /[A-Z]/.test(newPassword);
  const isLowerValid = /[a-z]/.test(newPassword);
  const isNumberValid = /\d/.test(newPassword);
  const isSpecialValid = /[^\da-zA-Z]/.test(newPassword) && newPassword.length > 0;

  const isValidPassword = (pwd: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
    return passwordRegex.test(pwd);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 1. Fonction pour sauvegarder les modifications
  const handleSaveChanges = async () => {
    if (!newUsername && !newEmail && !newPassword) {
      Alert.alert('Info', 'Veuillez remplir au moins un champ pour le modifier.');
      return;
    }

    // 🛡️ VÉRIFICATIONS DE SÉCURITÉ AVANT L'ENVOI
    if (newEmail && !isValidEmail(newEmail)) {
      Alert.alert('Erreur', 'Le format de la nouvelle adresse email est invalide.');
      return;
    }

    if (newPassword && !isValidPassword(newPassword)) {
      Alert.alert('Erreur', 'Le nouveau mot de passe ne respecte pas les règles de sécurité.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/users/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: user.token,
          newUsername: newUsername,
          newEmail: newEmail,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (data.result) {
        Alert.alert('Succès', 'Votre profil a bien été mis à jour !');
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
      } else {
        Alert.alert('Erreur', data.error || data.answer);
      }
    } catch (error) {
      Alert.alert('Erreur réseau', 'Impossible de joindre le serveur.');
    }
  };

  // 2. Fonction pour supprimer le compte
  const handleDeleteAccount = () => {
    Alert.alert(
      'Zone de danger',
      'Êtes-vous sûr de vouloir supprimer définitivement votre compte ainsi que votre collection et vos amis ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui, supprimer mon compte',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${BACKEND_URL}/users/delete-account`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: user.token }),
              });
              
              const data = await response.json();
              
              if (data.result) {
                // Si supprimé du backend, on vide Redux et on renvoie à l'accueil
                dispatch(logout());
                navigation.navigate('Home');
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le compte pour le moment.');
            }
          }
        }
      ]
    );
  };
  // 3. Fonction pour supprimer sa collection
  const handleDeleteCollection = () => {
    Alert.alert(
      'Zone de danger',
      'Êtes-vous sûr de vouloir supprimer définitivement l\'intégralité de votre collection ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui, supprimer ma collection',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${BACKEND_URL}/users/user-collection`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: user.token }),
              });
              
              const data = await response.json();
              
              if (data.result) {
                // Si supprimé du backend, on vide Redux et on renvoie à l'accueil
                dispatch(removeCollection());
                navigation.navigate('Ma Collection');
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le compte pour le moment.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Mon Compte" 
        leftIcon={<FontAwesome name="home" size={28} color="#e8be4b" />}
        onPressLeft={() => navigation.goBack()}
      />

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>Modifier mes informations</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nouveau nom d'utilisateur</Text>
          <TextInput
            style={styles.input}
            placeholder={user.username ? `Actuel : ${user.username}` : "Ex: MovieLover99"}
            placeholderTextColor="#aaa"
            value={newUsername}
            onChangeText={setNewUsername}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nouvelle adresse email</Text>
          <TextInput
            style={styles.input}
            placeholder="nouvel@email.com"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={newEmail}
            onChangeText={setNewEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nouveau mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#aaa"
            secureTextEntry={true}
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>
        {newPassword.length > 0 && (
          <View style={styles.rulesContainer}>
            <Text style={[styles.ruleText, isLengthValid ? styles.ruleValid : styles.ruleInvalid]}>{isLengthValid ? '✅' : '❌'} 8 caractères</Text>
            <Text style={[styles.ruleText, isUpperValid ? styles.ruleValid : styles.ruleInvalid]}>{isUpperValid ? '✅' : '❌'} 1 Majuscule</Text>
            <Text style={[styles.ruleText, isLowerValid ? styles.ruleValid : styles.ruleInvalid]}>{isLowerValid ? '✅' : '❌'} 1 Minuscule</Text>
            <Text style={[styles.ruleText, isNumberValid ? styles.ruleValid : styles.ruleInvalid]}>{isNumberValid ? '✅' : '❌'} 1 Chiffre</Text>
            <Text style={[styles.ruleText, isSpecialValid ? styles.ruleValid : styles.ruleInvalid]}>{isSpecialValid ? '✅' : '❌'} 1 Spécial</Text>
          </View>
        )}

        <Buttons 
          title="Sauvegarder" 
          onPress={handleSaveChanges} 
          variant="secondary" 
          style={{ marginTop: 20, width: '100%' }}
        />
        <View style={styles.warningZone}>
          <Text style={styles.warningTitle}>Remise à zéro de ma collection</Text>
          <TouchableOpacity style={styles.deleteCollectionButton} onPress={handleDeleteCollection}>
            <Text style={styles.deleteCollectionButtonText}>Supprimer ma collection</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Supression du compte</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A3B5C', 
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e8be4b',
    marginBottom: 20,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: '#fff',
    marginBottom: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    color: '#fff',
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Styles pour la suppression
  dangerZone: {
    marginTop: 25,
    padding: 15,
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d9534f',
    alignItems: 'center',
  },
  dangerTitle: {
    color: '#d9534f',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
    // Styles pour la suppression
  warningZone: {
    marginTop: 50,
    padding: 15,
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'orange',
    alignItems: 'center',
  },
  warningTitle: {
    color: 'orange',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  deleteCollectionButton: {
    backgroundColor: 'orange',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteCollectionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rulesContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap',     
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: -5,
  },
  ruleText: {
    width: '48%',         
    fontSize: 11,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  ruleValid: {
    color: '#4caf50',     
  },
  ruleInvalid: {
    color: '#ff4d4d',    
  },
});

