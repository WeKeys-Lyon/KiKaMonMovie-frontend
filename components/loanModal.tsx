import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity,TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Buttons } from '../components/buttons';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Checkbox } from 'expo-checkbox';
import { useHeaderHeight } from '@react-navigation/elements'

type loanModalProps= {
    movieName: String,
    handleLoanReturn: () => void
}

export default function LoanModal({movieName, handleLoanReturn}: loanModalProps) {
    const [loanTo, setLoanTo] = useState('');
    const [loanDate, setLoanDate] = useState(new Date);
    const [reminder, setReminder] = useState(false);
    const [notes, setNotes] = useState('');
    const headerHeight = useHeaderHeight();



    return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={headerHeight}
                style={styles.container}
            >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView keyboardShouldPersistTaps='never'  >
                <View style={styles.box}>
                    <Text style={styles.title}>Prêter {movieName} ?</Text>
                <View>
                    {/* TODO penser à chercher dans la liste des amis */}
                    <TextInput
                        placeholder="Prêter à :"
                        placeholderTextColor="#000"
                        autoCapitalize="none"
                        onChangeText={setLoanTo}
                        value={loanTo}
                        style={styles.input}
                    />
                    <View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Text style={styles.text}>Date du prêt :  </Text>
                    <DateTimePicker 
                        mode="date" 
                        display="default" 
                        onValueChange={(event, selectedDate) => setLoanDate(selectedDate)}
                        value={loanDate} 
                        style={styles.datepicker}
                        minimumDate={new Date()}
                        />
                    </View>
                    <View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Text style={styles.text}>Obtenir une notification de rappel</Text>
                        <Checkbox
                            style={{marginBottom: 15}}
                            value={reminder}
                            onValueChange={setReminder}
                            color={reminder ? '#1C2942' : undefined}
                        />
                    </View>
                    <TextInput
                        placeholder="Notes :"
                        placeholderTextColor="#000"
                        autoCapitalize="none"
                        onChangeText={setNotes}
                        value={notes}
                        style={styles.notes}
                        multiline={true}
                        spellCheck={true}
                    />
                </View>
                <View style={styles.btnctn}>
                    <Buttons title="Retour" onPress={() => handleLoanReturn()} size='large'/>
                    <Buttons title="Valider" onPress={() => console.log('lol')} size='large'/>
                </View>
            </View>

            </ScrollView>
            </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

    
    )
}
const styles = StyleSheet.create({
container: {
    flex: 1,
    width: '100%',
    position: 'absolute',
    
},
box: {
    flex:1,
    flexShrink: 1,
    justifyContent:'flex-end',
    minWidth: '100%',
    width: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    backgroundColor: '#1a1a1aeb',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e8be4b',
},
title: {
    fontSize: 25,
    fontWeight: 600,
    color: '#fff',
    textAlign: 'center',

    marginBottom: 40,
    width: '100%',

},
input: {
    fontSize: 17,
    backgroundColor: 'rgb(201, 201, 201)',
    borderWidth: 1,
    borderColor: 'rgb(173, 173, 173)',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    color: '#000',
    marginBottom: 15,
},
datepicker: {
    flex:1,
    backgroundColor: '#1C2942',
    borderRadius: 8,
    color: '#000',
    marginBottom: 15,
},
text: {
    color: '#fff', 
    fontSize: 17,
    marginBottom: 15,
    width: '60%'
},
btnctn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    marginBottom: 15,
    height: 60
},
notes: {
    fontSize: 17,
    backgroundColor: 'rgb(201, 201, 201)',
    borderWidth: 1,
    borderColor: 'rgb(173, 173, 173)',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 150,
    color: '#000',
    marginBottom: 15,
},
})