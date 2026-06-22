import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ImageBackground, TouchableOpacity } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { login } from '../reducers/user';
import Header from '../components/header';
import { Buttons } from '../components/buttons';
import { FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// OBLIGATOIRE : Permet à Expo de fermer le navigateur web une fois l'authentification terminée
WebBrowser.maybeCompleteAuthSession();

type SignInScreenProps = { navigation: NavigationProp<ParamListBase>; };
const BACKEND_URL = process.env.BACKEND_URL;

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const [mylogin, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();

// --- 1. CONFIGURATION DE GOOGLE AUTH SESSION ---
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '187088415795-98fvq75vn2t5o4kck36oe8ubbbb894t3.apps.googleusercontent.com', 
    iosClientId: '187088415795-grjv3hb03do40t49l0pvgnqq2i4aqlmh.apps.googleusercontent.com', 
    redirectUri: 'https://auth.expo.io/@torad/KiKaMonMovie', // 👈 AJOUTE CETTE LIGNE EXPLICITE
  });

  // --- 2. ECOUTE DE LA REPONSE DE GOOGLE ---
  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      const idToken = response.authentication.idToken; 
      if (idToken) {
        handleBackendGoogleLogin(idToken);
      }
    } else if (response?.type === 'error' || response?.type === 'dismiss') {
      console.log("Connexion annulée ou erreur :", response);
    }
  }, [response]);

  // --- 3. ENVOI DU TOKEN AU BACKEND ---
  const handleBackendGoogleLogin = async (idToken: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/users/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await res.json();

      if (data.result) {
        dispatch(login({
          _id: data.answer._id,
          email: data.answer.email,
          username: data.answer.username,
          token: data.answer.token,
          movies: data.answer.movies || [],
          friends: data.answer.friends || [],
          friendCode: data.answer.friendCode,
          notifications: data.answer.notifications || []
        }));

        if (!data.answer.movies || data.answer.movies.length === 0) {
          navigation.navigate('OnboardingAddAMovie');
        } else {
          navigation.navigate('TabNavigator', { screen: 'Ma Collection' });
        }
      } else {
        setError(data.error || "Erreur de connexion Backend.");
      }
    } catch (error) {
      setError("Échec de la communication avec le serveur.");
      console.error(error);
    }
  };

  // --- 4. CONNEXION CLASSIQUE ---
  const handleSubmit = async () => {
    setError('');
    if (!mylogin || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      const myURL = `${BACKEND_URL}/users/signin`;
      const res = await fetch(encodeURI(myURL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mylogin,
          password,
        }),
      });
      const data = await res.json();

      if (data.result) {
        dispatch(login({
          _id: data.answer._id,
          email: data.answer.email,
          username: data.answer.username,
          token: data.answer.token,
          movies: data.answer.movies,
          friends: data.answer.friends,
          friendCode: data.answer.friendCode,
          notifications: data.answer.notifications
        }));
        navigation.navigate('TabNavigator', { screen: 'Ma Collection' });
      } else {
        setError(data.answer);
      }
    } catch (error) {
      console.error(error);
      setError('Une erreur est survenue lors de la connexion');
    }
  };

  const handleReturn = () => {
    navigation.navigate('Home'); 
  };

  return (
    <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
      <Header title="Connexion" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.formContainer}>

          <Text style={styles.title}>Bon retour !</Text>
          <Text style={styles.subtitle}>Connectez-vous pour retrouver votre collection et vos amis</Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Votre nom d'utilisateur"
              placeholderTextColor="#ccc"
              autoCapitalize="none"
              autoComplete="username"
              onChangeText={setLogin}
              value={mylogin}
              style={styles.input}
            />
            <TextInput
              placeholder="Votre mot de passe"
              placeholderTextColor="#ccc"
              autoCapitalize="none"
              textContentType="password"
              autoComplete="password"
              secureTextEntry={true}
              onChangeText={setPassword}
              value={password}
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttonContainer}>
              <Buttons title="Retour" onPress={handleReturn} variant="actionButton" />
              <Buttons title="Valider" onPress={handleSubmit} variant="actionButton" />
          </View>

          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* LE BOUTON GOOGLE EXPO */}
          <View style={styles.googleButtonWrapper}>
            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={() => promptAsync()} 
              disabled={!request}
            >
              <FontAwesome name="google" size={20} color="#EA4335" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Se connecter avec Google</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  formContainer: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 15,
    alignItems: 'center',
    width: '90%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    color: '#fff',
    marginBottom: 15,
  },
  error: {
    color: '#ff4d4d',
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    marginTop: 20,
    gap: 10,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
    width: '100%',
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  separatorText: {
    color: '#ccc',
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  googleButtonWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, 
  },
  googleIcon: {
    marginRight: 15,
  },
  googleButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
});