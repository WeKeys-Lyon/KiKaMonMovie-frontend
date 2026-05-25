import React, { useState } from 'react';
import {Buttons} from '../components/buttons';
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

type SignUpScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function SignUpScreen({ navigation }: SignUpScreenProps) {

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const BACKEND_URL = process.env.BACKEND_URL;



  const handleSubmit = () => {
    navigation.navigate('TabNavigator', { screen: 'MyCollection' });
  };

  return (
     <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <View style={styles.textContainer}>
              <Text style={styles.title}>Créer un compte</Text>
              <Text style={styles.subtitle}>Rentrez les informations ci-dessous pour créer votre collection et commencer à partager vos films</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder='Votre email'
                  value={email}
                  onChangeText={text => setEmail(text)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Votre nom d'utilisateur"
                  value={username}
                  onChangeText={text => setUsername(text)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Votre mot de passe"
                  value={password}
                  onChangeText={text => setPassword(text)}
                  style={styles.input}
                  secureTextEntry
                />
                <TextInput
                  placeholder="Confirmez votre mot de passe"
                  value={confirmPassword}
                  onChangeText={text => setConfirmPassword(text)}
                  style={styles.input}
                  secureTextEntry
                />

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


});
