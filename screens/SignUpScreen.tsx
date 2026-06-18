import React, { useState } from 'react';
import { Buttons } from '../components/buttons';
import {
  Image,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/header';


import { useDispatch } from 'react-redux';
import { login } from '../reducers/user';



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


    const isValidPassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
    return passwordRegex.test(password);
  };



  const handleSubmit = async () => {
    setError('');
    
    // 1. Vérification des champs vides
    if (!email || !username || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    // 🛡️ 2. Vérification de la complexité du mot de passe
    if (!isValidPassword(password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.');
      return;
    }

    // 3. Vérification de la correspondance
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      // (Petit rappel : encodeURI n'est pas nécessaire ici 😉)
      const myURL = `${BACKEND_URL}/users/signup`;
      const response = await fetch(myURL, {
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
      const data = await response.json();
      
      if (data.result) {
        const userMovies = (data.answer.movies) ? data.answer.movies : [];

        dispatch(login({
          email: email, 
          username: username, 
          token: data.answer.token,
          movies: userMovies,
          friendCode: data.answer.friendCode, // 🐛 CORRECTION DE LA FAUTE DE FRAPPE ICI
          friends: data.answer.friends,
          notifications: data.answer.notifications
        }));
        
        if (userMovies.length < 1) {
          navigation.navigate('OnboardingAddAMovie');
        } else {
          navigation.navigate('TabNavigator', { screen: 'Ma Collection' });
        } 
      } else {
        setError(data.answer); // Affiche l'erreur du backend (ex: "Email déjà utilisé")
      }
    } catch (error) {
      console.error(error);
      setError('Une erreur est survenue lors de la création du compte');
    }
  };

  const handleReturn = () => {
    navigation.navigate('Home');
  };

  const isLengthValid = password.length >= 8;
  const isUpperValid = /[A-Z]/.test(password);
  const isLowerValid = /[a-z]/.test(password);
  const isNumberValid = /\d/.test(password);
  const isSpecialValid = /[^\da-zA-Z]/.test(password) && password.length > 0;


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
                {isSpecialValid ? '✅' : '❌'} 1 Spécial
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
          {error ?
            <Text style={styles.error}>{error}</Text>
            : null}
          <View style={styles.buttonContainer}>
            <Buttons title="Retour" onPress={handleReturn} variant="actionButton"/>
            <Buttons title="Valider" onPress={() => handleSubmit()} variant="actionButton" />
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
    width: '80%',
    flexDirection: 'row', // Pour aligner en ligne
    flexWrap: 'wrap',     // Pour passer à la ligne automatiquement (2 colonnes)
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  ruleText: {
    width: '48%',         // Prend la moitié de la largeur
    fontSize: 11,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  ruleValid: {
    color: '#4caf50',     // Vert si la règle est respectée
  },
  ruleInvalid: {
    color: '#ff4d4d',     // Rouge/Grisé si elle manque
  },

});
