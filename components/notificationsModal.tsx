import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Buttons } from './buttons';

type NotificationModalProps = {
    visible: boolean;
    onClose: () => void;
    notifications: any[];
    // On préparera ces fonctions pour plus tard :
    onManageLoan?: (notification: any) => void;
    onAcceptFriend?: (notification: any) => void;
    onDeleteNotification?: (notificationId: string) => void;
    onMarkAllAsRead?: () => void;
};

export default function NotificationModal({ visible, onClose, notifications, onManageLoan, onAcceptFriend, onDeleteNotification, onMarkAllAsRead }: NotificationModalProps) {

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
                    {/* Icône de gauche */}
                    <View style={styles.iconContainer}>
                        <FontAwesome name="times-circle" size={22} color="#d9534f" />
                    </View>
                    
                    {/* Texte au centre */}
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationText}>
                            <Text style={styles.bold}>{item.senderId?.username}</Text> a <Text style={{color: '#d9534f', fontWeight: 'bold'}}>refusé</Text> ta demande pour le film <Text style={styles.bold}>{item.movieId?.title_fr || item.movieId?.original_title || 'ce film'}</Text>.
                        </Text>
                    </View>

                    {/* Corbeille à l'extrême droite */}
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
                    {/* Icône de gauche */}
                    <View style={styles.iconContainer}>
                        <FontAwesome name="check-circle" size={22} color="#5cb85c" />
                    </View>
                    
                    {/* Texte au centre */}
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationText}>
                            <Text style={styles.bold}>{item.senderId?.username}</Text> a <Text style={{color: '#5cb85c', fontWeight: 'bold'}}>accepté</Text> ta demande ! Tu peux aller récupérer <Text style={styles.bold}>{item.movieId?.title_fr || item.movieId?.original_title || 'ce film'}</Text>.
                        </Text>
                    </View>

                    {/* Corbeille à l'extrême droite */}
                    <TouchableOpacity 
                        style={{ marginLeft: 10, padding: 5 }} 
                        onPress={() => onDeleteNotification && onDeleteNotification(item._id)}
                    >
                        <FontAwesome name="trash" size={22} color="#aaa" />
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
        backgroundColor: '#1C2942',
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