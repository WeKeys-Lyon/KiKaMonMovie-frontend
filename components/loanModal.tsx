import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { Buttons } from '../components/buttons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Checkbox } from 'expo-checkbox';
import { useSelector, useDispatch } from 'react-redux';
import { setMovieLoaned } from '../reducers/user';
import { FontAwesome } from '@expo/vector-icons';


const { height } = Dimensions.get('window');

type loanModalProps = {
    visible: boolean;
    onClose: () => void;
    movie: any;
    movieTmdbId: number;
    onSuccess: (updatedPastLoans: any[]) => void;
    preselectedUser?: any;
    notificationId?: string;
}

export default function LoanModal({ movie, onClose, visible, movieTmdbId, onSuccess, preselectedUser, notificationId}: loanModalProps) {
    const user = useSelector((state: any) => state.user.value);
    const dispatch = useDispatch();
    const BACKEND_URL = process.env.BACKEND_URL;

    let dueDateDefault = new Date();
    dueDateDefault.setDate(dueDateDefault.getDate() + 7);

    const [loanTo, setLoanTo] = useState('');
    const [loanDate, setLoanDate] = useState(dueDateDefault);
    const [reminder, setReminder] = useState(false);
    const [notes, setNotes] = useState('');

    const [isRendered, setIsRendered] = useState(visible);
    const slideAnim = useRef(new Animated.Value(height)).current; 
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchFriendID, setSearchFriendID] = useState<number>(0);
    const [openSuggestions, setOpenSuggestions] = useState<boolean>(false);

    useEffect(() => {
        if (preselectedUser) {
            setSearchQuery(preselectedUser.username);
            setSearchFriendID(preselectedUser._id);
        } else if (!visible) {
            setLoanTo('');
        }
    }, [preselectedUser]);


    useEffect(() => {
        if (visible) {
            setIsRendered(true); 
            
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true })
            ]).start();
        } else {
            
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: height, duration: 300, useNativeDriver: true })
            ]).start(() => {
                setIsRendered(false); 
            });
        }
    }, [visible]);

    if (!visible) return null;

    const handleValidate = async () => {
        if (!loanTo.trim() && !searchQuery.trim()) {
            Alert.alert("Veuillez indiquer à qui vous prêtez ce film !");
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/users/add-loan`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: user.token,
                    tmdb_id: movieTmdbId,
                    isSharedToUser: (searchQuery && !loanTo) ? true : false,
                    userid: (searchQuery && !loanTo) ? searchFriendID : null,
                    borrower: (searchQuery && !loanTo) ? '' : loanTo,
                    dueDate: loanDate,
                    notes: notes,
                    Notification: reminder,
                    notificationId: notificationId
                }),
            });

            const data = await response.json();

            if (data.result) {
                console.log("Prêt enregistré avec succès !");
                const indexMovie = user.movies.findIndex(movie => movie.tmdb_id == movieTmdbId);
                dispatch(setMovieLoaned({index: indexMovie, data: data.answer}));
                onSuccess(data.answer)
                // On vide les champs pour la prochaine fois
                setLoanTo('');
                setNotes('');
                setReminder(false);
                // On ferme la modale
                onClose();
            } else {
                console.log("Erreur du serveur :", data.answer);
            }
        } catch (error) {
            console.error("Erreur lors de la requête :", error);
        }
    };
        const getGlobalSuggestions = () => {
            if (user.friends) {
                if (loanTo.trim().length <= 3) return [];
                const lowerText = loanTo.toLowerCase();
                const allSuggestions:{value: string, _id: any }[] = [];
                    user.friends.forEach((friend: {_id: any, username: string}) => {
                        if (friend.username && friend.username.toLowerCase().includes(lowerText)) {
                            allSuggestions.push({ value: friend.username, _id: friend._id });
                        }
                });
                return allSuggestions.slice(0, 5); // On garde les 5 meilleurs
            } else {
                return  [];
            }            
    };

    const suggestions = getGlobalSuggestions();
    return (
        <View style={styles.container}>
            {/* 1. Le fond sombre qui apparait en fondu */}
            <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />

            {/* 2. La zone de contenu */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0} 
                style={styles.keyboardView}
            >
                {/* Zone invisible au-dessus pour fermer le clavier */}
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.dismissArea} />
                </TouchableWithoutFeedback>

                {/* 3. La modale qui glisse de bas en haut */}
                <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                    
                    <Text style={styles.title}>Prêter {movie.title_fr ? movie.title_fr : movie.original_title } ?</Text>
                    
                    <ScrollView keyboardShouldPersistTaps='never' style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                        <TextInput
                            placeholder="Prêter à :"
                            placeholderTextColor="#aaa"
                            autoCapitalize="none"
                            onChangeText={(value) => {setLoanTo(value)}}
                            value={(searchQuery) ? searchQuery : loanTo}
                            style={styles.input}
                        />
                        {/*LE MENU DÉROULANT DES SUGGESTIONS */}
                            
                            {suggestions.length > 0  && (
                                <View style={styles.suggestionsContainer}>
                                    {suggestions.map((item, index) => {

                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.suggestionItem}
                                                onPress={() => {
                                                    setSearchFriendID(item._id);
                                                    setSearchQuery(item.value);
                                                     setLoanTo('') // On enregistre ce qu'on a cliqué
                                                    // On ferme la modale
                                                }}
                                            >
                                                <FontAwesome name="users" size={14} color="#e8be4b" style={styles.icon} />
                                                <Text style={styles.suggestionText} numberOfLines={1}>
                                                    {item.value} 
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        
                        <View style={styles.dateRow}>
                            <Text style={[styles.text, {marginBottom: 0}]}>Date du prêt :</Text>
                            <DateTimePicker 
                                mode="date" 
                                display="default" 
                                onValueChange={(event, selectedDate) => setLoanDate(selectedDate || loanDate)}
                                value={loanDate} 
                                style={styles.datepicker}
                                minimumDate={new Date()}
                                themeVariant="dark" 
                            />
                        </View>
                        
                        <View style={styles.row}>
                            <Text style={styles.text}>Obtenir une notification de rappel</Text>
                            <Checkbox
                                style={{ marginBottom: 15 }}
                                value={reminder}
                                onValueChange={setReminder}
                                color={reminder ? '#e8be4b' : undefined}
                            />
                        </View>
                        
                        <TextInput
                            placeholder="Notes :"
                            placeholderTextColor="#aaa"
                            autoCapitalize="none"
                            onChangeText={setNotes}
                            value={notes}
                            style={styles.notes}
                            multiline={true}
                            spellCheck={true}
                        />
                    </ScrollView>

                    <View style={styles.footer}>
                        <Buttons title="Retour" onPress={onClose} size='large' variant='secondary' />
                        <Buttons title="Valider" onPress={handleValidate} size='large' variant='secondary' />
                    </View>
                    
                </Animated.View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
    },
    // Le fond noir derrière
    backdrop: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end', // Pousse le formulaire en bas
    },
    dismissArea: {
        flex: 1, 
        width: '100%',
    },
    modalContent: {
        backgroundColor: '#1C2942',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        paddingBottom: 35,
        borderTopWidth: 1,
        borderColor: '#e8be4b',
        maxHeight: '85%',
        width: '100%',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#e8be4b',
        textAlign: 'center',
        marginBottom: 20,
    },
    scrollArea: {
        flexShrink: 1,
    },
    input: {
        fontSize: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 50,
        color: '#fff',
        marginBottom: 15,
    },
    dateRow: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    datepicker: {
        width: 130,
        height: 40,
    },
    row: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
    },
    text: {
        color: '#fff', 
        fontSize: 16,
        marginBottom: 15,
        flex: 1,
    },
    notes: {
        fontSize: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 120,
        color: '#fff',
        marginBottom: 10,
        textAlignVertical: 'top',
        paddingTop: 15,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
        marginTop: 10,
    },
     suggestionsContainer: {
    backgroundColor: '#2A3B5C', // Un bleu)àç!è  un peu plus clair pour se détacher
    borderRadius: 10,
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'rgba(232, 190, 75, 0.5)', // Bordure dorée légère
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
    marginLeft: 5
  },
});