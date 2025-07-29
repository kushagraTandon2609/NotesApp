import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Note, RootStackParamList } from '../types';
import { formatDate, searchNotes, sortNotes, truncateText } from '../utils';
import StorageService from '../services/storageService';
import BlockchainService from '../services/blockchainService';
import EncryptionService from '../services/encryptionService';

type NotesListScreenProp = StackNavigationProp<RootStackParamList, 'NotesList'>;

const NotesListScreen: React.FC = () => {
  const navigation = useNavigation<NotesListScreenProp>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt'>('updatedAt');

  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedNotes = await StorageService.loadNotes();
      setNotes(loadedNotes);
      setFilteredNotes(sortNotes(loadedNotes, sortBy));
    } catch (error) {
      console.error('Failed to load notes:', error);
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

  const refreshNotes = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  useEffect(() => {
    const searchedNotes = searchNotes(notes, searchTerm);
    const sortedNotes = sortNotes(searchedNotes, sortBy);
    setFilteredNotes(sortedNotes);
  }, [notes, searchTerm, sortBy]);

  const handleDeleteNote = async (noteId: string) => {
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
              setNotes(prev => prev.filter(note => note.id !== noteId));
              Alert.alert('Success', 'Note deleted successfully');
            } catch (error) {
              console.error('Failed to delete note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const handleAddToBlockchain = async (note: Note) => {
    try {
      const encryptedNote = EncryptionService.encryptNote(note);
      const blockchainNote = BlockchainService.addNoteToBlockchain(encryptedNote);
      Alert.alert(
        'Blockchain',
        `Note added to blockchain!\nBlock Hash: ${blockchainNote.hash.substring(0, 16)}...`
      );
    } catch (error) {
      console.error('Failed to add note to blockchain:', error);
      Alert.alert('Error', 'Failed to add note to blockchain');
    }
  };

  const showBlockchainStats = () => {
    const stats = BlockchainService.getBlockchainStats();
    Alert.alert(
      'Blockchain Statistics',
      `Total Blocks: ${stats.totalBlocks}\nChain Valid: ${stats.isValid ? 'Yes' : 'No'}`
    );
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => navigation.navigate('ViewNote', { noteId: item.id })}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle}>{truncateText(item.title, 30)}</Text>
        <Text style={styles.noteDate}>{formatDate(item.updatedAt)}</Text>
      </View>
      <Text style={styles.noteContent}>{truncateText(item.content, 100)}</Text>
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <Text key={index} style={styles.tag}>
              #{tag}
            </Text>
          ))}
          {item.tags.length > 3 && <Text style={styles.tag}>+{item.tags.length - 3}</Text>}
        </View>
      )}
      <View style={styles.noteActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditNote', { noteId: item.id })}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.blockchainButton]}
          onPress={() => handleAddToBlockchain(item)}
        >
          <Text style={styles.actionButtonText}>⛓️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteNote(item.id)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Notes Yet</Text>
      <Text style={styles.emptySubtitle}>
        {searchTerm ? 'No notes match your search' : 'Tap the + button to create your first note'}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading notes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Notes</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={showBlockchainStats}>
            <Text style={styles.headerButtonText}>⛓️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('CreateNote')}
          >
            <Text style={styles.headerButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {['updatedAt', 'createdAt', 'title'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.sortOption, sortBy === option && styles.sortOptionActive]}
            onPress={() => setSortBy(option as any)}
          >
            <Text
              style={[styles.sortOptionText, sortBy === option && styles.sortOptionTextActive]}
            >
              {option === 'updatedAt' ? 'Updated' : option === 'createdAt' ? 'Created' : 'Title'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredNotes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        style={styles.notesList}
        contentContainerStyle={filteredNotes.length === 0 ? styles.emptyListContainer : undefined}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshNotes} />}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  sortOptionActive: {
    backgroundColor: '#007AFF',
  },
  sortOptionText: {
    fontSize: 12,
    color: '#666',
  },
  sortOptionTextActive: {
    color: 'white',
  },
  notesList: {
    flex: 1,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  noteItem: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tag: {
    fontSize: 12,
    color: '#007AFF',
    marginRight: 8,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  blockchainButton: {
    backgroundColor: '#FF9500',
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

export default NotesListScreen;