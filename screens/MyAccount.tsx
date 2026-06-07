import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Header from '../components/header';
import { Buttons } from '../components/buttons';
import { logout } from '../reducers/user';
import { FontAwesome } from '@expo/vector-icons';

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

  // 1. Fonction pour sauvegarder les modifications
  const handleSaveChanges = async () => {
    // S'il n'a rien rempli, on ne fait pas de requête
    if (!newUsername && !newEmail && !newPassword) {
      Alert.alert('Info', 'Veuillez remplir au moins un champ pour le modifier.');
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
        // On vide les champs
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        // Optionnel : Tu pourrais aussi mettre à jour Redux ici si tu affiches le pseudo ailleurs
      } else {
        Alert.alert('Erreur', data.error);
      }
    } catch (error) {
      Alert.alert('Erreur réseau', 'Impossible de joindre le serveur.');
    }
  };

  // 2. Fonction pour supprimer le compte
  const handleDeleteAccount = () => {
    Alert.alert(
      'Zone de danger',
      'Êtes-vous sûr de vouloir supprimer définitivement votre compte ainsique votre collection ? Cette action est irréversible.',
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
            placeholder="Ex: MovieLover99"
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

        <Buttons 
          title="Sauvegarder" 
          onPress={handleSaveChanges} 
          variant="secondary" 
          style={{ marginTop: 20, width: '100%' }}
        />

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
    backgroundColor: '#1C2942', 
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
    marginTop: 50,
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
});