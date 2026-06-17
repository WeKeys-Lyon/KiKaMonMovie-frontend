import React, { useState, useEffect, useRef } from 'react';
import {Picker} from '@react-native-picker/picker';
import { StyleSheet, Text, View, ScrollView, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Animated, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { Buttons } from '../components/buttons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Checkbox } from 'expo-checkbox';
import { useSelector, useDispatch } from 'react-redux';
import { setMovieLoaned } from '../reducers/user';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';

const { height } = Dimensions.get('window');

type yearCarouselProps = {
    visible: boolean;
    selectedYear: number;
    modSelectedYear: (number: number) => void;
    onClose: () => void;
}

export default function YearCarousel({visible, selectedYear, modSelectedYear, onClose} : yearCarouselProps) {
    const moviesRedux = useSelector((state : any) => state.user.value.movies)
    const [isRendered, setIsRendered] = useState(visible);
    const slideAnim = useRef(new Animated.Value(height)).current; 
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [carouselYear, setCarouselYear] = useState<number>(selectedYear)

        //Obtenir les années de sorties des films dans la collection sans doublons
        let allYears : any[] = [];
        const getYearOfRelease = () => {
            moviesRedux.forEach((film: any) => {
                allYears.push(parseInt(film.release_date.slice(0,4)));            
            })
            allYears = [...new Set(allYears)].sort((a, b) => b - a);
        }
        getYearOfRelease();
        const renderYearList = () => {
            return allYears.map((annee) => {
            return (<Picker.Item label={annee.toString()} value={annee} />)
            })
        }
        

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

    return (                         <View style={styles.container}>    
                {/* 1. Le fond sombre qui apparait en fondu */}
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
                 <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                    <Picker   
                        placeholder={'Année de sortie en salle'}
                        
                        onValueChange={value => {
                        modSelectedYear(value);
                        }}
                        selectedValue={selectedYear}
                        style={{width: '100%', height: 'auto'}}
                    >
                        <Picker.Item label="Aucune" value={0} />
                        {renderYearList()}
                    </Picker>
                    <Buttons title="valider" onPress={() => onClose()} variant='secondary'/>
                </Animated.View>   
                </View>
                        )
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