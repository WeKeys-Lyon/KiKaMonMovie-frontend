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

 
type SignInScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function SignInScreen({ navigation }: SignInScreenProps) {

  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  const handleSubmit = () => {
    
    const BACKEND_IP = process.env.BACKEND_IP
    console.log(BACKEND_IP);
    /* navigation.navigate('TabNavigator', { screen: 'MyCollection' }); */
  };
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
            value={login}
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
