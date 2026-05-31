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
import { useDispatch } from 'react-redux';
import {login} from '../reducers/user';

type SignInScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function SignInScreen({ navigation }: SignInScreenProps) {

  const [mylogin, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState('');
  const BACKEND_URL = process.env.BACKEND_URL;
  const dispatch = useDispatch();

  const handleSubmit =  async () => {
        
        setError('');
        if (!mylogin || !password ) {
          setError('Veuillez remplir tous les champs');
          return;
        }
        try {
    
          const myURL = `${BACKEND_URL}/users/signin`
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
           navigation.navigate('TabNavigator', { screen: 'MyCollection' });
          } else {
            setError(data.answer);
          }
        } catch (error) {
          console.error(error);
          setError('Une erreur est survenue lors de la création du compte');
        }
      };
    /* navigation.navigate('TabNavigator', { screen: 'MyCollection' }); */
  return (
        <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          ><SafeAreaView style={styles.container}>
      <Text>Se connecter</Text>
      <View style={styles.bigctn}>
      <View style={styles.loginctn}>
        <Text>Nom d'utilisateur :</Text>
        <TextInput
            placeholder="FandeMoviez17"
            autoCapitalize="none" // https://reactnative.dev/docs/textinput#autocapitalize
            keyboardType="email-address" // https://reactnative.dev/docs/textinput#keyboardtype
            textContentType="none" // https://reactnative.dev/docs/textinput#textcontenttype-ios
            autoComplete="username" // https://reactnative.dev/docs/textinput#autocomplete-android
            onChangeText={(value) => setLogin(value)}
            value={mylogin}
            style={styles.loginInput}
          />
      </View>
      <View style={styles.passwordctn}>
        <Text>Mot de Passe :</Text>
          <TextInput
              placeholder="MonMotDePasseSecret123"
              autoCapitalize="none" // https://reactnative.dev/docs/textinput#autocapitalize
              keyboardType="email-address" // https://reactnative.dev/docs/textinput#keyboardtype
              textContentType="password" // https://reactnative.dev/docs/textinput#textcontenttype-ios
              autoComplete="password" // https://reactnative.dev/docs/textinput#autocomplete-android
              secureTextEntry={true}
              onChangeText={(value) => setPassword(value)}
              value={password}
              style={styles.loginInput}
            />
      </View>
      </View>
      <Buttons title='Se Connecter' onPress={handleSubmit}/>
    </SafeAreaView></KeyboardAvoidingView>
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
  bigctn: {
    flex: 1,
    justifyContent: 'space-between',
    
  },
  loginctn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  loginInput: {
    fontSize: 15,
    backgroundColor: '#fff',
    padding: 5
  },
  passwordctn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  }
});
