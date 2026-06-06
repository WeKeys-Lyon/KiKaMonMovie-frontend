import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, Alert,TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Buttons } from '../components/buttons';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Checkbox } from 'expo-checkbox';
import { useHeaderHeight } from '@react-navigation/elements';
import {addMovieLoan, setMovieReturned} from '../reducers/user';

type loanModalProps= {
    movieName: String,
    movieTmdbId: Number,
    handleLoanReturn: () => void
}

export default function LoanModal({movieName, movieTmdbId, handleLoanReturn}: loanModalProps) {
    const BACKEND_URL = process.env.BACKEND_URL;
    const user = useSelector((state: any) => state.user.value);
    const dispatch = useDispatch();
    let dueDateDefault = new Date();
    dueDateDefault.setDate(dueDateDefault.getDate() + 7);
    const [loanTo, setLoanTo] = useState('');
    const [loanDate, setLoanDate] = useState(dueDateDefault);
    const [reminder, setReminder] = useState(false);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const headerHeight = useHeaderHeight();
    const [loanState, setLoanState] = useState(user.movies.find(movie => movie.tmdb_id == movieTmdbId).isLoaned);
    const theMovie = user.movies.find(movie => movie.tmdb_id == movieTmdbId);
    const loanInfos = theMovie.pastLoans.at(-1);

    const handleLoanData =  async () => {
        const data = {
            token: user.token,
            tmdb_id: movieTmdbId,
            isSharedToUser: false, /* pour le moment... 
           Todo  userid: userid, */
            borrower: loanTo,
            dueDate: loanDate,
            notes: (notes) ? notes : '',
            Notification: reminder
        };
        
        const myURL = `${BACKEND_URL}/users/add-loan`;
        const response = await fetch(encodeURI(myURL), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const answer = await response.json();
        
        
        if (await answer.result) {
            const indexMovie = user.movies.findIndex(movie => movie.tmdb_id == movieTmdbId);
            dispatch(addMovieLoan({index: indexMovie, data: answer.answer}));
            setLoanState(true)
            handleLoanReturn();
        } else {
            setError(answer.error)
        }
        
    }
    const handleEndLoan = () => {
                  Alert.alert(
                    'Retour du film',
                    `Validez-vous le fait que "${theMovie.title_fr || theMovie.original_title}" est de retour dans votre collection ?`,
                    [
                      {
                        text: 'Annuler',
                        style: 'cancel',
                      },
                      {
                        text: 'Valider',
                        style: 'destructive',
                        onPress: async () => {
                          
                          try {
                            const myURL = `${BACKEND_URL}/users/remove-loan`
                            const response = await fetch(encodeURI(myURL), {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                token: user.token,
                                tmdb_id: movieTmdbId,
                              }),
                            });
                            const data = await response.json();
                            if (data.result) {
                              
                              const indexMovie = user.movies.findIndex(movie => movie.tmdb_id == movieTmdbId);
                              setLoanState(false);
                              dispatch(setMovieReturned({index: indexMovie}));
                            } else {
                              console.log("Erreur lors de la suppression", data.error);
                            }
                          } catch (error) {
                            console.error(error);
                          }
                          
                          handleLoanReturn(); // On ferme la modale
                        } 
                      }
                    ]
                  );
                }
    return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={headerHeight}
                style={styles.container}
            >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView keyboardShouldPersistTaps='never'  >
                <View style={styles.box}>
                    {loanState ? (<Text style={styles.title}>Détails du pret de {movieName}</Text>) : (<Text style={styles.title}>Prêter {movieName} ?</Text>)}
                <View>
                    {/* TODO penser à chercher dans la liste des amis */}
                    {loanState ? (<View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-start'}}>
                        <Text style={[styles.text, {width: '25%'}]} >Prêté à : </Text>
                        <Text style={[styles.text, {fontWeight: 600}]}>{loanInfos.borrower}</Text>
                        </View>) 
                        : 
                        (<TextInput
                        placeholder="Prêter à :"
                        placeholderTextColor="#000"
                        autoCapitalize="none"
                        onChangeText={setLoanTo}
                        value={loanTo}
                        style={styles.input}
                    />)}

                    {loanState ? (<View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                        <Text style={[styles.text, {width: '25%'}]}>Retour prévu le :  </Text>
                        <Text style={styles.text}>
                        {new Date(loanInfos.dueDate).toLocaleDateString("fr-FR").split('T')[0]}
                        </Text>
                        </View>) 
                        : 
                        (
                    <View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Text style={styles.text}>Retour prévu le :  </Text>
                        <DateTimePicker 
                        mode="date" 
                        display="default" 
                        onValueChange={(event, selectedDate) => setLoanDate(selectedDate)}
                        value={loanDate} 
                        style={styles.datepicker}
                        minimumDate={new Date()}
                        />                    
                    </View>)}
                    {loanState ? (<View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Text style={[styles.text,{width: '55%'}]}>Notification de rappel :</Text>
                        <Text style={styles.text}>{loanInfos.Notification ? 'OUI' : 'NON'}</Text>
                        </View>) 
                        : 
                        (<View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Text style={styles.text}>Obtenir une notification de rappel</Text>
                        <Checkbox
                            style={{marginBottom: 15}}
                            value={reminder}
                            onValueChange={setReminder}
                            color={reminder ? '#1C2942' : undefined}
                        />
                        </View>)}
                    {loanState ? (
                        loanInfos.notes ? (<View style={{flex: 1, flexDirection: 'row'}}><Text style={[styles.text, {width: '25%'}]}>Notes : </Text>
                        <Text style={styles.text}>{loanInfos.notes}</Text></View>) : (<></>)
                        )
                        :
                        (
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
                        )}
                </View>
                <Text style={{color: 'red', textAlign: 'center'}}>{(error) ? error : ''}</Text>
                <View style={styles.btnctn}>
                    <Buttons title="Retour" onPress={() => handleLoanReturn()} size='large'/>
                    {loanState ? (<Buttons title="Retour du film" onPress={() => handleEndLoan()} size='large'/>) : (<Buttons title="Valider" onPress={() => handleLoanData()} size='large'/>)}
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
    textAlignVertical: 'center'
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