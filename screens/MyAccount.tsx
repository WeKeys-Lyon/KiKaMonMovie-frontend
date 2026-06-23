import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Header from '../components/header';
import { Buttons } from '../components/buttons';
import { logout, removeCollection } from '../reducers/user';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { User } from '../components/types';
import { avatars } from '../components/avatarMap';

type MyAccountProps = {
  navigation: NavigationProp<ParamListBase>;
};

const BACKEND_URL = process.env.BACKEND_URL;

export default function MyAccount({ navigation }: MyAccountProps) {
  const dispatch = useDispatch();
  // On s'assure que user.email est bien disponible ici
  const user = useSelector((state: { _persist: any, user: { value: User } }) => state.user.value);

  // Les variables d'état pour le formulaire
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isLengthValid = newPassword.length >= 8;
  const isUpperValid = /[A-Z]/.test(newPassword);
  const isLowerValid = /[a-z]/.test(newPassword);
  const isNumberValid = /\d/.test(newPassword);
  const isSpecialValid = /[^\da-zA-Z]/.test(newPassword) && newPassword.length > 0;
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || 'default');

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

    // 🚀 Vérification de la concordance des mots de passe
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
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
          newAvatar: selectedAvatar,
        }),
      });

      const data = await response.json();

      if (data.result) {
        Alert.alert('Succès', 'Votre profil a bien été mis à jour !');
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setConfirmPassword(''); // On n'oublie pas de vider aussi ce champ
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
        style={styles.keyboardView} // Changement du style ici
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 🚀 Mise en place de la ScrollView */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Modifier mes informations</Text>
          <Text style={styles.label}>Choisir un Avatar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarContainer}>
            {Object.keys(avatars).map((key) => {
              // On ignore l'avatar par défaut dans la liste de sélection
              if (key === 'default') return null;

              return (
                <TouchableOpacity key={key} onPress={() => setSelectedAvatar(key)}>
                  <Image
                    source={avatars[key as keyof typeof avatars]}
                    style={[
                      styles.avatarImage,
                      selectedAvatar === key && styles.avatarSelected // Met en surbrillance si sélectionné
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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
              // 🚀 Ajout de l'affichage de l'email actuel (si présent dans le user)
              placeholder={user.email ? `Actuel : ${user.email}` : "nouvel@email.com"}
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

          {/* 🚀 Affichage conditionnel de la confirmation et des règles */}
          {newPassword.length > 0 && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmer le mot de passe</Text>
                <TextInput
                  style={[
                    styles.input,
                    // Petit effet visuel si les mots de passe ne correspondent pas
                    confirmPassword.length > 0 && newPassword !== confirmPassword ? styles.inputError : null
                  ]}
                  placeholder="********"
                  placeholderTextColor="#aaa"
                  secureTextEntry={true}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <Text style={{ color: '#fff', fontSize: 16, marginBottom: 15, marginTop: -10 }}>Au moins : </Text>
              <View style={styles.rulesContainer}>
                <Text style={[styles.ruleText, isLengthValid ? styles.ruleValid : styles.ruleInvalid]}>{isLengthValid ? '✅' : '❌'} 8 caractères</Text>
                <Text style={[styles.ruleText, isUpperValid ? styles.ruleValid : styles.ruleInvalid]}>{isUpperValid ? '✅' : '❌'} 1 Majuscule</Text>
                <Text style={[styles.ruleText, isLowerValid ? styles.ruleValid : styles.ruleInvalid]}>{isLowerValid ? '✅' : '❌'} 1 Minuscule</Text>
                <Text style={[styles.ruleText, isNumberValid ? styles.ruleValid : styles.ruleInvalid]}>{isNumberValid ? '✅' : '❌'} 1 Chiffre</Text>
                <Text style={[styles.ruleText, isSpecialValid ? styles.ruleValid : styles.ruleInvalid]}>{isSpecialValid ? '✅' : '❌'} 1 Charactère Spécial</Text>
              </View>
            </>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A3B5C',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Donne un peu d'espace en bas de la zone de scroll
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
  inputError: {
    borderColor: '#ff4d4d',
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
    gap: 3
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
  avatarContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35, // Rend l'image parfaitement ronde !
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'transparent', // Bordure invisible par défaut
  },
  avatarSelected: {
    borderColor: '#e8be4b', // Bordure dorée pour celui qui est cliqué
    transform: [{ scale: 1.1 }], // Petit effet de zoom
  },
});