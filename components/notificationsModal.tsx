import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { Buttons } from './buttons';

type NotificationModalProps = {
    visible: boolean;
    onClose: () => void;
    notifications: any[];
    onManageLoan?: (notification: any) => void;
    onAcceptFriend?: (notification: any) => void;
    onDeleteNotification?: (notificationId: string) => void;
    onMarkAllAsRead?: () => void;
    onManageFriendRequest?: (notification: any, action: 'accept' | 'refuse') => void;
    onRemindFriend?: (notification: any) => void;
    // 🌟 NOUVEAU : Fonctions pour gérer les avis
    onLeaveReview?: (notification: any) => void;
    onViewReview?: (notification: any) => void;
};

export default function NotificationModal({ 
    visible, onClose, notifications, onManageLoan, onAcceptFriend, onDeleteNotification, onMarkAllAsRead, onManageFriendRequest, onRemindFriend, onLeaveReview, onViewReview 
}: NotificationModalProps) {

   const renderNotification = ({ item }: { item: any }) => {
        // 1️⃣ Cas : Demande de prêt
        if (item.type === 'loan_request') {
            return (
                <View style={styles.notificationCard}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="film" size={20} color="#e8be4b" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationText}>
                            <Text style={styles.bold}>{item.senderId?.username}</Text> aimerait t'emprunter <Text style={styles.bold}>{item.movieId?.title_fr || item.movieId?.original_title || 'ce film'}</Text>.
                        </Text>
                        <Buttons 
                            title="Gérer le prêt" 
                            onPress={() => onManageLoan && onManageLoan(item)} 
                            variant="primary" 
                            style={{ marginTop: 10, paddingVertical: 8 }} 
                        />
                    </View>
                </View>
            );
        }

        // 2️⃣ Cas : Demande REFUSÉE
        if (item.type === 'loan_refused') {
            return (
                <View style={styles.notificationCard}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="times-circle" size={22} color="#d9534f" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationText}>
                            <Text style={styles.bold}>{item.senderId?.username}</Text> a <Text style={{color: '#d9534f', fontWeight: 'bold'}}>refusé</Text> votre demande pour le film <Text style={styles.bold}>{item.movieId?.title_fr || item.movieId?.original_title || ' '}</Text>.
                        </Text>
                    </View>
                    <TouchableOpacity 
                        style={{ marginLeft: 10, padding: 5 }} 
                        onPress={() => onDeleteNotification && onDeleteNotification(item._id)}
                    >
                        <FontAwesome name="trash" size={22} color="#aaa" />
                    </TouchableOpacity>
                </View>
            );
        }

        // 3️⃣ Cas : Demande ACCEPTÉE
        if (item.type === 'loan_accepted') {
            return (
                <View style={styles.notificationCard}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="check-circle" size={22} color="#5cb85c" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationText}>
                            <Text style={styles.bold}>{item.senderId?.username}</Text> a <Text style={{color: '#5cb85c', fontWeight: 'bold'}}>accepté</Text> votre demande ! Vous pouvez aller récupérer <Text style={styles.bold}>{item.movieId?.title_fr || item.movieId?.original_title || 'ce film'}</Text>.
                        </Text>
                    </View>
                    <TouchableOpacity 
                        style={{ marginLeft: 10, padding: 5 }} 
                        onPress={() => onDeleteNotification && onDeleteNotification(item._id)}
                    >
                        <FontAwesome name="trash" size={22} color="#aaa" />
                    </TouchableOpacity>
                </View>
            );
        }

        // 4️⃣ Cas : Demande d'ami
        if (item.type === 'friend_request') {
            return (
                <View style={styles.notificationCard}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="user-plus" size={20} color="#337ab7" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationText}>
                            <Text style={styles.bold}>{item.senderId?.username}</Text> (Code: {item.senderId?.friendCode}) souhaite vous ajouter à sa liste d'amis.
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Buttons 
                                    title="Refuser" 
                                    onPress={() => onManageFriendRequest && onManageFriendRequest(item, 'refuse')} 
                                    variant="primary" 
                                    style={{ backgroundColor: '#d9534f', paddingVertical: 8 }} 
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Buttons 
                                    title="Accepter" 
                                    onPress={() => onManageFriendRequest && onManageFriendRequest(item, 'accept')} 
                                    variant="primary" 
                                    style={{ backgroundColor: '#5cb85c', paddingVertical: 8 }} 
                                />
                            </View>
                        </View>
                    </View>
                </View>
            )
        }

        // ⏳ Cas : Date de prêt EXPIRÉE
        if (item.type === 'loan_expired') {
            const borrowerName = item.senderId?.username || "ton ami";
            return (
                <View style={styles.notificationCard}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="hourglass-end" size={20} color="#ff4d4d" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationText}>
                            <Text style={{color: '#ff4d4d', fontWeight: 'bold'}}>Date dépassée !</Text> Vous avez prêté <Text style={styles.bold}>{item.movieId?.title_fr || item.movieId?.original_title}</Text> à <Text style={styles.bold}>{borrowerName}</Text> et la date de retour est arrivée.
                        </Text>
                        {item.senderId && (
                            <Buttons 
                                title={`💬 Réclamer à ${borrowerName}`} 
                                onPress={() => onRemindFriend && onRemindFriend(item)} 
                                variant="primary" 
                                style={{ marginTop: 10, paddingVertical: 8, backgroundColor: '#e8be4b' }} 
                            />
                        )}
                    </View>
                    <TouchableOpacity 
                        style={{ marginLeft: 10, padding: 5, alignSelf: 'flex-start' }} 
                        onPress={() => onDeleteNotification && onDeleteNotification(item._id)}
                    >
                        <FontAwesome name="trash" size={20} color="#aaa" />
                    </TouchableOpacity>
                </View>
            );
        }

        // ⚠️ Cas : Rappel de retour
        if (item.type === 'loan_reminder') {
            return (
                <View style={styles.notificationCard}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="exclamation-triangle" size={22} color="#e8be4b" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationText}>
                            <Text style={{color: '#e8be4b', fontWeight: 'bold'}}>Rappel :</Text> <Text style={styles.bold}>{item.senderId?.username}</Text> aimerait récupérer son film <Text style={styles.bold}>{item.movieId?.title_fr || item.movieId?.original_title || ' '}</Text>. Pensez à lui rendre prochainement !
                        </Text>
                    </View>
                    <TouchableOpacity 
                        style={{ marginLeft: 10, padding: 5, alignSelf: 'flex-start' }} 
                        onPress={() => onDeleteNotification && onDeleteNotification(item._id)}
                    >
                        <FontAwesome name="trash" size={20} color="#aaa" />
                    </TouchableOpacity>
                </View>
            );
        }

        // ✅ Cas : Demande d'ami acceptée
        if (item.type === 'friend_accepted') {
            return (
                <View style={styles.notificationCard}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="check-circle" size={22} color="#5cb85c" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationText}>
                            Bonne nouvelle ! <Text style={styles.bold}>{item.senderId?.username}</Text> a accepté votre demande d'ami. Vous êtes désormais connectés ! 🎬
                        </Text>
                    </View>
                    <TouchableOpacity 
                        style={{ marginLeft: 10, padding: 5, alignSelf: 'flex-start' }} 
                        onPress={() => onDeleteNotification && onDeleteNotification(item._id)}
                    >
                        <FontAwesome name="trash" size={20} color="#aaa" />
                    </TouchableOpacity>
                </View>
            );
        }

        // 🚫 Cas : Demande d'ami refusée
        if (item.type === 'friend_refused') {
            return (
                <View style={styles.notificationCard}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="user-times" size={20} color="#aaa" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationText}>
                            Votre demande d'ami envoyée à <Text style={styles.bold}>{item.senderId?.username}</Text> n'a pas pu aboutir.
                        </Text>
                    </View>
                    <TouchableOpacity 
                        style={{ marginLeft: 10, padding: 5, alignSelf: 'flex-start' }} 
                        onPress={() => onDeleteNotification && onDeleteNotification(item._id)}
                    >
                        <FontAwesome name="trash" size={20} color="#aaa" />
                    </TouchableOpacity>
                </View>
            );
        }

        // 🌟 NOUVEAU 1 : Le film a été récupéré par le propriétaire, l'emprunteur peut laisser un avis
        if (item.type === 'loan_returned') {
            return (
                <View style={styles.notificationCard}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="pencil-square-o" size={22} color="#e8be4b" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationText}>
                            <Text style={styles.bold}>{item.senderId?.username}</Text> a bien récupéré <Text style={styles.bold}>{item.movieId?.title_fr || item.movieId?.original_title}</Text> ! Souhaitez-vous laisser un avis ?
                        </Text>
                        <Buttons 
                            title="Laisser un avis" 
                            onPress={() => onLeaveReview && onLeaveReview(item)} 
                            variant="primary" 
                            style={{ marginTop: 10, paddingVertical: 8, backgroundColor: '#e8be4b' }} 
                        />
                    </View>
                    <TouchableOpacity 
                        style={{ marginLeft: 10, padding: 5, alignSelf: 'flex-start' }} 
                        onPress={() => onDeleteNotification && onDeleteNotification(item._id)}
                    >
                        <FontAwesome name="trash" size={20} color="#aaa" />
                    </TouchableOpacity>
                </View>
            );
        }

        // 🌟 NOUVEAU 2 : Un avis a été publié par l'emprunteur
        if (item.type === 'review_posted') {
            return (
                <View style={styles.notificationCard}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="star" size={22} color="#e8be4b" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationText}>
                            <Text style={styles.bold}>{item.senderId?.username}</Text> a laissé un avis sur son emprunt de <Text style={styles.bold}>{item.movieId?.title_fr || item.movieId?.original_title}</Text>.
                        </Text>
                        <Buttons 
                            title="Voir l'avis" 
                            onPress={() => onViewReview && onViewReview(item)} 
                            variant="primary" 
                            style={{ marginTop: 10, paddingVertical: 8 }} 
                        />
                    </View>
                    <TouchableOpacity 
                        style={{ marginLeft: 10, padding: 5, alignSelf: 'flex-start' }} 
                        onPress={() => onDeleteNotification && onDeleteNotification(item._id)}
                    >
                        <FontAwesome name="trash" size={20} color="#aaa" />
                    </TouchableOpacity>
                </View>
            );
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Notifications</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                            <FontAwesome name="times-circle" size={28} color="#ff4d4d" />
                        </TouchableOpacity>
                    </View>
                    {notifications.some(n => !n.isRead) && (
                        <TouchableOpacity 
                            onPress={onMarkAllAsRead} 
                            style={{ alignSelf: 'flex-end', marginBottom: 15 }}
                        >
                            <Text style={{ color: '#e8be4b', textDecorationLine: 'underline', fontSize: 14 }}>
                                Tout marquer comme lu
                            </Text>
                        </TouchableOpacity>
                    )}

                    {notifications.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <FontAwesome name="bell-slash" size={40} color="#aaa" />
                            <Text style={styles.emptyText}>Aucune notification pour le moment.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={notifications}
                            keyExtractor={(item, index) => item._id?.toString() || index.toString()}
                            renderItem={renderNotification}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    )}

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#2A3B5C',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        height: '65%',
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#e8be4b',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e8be4b',
    },
    closeIcon: { padding: 5 },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#aaa',
        fontSize: 16,
        marginTop: 15,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    iconContainer: {
        marginRight: 15,
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    notificationText: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 22,
    },
    bold: {
        fontWeight: 'bold',
        color: '#e8be4b',
    },
});