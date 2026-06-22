import React, { useState, useEffect } from 'react';
import { Buttons } from '../components/buttons';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Header from '../components/header';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { login } from '../reducers/user';

// --- IMPORTS POUR EXPO AUTH SESSION ---
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// OBLIGATOIRE : Permet à Expo de fermer le navigateur web
WebBrowser.maybeCompleteAuthSession();

type SignUpScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const BACKEND_URL = process.env.BACKEND_URL;

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
        handleBackendGoogleSignUp(idToken);
      }
    } else if (response?.type === 'error' || response?.type === 'dismiss') {
      console.log("Inscription annulée ou erreur :", response);
    }
  }, [response]);

  // --- 3. ENVOI DU TOKEN AU BACKEND ---
  const handleBackendGoogleSignUp = async (idToken: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/users/google-login`, { // Même route que le login en général
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

  // --- REGLES MOT DE PASSE ---
  const isValidPassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
    return passwordRegex.test(password);
  };

  const isLengthValid = password.length >= 8;
  const isUpperValid = /[A-Z]/.test(password);
  const isLowerValid = /[a-z]/.test(password);
  const isNumberValid = /\d/.test(password);
  const isSpecialValid = /[^\da-zA-Z]/.test(password) && password.length > 0;

  // --- 4. INSCRIPTION CLASSIQUE ---
  const handleSubmit = async () => {
    setError('');
    
    if (!email || !username || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const myURL = `${BACKEND_URL}/users/signup`;
      const res = await fetch(myURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });
      const data = await res.json();
      
      if (data.result) {
        const userMovies = (data.answer.movies) ? data.answer.movies : [];

        dispatch(login({
          _id: data.answer._id,
          email: email, 
          username: username, 
          token: data.answer.token,
          movies: userMovies,
          friendCode: data.answer.friendCode, 
          friends: data.answer.friends,
          notifications: data.answer.notifications
        }));
        
        if (userMovies.length < 1) {
          navigation.navigate('OnboardingAddAMovie');
        } else {
          navigation.navigate('TabNavigator', { screen: 'Ma Collection' });
        } 
      } else {
        setError(data.answer); 
      }
    } catch (error) {
      console.error(error);
      setError('Une erreur est survenue lors de la création du compte');
    }
  };

  const handleReturn = () => {
    navigation.navigate('Home');
  };

  return (
    <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
      <Header title="Inscription" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.formContainer}>

          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rentrez les informations ci-dessous pour créer votre collection et commencer à partager vos films</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              placeholder='Votre email'
              placeholderTextColor='#ccc'
              autoCapitalize='none'
              keyboardType='email-address'
              value={email}
              onChangeText={text => setEmail(text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Votre nom d'utilisateur"
              placeholderTextColor="#ccc"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
            <TextInput
              placeholder="Votre mot de passe"
              placeholderTextColor="#ccc"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />
            <Text style={{color: '#fff', fontSize: 16, marginBottom: 5}}>Au moins :</Text>
            <View style={styles.rulesContainer}>
              <Text style={[styles.ruleText, isLengthValid ? styles.ruleValid : styles.ruleInvalid]}>
                {isLengthValid ? '✅' : '❌'} 8 caractères
              </Text>
              <Text style={[styles.ruleText, isUpperValid ? styles.ruleValid : styles.ruleInvalid]}>
                {isUpperValid ? '✅' : '❌'} 1 Majuscule
              </Text>
              <Text style={[styles.ruleText, isLowerValid ? styles.ruleValid : styles.ruleInvalid]}>
                {isLowerValid ? '✅' : '❌'} 1 Minuscule
              </Text>
              <Text style={[styles.ruleText, isNumberValid ? styles.ruleValid : styles.ruleInvalid]}>
                {isNumberValid ? '✅' : '❌'} 1 Chiffre
              </Text>
              <Text style={[styles.ruleText, isSpecialValid ? styles.ruleValid : styles.ruleInvalid]}>
                {isSpecialValid ? '✅' : '❌'} 1 Charactère Spécial
              </Text>
            </View>
            <TextInput
              placeholder="Confirmez votre mot de passe"
              placeholderTextColor="#ccc"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttonContainer}>
            <Buttons title="Retour" onPress={handleReturn} variant="actionButton"/>
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
              <Text style={styles.googleButtonText}>S'inscrire avec Google</Text>
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
    justifyContent: 'center'
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
    minWidth: '80%',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '85%',
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  rulesContainer: {
    width: '90%',
    flexDirection: 'row', 
    flexWrap: 'wrap',    
    justifyContent: 'space-between',
    marginBottom: 15,
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