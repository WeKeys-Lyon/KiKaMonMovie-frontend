import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity,TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Buttons } from '../components/buttons';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useState, useEffect } from 'react';


type loanModalProps= {
    movieName: String,


}

export default function LoanModal({movieName}: loanModalProps) {
    const [loanTo, setLoanTo] = useState('');
    const [loanDate, setLoanDate] = useState(new Date)
    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            >
            <View style={styles.box}>
                <View style={styles.inputContainer}>
                <Text style={styles.title}>Prêter {movieName} ?</Text>
                <View style={styles.loanto}>
                    <Text>Prêter à : </Text>
                    <TextInput
                                  placeholder="Prêter à :"
                                  placeholderTextColor="#000"
                                  autoCapitalize="none"
                                  onChangeText={setLoanTo}
                                  value={loanTo}
                                  style={styles.input}
                    />
                    <TextInput
                                  placeholder="Prêter à :"
                                  placeholderTextColor="#000"
                                  autoCapitalize="none"
                                  onChangeText={setLoanTo}
                                  value={loanTo}
                                  style={styles.input}
                    />
                </View>
            </View>
            </View>
            </KeyboardAvoidingView>
        </View>
    
    )
}
const styles = StyleSheet.create({
container: {
    flex: 1,
    marginTop: '20%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute'
},
box: {
    flex:1,
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1a1a1aeb',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e8be4b',
},
title: {
    fontSize: 30,
    fontWeight: 600,
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    marginBottom: 40
},
inputContainer: {
    width: '100%',
},
input: {
    backgroundColor: 'rgb(201, 201, 201)',
    borderWidth: 1,
    borderColor: 'rgb(173, 173, 173)',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    color: '#000',
    marginBottom: 15,
},
})