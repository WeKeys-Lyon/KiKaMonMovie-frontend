import React, { useEffect } from 'react';
import {Buttons} from '../components/buttons';
import { ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

import { useSelector } from 'react-redux';
import { User } from '../components/types';

type HomeScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const user = useSelector((state: {_persist: any, user: {value: User}}) => state.user.value);
  //Mettre ce useEffect en sourdine si on veut travailler sur la page SignIn ou SignUp
  useEffect(() => {
    if (user.token) {
      navigation.navigate('TabNavigator' );
    }
  }, [])
  const handleSignUp = () => 
      navigation.navigate('SignUp');

  const handleSignIn = () => 
      navigation.navigate('SignIn');
    
  return (
    <ImageBackground source={require('../assets/Partager.png')} style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>Bienvenue sur KiKaMonMovie</Text>
          <Text style={styles.subtitle}>Prêt à partager un film ?</Text>
        </View>
        <View style={styles.buttonContainer}>
          <Buttons title='Se connecter' onPress={handleSignIn} variant="actionButton" textStyle={{width: '100%'}}/>
          <Buttons title="S'inscrire" onPress={handleSignUp} variant="actionButton" textStyle={{width: '100%'}}/>
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
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100 %',
    paddingHorizontal: 20,
    marginTop: 30,
    gap: 10,
  },
  actionButton: {
    width: '80%',
  },
  button: {
    backgroundColor: '#1c2942',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    },
   
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }


});
