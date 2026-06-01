import React, { useState } from 'react';
import { Buttons } from '../components/buttons';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Header from '../components/header';
import { useDispatch } from 'react-redux';
import { login } from '../reducers/user';

type SignInScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const [mylogin, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState('');
  
  const BACKEND_URL = process.env.BACKEND_URL;
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    setError('');
    if (!mylogin || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    try {
      const myURL = `${BACKEND_URL}/users/signin`;
      const response = await fetch(encodeURI(myURL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mylogin,
          password,
        }),
      });
      const data = await response.json();

      if (data.result) {
        dispatch(login({
          email: data.answer.email,
          username: data.answer.username,
          token: data.answer.token,
          movies: data.answer.movies
        }));
        navigation.navigate('TabNavigator', { screen: 'MyCollection', loadmovies: true });
      } else {
        setError(data.answer);
      }
    } catch (error) {
      console.error(error);
      setError('Une erreur est survenue lors de la connexion');
    }
  };

  const handleReturn = () => {
    navigation.navigate('Home'); // Remplace 'Home' par le vrai nom de ton écran d'accueil si différent
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
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '85%',
    marginTop: 20,
    gap: 10,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  
  },

});