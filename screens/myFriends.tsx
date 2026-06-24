import React, { useState, useEffect } from 'react';
// 🚀 AJOUT DE L'IMPORT IMAGE
import { View, Text, StyleSheet, TextInput, Alert, FlatList, TouchableOpacity, Share, KeyboardAvoidingView, Platform, Switch, Modal, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {addFriend, removeFriend} from '../reducers/user';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import Header from '../components/header';
import { Buttons } from '../components/buttons';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { User } from '../components/types';
// 🚀 IMPORT DU DICTIONNAIRE D'AVATARS
import { avatars } from '../components/avatarMap'; 

type MyFriendsProps = {
  navigation: NavigationProp<ParamListBase>;
};

const BACKEND_URL = process.env.BACKEND_URL;

export default function MyFriends({ navigation }: MyFriendsProps) {
  const user = useSelector((state: {_persist: any, user: {value: User}}) => state.user.value);
  const dispatch = useDispatch();
  // Variables d'état
  const [myCode, setMyCode] = useState<string>('CHARGEMENT...');
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [codeToAdd, setCodeToAdd] = useState<string>('');
  // Gestion de la modale de permissions
  const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  // 1. Récupérer les données au chargement de l'écran
  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/users/my-social-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: user.token }),
      });
      const data = await response.json();
      if (data.result) {
        setMyCode(data.friendCode);
        setFriendsList(data.friends);
        setPendingRequests(data.pendingRequests || []);
      } else {
        Alert.alert('Erreur', data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 2. Partager son code ami
  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Salut ! Ajoute-moi sur l'appli de collection de films. Mon code ami est : ${myCode}`,
      });
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de partager le code.');
    }
  };

  // 3. Ajouter un ami
  const handleAddFriend = async () => {
    if (codeToAdd.trim().length !== 6) {
      Alert.alert('Erreur', 'Le code ami doit faire 6 caractères.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/users/add-friend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: user.token,
          friendCodeToAdd: codeToAdd.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (data.result) {
        Alert.alert('Succès !', data.message);
        setCodeToAdd(''); 
        fetchSocialData();
        dispatch(addFriend(data.answer));
      } else {
        Alert.alert('Erreur', data.error);
      }
    } catch (error) {
      Alert.alert('Erreur réseau', 'Impossible de joindre le serveur.');
    }
  };

  const handleUpdatePermissions = async (canSee: boolean, canAsk: boolean) => {
    if (!selectedFriend) return;

    try {
      const response = await fetch(`${BACKEND_URL}/users/update-friend-permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: user.token,
          friendId: selectedFriend.userid._id,
          canSeeMyCollection: canSee,
          canAskForMovies: canAsk,
        }),
      });

      const data = await response.json();
      if (data.result) {
        setIsPermissionModalVisible(false);
        fetchSocialData();
      } else {
        Alert.alert('Erreur', data.error);
      }
    } catch (error) {
      Alert.alert('Erreur réseau', 'Impossible de modifier les permissions.');
    }
  };

  // Supprimer un ami
  const handleDeleteFriend = () => {
    if (!selectedFriend) return;

    Alert.alert(
      "Rompre l'amitié",
      `Êtes-vous sûr de vouloir supprimer ${selectedFriend.userid.username} de vos amis ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            try {
              const response = await fetch(`${BACKEND_URL}/users/remove-friend`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  token: user.token,
                  friendId: selectedFriend.userid._id,
                }),
              });

              const data = await response.json();
              if (data.result) {
                setIsPermissionModalVisible(false); 
                dispatch(removeFriend(selectedFriend.userid.username))
                fetchSocialData(); 
              } else {
                Alert.alert('Erreur', data.error);
              }
            } catch (error) {
              Alert.alert('Erreur réseau', 'Impossible de supprimer cet ami.');
            }
          } 
        }
      ]
    );
  };

  const hasValidAvatar = (userObj: any) => {
    return userObj && userObj.avatar && userObj.avatar !== 'default' && avatars[userObj.avatar as keyof typeof avatars];
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Mes Amis" 
        leftIcon={<FontAwesome name="home" size={28} color="#e8be4b" />}
        onPressLeft={() => navigation.goBack()}
      />

      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* SECTION 1 : MON CODE AMI */}
        <View style={styles.myCodeSection}>
          <Text style={styles.sectionTitle}>Mon Code Ami</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{myCode}</Text>
            <TouchableOpacity onPress={handleShareCode} style={styles.shareButton}>
              <FontAwesome name="share-alt" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 2 : AJOUTER UN AMI */}
        <View style={styles.addFriendSection}>
          <Text style={styles.sectionTitle}>Ajouter un ami</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Code (ex: A7K9PX)"
              placeholderTextColor="#aaa"
              autoCapitalize="characters"
              maxLength={6}
              value={codeToAdd}
              onChangeText={setCodeToAdd}
            />
            <Buttons title="Ajouter" onPress={handleAddFriend} variant="secondary" style={{ flex: 1, marginLeft: 10 }} />
          </View>
        </View>

        {/*SECTION DEMANDES EN ATTENTE */}
          {pendingRequests.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionTitle}>Demandes envoyées ({pendingRequests.length})</Text>
              {pendingRequests.map((req, index) => (
                <View key={index} style={styles.pendingCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    
                    {/* 🚀 MODIFICATION ICI : Avatar pour les demandes en attente */}
                    {hasValidAvatar(req) ? (
                      <Image 
                        source={avatars[req.avatar as keyof typeof avatars]} 
                        style={[styles.friendAvatar, { opacity: 0.5 }]} 
                      />
                    ) : (
                      <FontAwesome name="user-circle" size={30} color="#888" style={{ marginRight: 15, opacity: 0.5 }} />
                    )}
                    
                    <View>
                      <Text style={styles.pendingName}>{req.username}</Text>
                      <Text style={styles.pendingSubtext}>En attente d'acceptation...</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

        {/* SECTION 3 : LISTE D'AMIS */}
        <Text style={styles.sectionTitle}>Ma Liste d'amis ({friendsList.length})</Text>
        
        {friendsList.length === 0 ? (
          <Text style={styles.emptyText}>Vous n'avez pas encore ajouté d'amis.</Text>
        ) : (
          <FlatList
            data={friendsList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.friendCard}>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                  onPress={() => {
                    navigation.navigate('FriendCollection', { 
                      friendId: item.userid._id, 
                      friendName: item.userid.username,
                      friendAvatar: item.userid.avatar
                    });
                  }}
                >
                  {/* 🚀 MODIFICATION ICI : Avatar pour la liste d'amis principale */}
                  {hasValidAvatar(item.userid) ? (
                    <Image 
                      source={avatars[item.userid.avatar as keyof typeof avatars]} 
                        style={styles.friendAvatar} 
                    />
                  ) : (
                    <FontAwesome name="user-circle" size={30} color="#e8be4b" style={{ marginRight: 15 }} />
                  )}
                  
                  <Text style={styles.friendName}>
                    {item.userid?.username || 'Utilisateur inconnu'}
                  </Text>
                </TouchableOpacity>
                
                {/* Gestion des permissions */}
                <TouchableOpacity onPress={() => {
                  setSelectedFriend(item); 
                  setIsPermissionModalVisible(true); 
                }}>
                  <FontAwesome name="cog" size={24} color="#aaa" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </KeyboardAvoidingView>
      
      {/* MODALE DE PERMISSIONS */}
      <Modal visible={isPermissionModalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#1C2942', padding: 25, borderRadius: 15, width: '85%', borderWidth: 1, borderColor: '#e8be4b' }}>
            
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#e8be4b', marginBottom: 20, textAlign: 'center' }}>
              Permissions pour {selectedFriend?.userid?.username}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: '#fff', fontSize: 16, flex: 1 }}>Peut voir ma collection</Text>
              <Switch 
                value={selectedFriend?.canSeeMyCollection} 
                onValueChange={(value) => setSelectedFriend({ ...selectedFriend, canSeeMyCollection: value })}
                trackColor={{ false: "#767577", true: "#e8be4b" }}
                thumbColor={selectedFriend?.canSeeMyCollection ? "#fff" : "#f4f3f4"}
              />
              
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
              <Text style={{ color: '#fff', fontSize: 16, flex: 1 }}>Peut me demander des films</Text>
              <Switch 
                value={selectedFriend?.canAskForMovies} 
                onValueChange={(value) => setSelectedFriend({ ...selectedFriend, canAskForMovies: value })}
                trackColor={{ false: "#767577", true: "#e8be4b" }}
                thumbColor={selectedFriend?.canAskForMovies ? "#fff" : "#f4f3f4"}
              />
            </View>
            
            <TouchableOpacity 
              onPress={handleDeleteFriend}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(217, 83, 79, 0.2)',
                borderColor: '#d9534f',
                borderWidth: 1,
                padding: 12,
                borderRadius: 8,
                marginBottom: 30,
                marginTop: 10
              }}
            >
              <FontAwesome name="user-times" size={18} color="#d9534f" style={{ marginRight: 10 }} />
              <Text style={{ color: '#d9534f', fontWeight: 'bold', fontSize: 16 }}>
                Supprimer cet ami
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Buttons title="Annuler" onPress={() => setIsPermissionModalVisible(false)} variant="secondary" style={{ flex: 1 }} />
              <Buttons 
                title="Valider" 
                onPress={() => handleUpdatePermissions(selectedFriend.canSeeMyCollection, selectedFriend.canAskForMovies)} 
                variant="secondary" 
                style={{ flex: 1 }} 
              />
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2A3B5C' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#e8be4b', marginBottom: 10, marginTop: 15 },
  
  // Section Mon Code
  myCodeSection: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e8be4b' },
  codeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  codeText: { fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: 5, marginRight: 15 },
  shareButton: { backgroundColor: '#e8be4b', padding: 12, borderRadius: 25 },
  
  // Section Ajouter
  addFriendSection: { marginTop: 20, marginBottom: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 2, backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', borderRadius: 8, padding: 15, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  
  // Liste d'amis
  emptyText: { color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  friendCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 10, marginBottom: 10 },
  friendName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // 🚀 NOUVEAU STYLE : L'avatar de l'ami
  friendAvatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },

  // Styles pour les demandes en attente
  pendingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed' },
  pendingName: { color: '#888', fontSize: 16, fontWeight: 'bold' },
  pendingSubtext: { color: '#666', fontSize: 12, fontStyle: 'italic', marginTop: 2 },
});