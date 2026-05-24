import React, { useState } from 'react';
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

type HomeScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {

  const handleSubmit = () => {
    navigation.navigate('TabNavigator', { screen: 'MyCollection' });
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text>Bienvenue sur mon App</Text>
      <TouchableOpacity onPress={() => handleSubmit()}>
        <Text>Allez voir ma collection</Text>
      </TouchableOpacity>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(	255, 190, 11, 1)'
  },
});
