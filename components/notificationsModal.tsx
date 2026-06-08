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
};

export default function NotificationModal({ visible, onClose, notifications, onManageLoan, onAcceptFriend }: NotificationModalProps) {

    const renderNotification = ({ item }: { item: any }) => {
        // Selon le type de notification, l'affichage et les boutons changent 
        if (item.type === 'loan_request') {
            return (
                <View style={styles.notificationCard}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="film" size={20} color="#e8be4b" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.notificationText}>
                            <Text style={styles.bold}>{item.senderId?.username}</Text> aimerait t'emprunter <Text style={styles.bold}>{item.movieId?.title_fr || item.movieId?.original_title}</Text>.
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

        // On pourra ajouter les autres types plus tard (friend_request, etc.)
        return null;
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