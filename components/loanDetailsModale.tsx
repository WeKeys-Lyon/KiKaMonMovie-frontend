import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableWithoutFeedback, Animated, Dimensions, Alert } from 'react-native';
import { Buttons } from '../components/buttons';
import { useSelector, useDispatch } from 'react-redux';
import { setMovieReturned } from '../reducers/user';
import { User, PastLoans } from '../components/types';

const { height } = Dimensions.get('window');
const BACKEND_URL = process.env.BACKEND_URL;

type LoanDetailsModalProps = {
    visible: boolean;
    onClose: () => void;
    movieName: string;
    movieTmdbId: number;
    currentLoan: PastLoans; 
    onReturnSuccess: () => void;
    // 🌟 NOUVEAU : On ajoute ces propriétés pour adapter l'affichage
    shareType?: 'loaned' | 'borrowed'; 
    ownerName?: string; 
}

export default function LoanDetailsModal({ visible, onClose, movieName, movieTmdbId, currentLoan, onReturnSuccess, shareType = 'loaned', ownerName }: LoanDetailsModalProps) {
    const user = useSelector((state: {_persist: any, user: {value: User}}) => state.user.value);
    const dispatch = useDispatch();

    const [isRendered, setIsRendered] = useState(visible);
    const slideAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [friendName, setFriendName] = useState<string>('');

    useEffect(() => {
        if (currentLoan?.isSharedToUser && shareType === 'loaned') {
            const targetId = currentLoan.userid?._id || currentLoan.userid;
            console.log(user.friends)
            const friend = user.friends?.find((f) => f._id == targetId);
            if (friend) setFriendName(friend.username);
        }
    }, [currentLoan, user.friends, shareType]);

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
            ]).start(() => setIsRendered(false));
        }
    }, [visible]);

    if (!isRendered) return null;

    const formatDate = (dateString: Date) => {
        if (!dateString) return 'Date inconnue';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const handleReturn = async () => { 
        Alert.alert(
            'Retour du film',
            `Validez-vous le fait que "${movieName}" est de retour dans votre collection ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Valider',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const myURL = `${BACKEND_URL}/users/remove-loan`;
                            const response = await fetch(encodeURI(myURL), {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ token: user.token, tmdb_id: movieTmdbId }),
                            });

                            const data = await response.json();

                            if (data.result) {
                                const indexMovie = user.movies.findIndex((movie) => movie.tmdb_id == movieTmdbId);
                                if (indexMovie !== -1) {
                                    dispatch(setMovieReturned({ index: indexMovie }));
                                }
                                onReturnSuccess(); 
                                onClose(); 
                            } else {
                                Alert.alert("Erreur", data.error);
                            }
                        } catch (error) {
                            Alert.alert("Erreur", "Impossible de joindre le serveur");
                        }
                    }
                }
            ]
        );
    };

    const handleRemindBorrower = async () => {
        if (!currentLoan?.isSharedToUser) {
            Alert.alert("Prêt manuel", "Ce prêt a été fait à une personne n'utilisant pas KiKaMonMovie, relancez cette personne par un autre biais.");
            return;
        }

        try {
            const myURL = `${BACKEND_URL}/users/remind-loan`
            const response = await fetch(encodeURI(myURL), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: user.token,
                    borrowerId: currentLoan.userid?._id || currentLoan.userid,
                    movieId: currentLoan.movieid
                })
            });

            const data = await response.json();

            if (data.result) {
                Alert.alert('Rappel envoyé 🔔', data.message);
            } else {
                Alert.alert('Oups', data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />

            <View style={styles.contentWrapper}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.dismissArea} />
                </TouchableWithoutFeedback>

                <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                    
                    <Text style={styles.title}>Détails du prêt</Text>
                    <Text style={styles.subtitle}>{movieName}</Text>
                    
                    <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                        <View style={styles.infoBlock}>
                            {/* Le texte s'adapte */}
                            <Text style={styles.label}>{shareType === 'borrowed' ? 'Emprunté à :' : 'Prêté à :'}</Text>
                            <Text style={styles.value}>
                               {shareType === 'borrowed' 
                                    ? ownerName 
                                    : (currentLoan?.userid?.username || friendName || currentLoan?.borrower || 'Inconnu')
                                }
                            </Text>
                        </View>

                        <View style={styles.infoBlock}>
                            <Text style={styles.label}>Retour prévu le :</Text>
                            <Text style={styles.value}>{formatDate(currentLoan.dueDate)}</Text>
                        </View>

                        {currentLoan?.notes ? (
                            <View style={styles.infoBlock}>
                                <Text style={styles.label}>Notes :</Text>
                                <Text style={styles.notesValue}>{currentLoan.notes}</Text>
                            </View>
                        ) : null}
                    </ScrollView>

                    {/* On n'affiche les boutons QUE si le film est prêté (pas emprunté) */}
                    {shareType !== 'borrowed' && (
                        <View style={styles.actionButtonsContainer}>
                            <View style={{ flex: 1, marginRight: 5 }}>
                                <Buttons title="🔔 Réclamer" onPress={handleRemindBorrower} variant="primary" style={{ backgroundColor: '#e8be4b' }} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 5 }}>
                                <Buttons title="✅ Récupérer" onPress={handleReturn} variant="primary" style={{ backgroundColor: '#5cb85c' }} />
                            </View>
                        </View>
                    )}
                    
                    <View style={{ marginTop: 15 }}>
                        <Buttons title="Fermer" onPress={onClose} variant="secondary" />
                    </View>
                    
                </Animated.View>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 9999 },
    backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)' },
    contentWrapper: { flex: 1, justifyContent: 'flex-end' },
    dismissArea: { flex: 1, width: '100%' },
    modalContent: {
        backgroundColor: '#2A3B5C',
        borderTopLeftRadius: 25, borderTopRightRadius: 25,
        padding: 20, paddingBottom: 35,
        borderTopWidth: 1, borderColor: '#e8be4b',
        maxHeight: '85%', width: '100%',
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#e8be4b', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#fff', textAlign: 'center', marginBottom: 25, fontStyle: 'italic' },
    scrollArea: { flexShrink: 1, marginBottom: 15 },
    infoBlock: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15, borderRadius: 10, marginBottom: 15,
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    label: { color: '#aaa', fontSize: 14, marginBottom: 5 },
    value: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    notesValue: { color: '#fff', fontSize: 16, fontStyle: 'italic' },
    actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});