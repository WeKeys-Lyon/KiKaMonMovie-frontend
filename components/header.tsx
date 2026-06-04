import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HeaderProps = {
    title: string,
    leftIcon?: boolean,
    rightIcon?: boolean,
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
                {leftIcon && (<>
                    <TouchableOpacity onPress={onPressLeft} style={styles.iconButton}>
                        {leftIcon}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onPressLogout}style={styles.iconButton}>
                        <Text style={{ fontSize: 20 }}>❌</Text>
                    </TouchableOpacity></>
                )}
            </View>
            <View style={styles.titleZone}>
                <Text style={styles.title}>{displayTitle}</Text>
            </View>
            <View style={styles.sideZone}>
                {rightIcon && (
                    <TouchableOpacity onPress={onPressRight} style={styles.iconButton}>
                        {rightIcon}
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
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: 20,
    },
});