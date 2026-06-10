import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HeaderProps = {
    title?: string, 
    leftIcon?: React.ReactNode,
    rightIcon?: React.ReactNode,
    onPressLeft?: () => void,
    onPressRight?: () => void,
}

export default function Header({ title, leftIcon, rightIcon, onPressLeft, onPressRight }: HeaderProps) {
    const insets = useSafeAreaInsets();
    const displayTitle = title ? title : 'KikaMonMovie';

    return (
        <View style={[styles.headerContainer, { paddingTop: insets.top, paddingBottom: 15 }]}>
            
            {/* ZONE GAUCHE */}
            <View style={styles.sideZone}>
                <View style={styles.leftIconsWrapper}>
                    {leftIcon && onPressLeft && (
                        <TouchableOpacity onPress={onPressLeft} style={styles.iconButton}>
                            {leftIcon}
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ZONE TITRE */}
            <View style={styles.titleZone}>
                <Text style={styles.title} numberOfLines={1}>{displayTitle}</Text>
            </View>

            {/* ZONE DROITE */}
            <View style={styles.sideZone}>
                {rightIcon && (
                    onPressRight ? (
                        /* Cas 1 : Une icône simple avec une action globale */
                        <TouchableOpacity onPress={onPressRight} style={styles.iconButton}>
                            {rightIcon}
                        </TouchableOpacity>
                    ) : (
                        /* Cas 2 : Un groupe d'icônes qui gèrent déjà leurs clics */
                        <View style={styles.iconButton}>
                            {rightIcon}
                        </View>
                    )
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
        shadowOffset: { width: 0, height: 2 },
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