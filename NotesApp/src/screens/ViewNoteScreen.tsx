import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Note } from '../types';
import { formatDate } from '../utils';
import StorageService from '../services/storageService';
import BlockchainService from '../services/blockchainService';
import EncryptionService from '../services/encryptionService';

type ViewNoteScreenProp = StackNavigationProp<RootStackParamList, 'ViewNote'>;
type ViewNoteRouteProp = RouteProp<RootStackParamList, 'ViewNote'>;

const ViewNoteScreen: React.FC = () => {
  const navigation = useNavigation<ViewNoteScreenProp>();
  const route = useRoute<ViewNoteRouteProp>();
  const { noteId } = route.params;

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadNote = useCallback(async () => {
    try {
      const loadedNote = await StorageService.getNote(noteId);
      if (loadedNote) {
        setNote(loadedNote);
      } else {
        Alert.alert('Error', 'Note not found', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Failed to load note:', error);
      Alert.alert('Error', 'Failed to load note', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [noteId, navigation]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleEdit = () => {
    navigation.navigate('EditNote', { noteId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteNote(noteId);
              Alert.alert('Success', 'Note deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              console.error('Failed to delete note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!note) return;

    try {
      const shareContent = `${note.title}\n\n${note.content}${
        note.tags && note.tags.length > 0 ? `\n\nTags: ${note.tags.join(', ')}` : ''
      }`;

      await Share.share({
        message: shareContent,
        title: note.title,
      });
    } catch (error) {
      console.error('Failed to share note:', error);
      Alert.alert('Error', 'Failed to share note');
    }
  };

  const handleAddToBlockchain = async () => {
    if (!note) return;

    Alert.alert(
      'Add to Blockchain',
      'This will encrypt and add your note to the blockchain. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Blockchain',
          onPress: async () => {
            try {
              const encryptedNote = EncryptionService.encryptNote(note);
              const blockchainNote = BlockchainService.addNoteToBlockchain(encryptedNote);
              Alert.alert(
                'Success',
                `Note added to blockchain!\n\nBlock Hash: ${blockchainNote.hash.substring(0, 16)}...\nBlock Number: ${BlockchainService.getChain().length - 1}`
              );
            } catch (error) {
              console.error('Failed to add note to blockchain:', error);
              Alert.alert('Error', 'Failed to add note to blockchain');
            }
          },
        },
      ]
    );
  };

  const showBlockchainInfo = () => {
    const stats = BlockchainService.getBlockchainStats();
    const blockchainNote = BlockchainService.getBlockByNoteId(noteId);

    let message = `Blockchain Statistics:\nTotal Blocks: ${stats.totalBlocks}\nChain Valid: ${stats.isValid ? 'Yes' : 'No'}`;

    if (blockchainNote) {
      message += `\n\nThis note is in the blockchain:\nBlock Hash: ${blockchainNote.hash.substring(0, 32)}...\nNonce: ${blockchainNote.nonce}`;
    } else {
      message += '\n\nThis note is not yet in the blockchain.';
    }

    Alert.alert('Blockchain Information', message);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading note...</Text>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Note not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Text style={styles.headerButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Note</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
          <Text style={styles.headerButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.noteContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.noteTitle}>{note.title}</Text>
            <Text style={styles.noteDate}>{formatDate(note.updatedAt)}</Text>
          </View>

          <Text style={styles.noteContent}>{note.content}</Text>

          {note.tags && note.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>Tags:</Text>
              <View style={styles.tagsWrapper}>
                {note.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.metadataContainer}>
            <Text style={styles.metadataTitle}>Note Information:</Text>
            <Text style={styles.metadataText}>
              Created: {note.createdAt.toLocaleDateString()} at {note.createdAt.toLocaleTimeString()}
            </Text>
            <Text style={styles.metadataText}>
              Last Updated: {note.updatedAt.toLocaleDateString()} at {note.updatedAt.toLocaleTimeString()}
            </Text>
            <Text style={styles.metadataText}>
              Characters: {note.content.length}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Text style={styles.actionButtonText}>📤 Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.blockchainButton]}
          onPress={handleAddToBlockchain}
        >
          <Text style={styles.actionButtonText}>⛓️ Blockchain</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.infoButton]}
          onPress={showBlockchainInfo}
        >
          <Text style={styles.actionButtonText}>ℹ️ Info</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.actionButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  noteContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  titleContainer: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  noteDate: {
    fontSize: 14,
    color: '#666',
  },
  noteContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metadataContainer: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  blockchainButton: {
    backgroundColor: '#FF9500',
  },
  infoButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ViewNoteScreen;