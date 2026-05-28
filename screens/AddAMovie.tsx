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

type AddAMovieScreenProps = {
  navigation: NavigationProp<ParamListBase>;
};

export default function MyCollectionScreen({ navigation }: AddAMovieScreenProps) {

  const handleSubmit = () => {
    navigation.navigate('Home');
  };
  return (
    <SafeAreaView style={styles.container}>
        <Text>Ajouter un film</Text>
        <TouchableOpacity onPress={() => handleSubmit()}>
            <Text> Allez au menu HOME</Text>
        </TouchableOpacity>
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(214, 11, 255)'
  },
});
