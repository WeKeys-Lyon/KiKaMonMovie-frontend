import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

type HeaderProps = {
    title: string,
    leftIcon?: any,
    rightIcon?: any,
    onPressLeft?: () => void,
    onPressRight?: () => void,
    onPressLogout?: () => void
}
export default function Header({ title, leftIcon, rightIcon, onPressLeft, onPressRight, onPressLogout}: HeaderProps) {
    const insets = useSafeAreaInsets();
    const displayTitle = title ? title : 'KikaMonMovie'

    

    return (
        <View style={[styles.headerContainer, { paddingTop: insets.top, paddingBottom: 15 }]}>
            
            <View style={styles.sideZone}>
                <View style={styles.leftIconsWrapper}>
                    {/* LE LOGO PROFIL */}
                    {onPressLeft && (
                        <TouchableOpacity onPress={onPressLeft} style={styles.iconButton}>
                            {leftIcon}
                        </TouchableOpacity>
                    )}
                    
                    {/* LE LOGO DÉCONNEXION */}
                    {onPressLogout && (
                        <TouchableOpacity onPress={onPressLogout} style={styles.iconButton}>
                            <FontAwesome name="sign-out" size={24} color="#ff4d4d" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.titleZone}>
                <Text style={styles.title}>{displayTitle}</Text>
            </View>

            <View style={styles.sideZone}>
                {/* LE LOGO RÉGLAGES*/}
                {onPressRight && (
                    <TouchableOpacity onPress={onPressRight} style={styles.iconButton}>
                        <FontAwesome name="cog" size={24} color="#92c4d8" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#1C2942',
        width: '100%',
        flexDirection: 'row', 
        alignItems: 'center', 
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    sideZone: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftIconsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10, 
    },
    titleZone: {
        flex: 2, 
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 1,
    },
    iconButton: {
        padding: 8, 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: 20,
    },
});