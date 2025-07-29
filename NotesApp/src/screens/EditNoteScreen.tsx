import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { updateNote, validateNote } from '../utils';
import StorageService from '../services/storageService';

type EditNoteScreenProp = StackNavigationProp<RootStackParamList, 'EditNote'>;
type EditNoteRouteProp = RouteProp<RootStackParamList, 'EditNote'>;

const EditNoteScreen: React.FC = () => {
  const navigation = useNavigation<EditNoteScreenProp>();
  const route = useRoute<EditNoteRouteProp>();
  const { noteId } = route.params;

  const [originalNote, setOriginalNote] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadNote = useCallback(async () => {
    try {
      const note = await StorageService.getNote(noteId);
      if (note) {
        setOriginalNote(note);
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags ? note.tags.join(', ') : '');
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

  const handleSave = async () => {
    if (!originalNote) return;

    const validation = validateNote(title, content);
    
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    try {
      setIsSaving(true);
      
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const updatedNote = updateNote(originalNote, title, content, tagsArray);
      await StorageService.saveNote(updatedNote);
      
      Alert.alert('Success', 'Note updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to update note:', error);
      Alert.alert('Error', 'Failed to update note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = 
      title !== originalNote?.title ||
      content !== originalNote?.content ||
      tags !== (originalNote?.tags ? originalNote.tags.join(', ') : '');

    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading note...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Note</Text>
        <TouchableOpacity
          style={[styles.headerButton, styles.saveButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={[styles.headerButtonText, styles.saveButtonText]}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter note title..."
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Content</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Write your note here..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={10000}
          />
          <Text style={styles.charCount}>{content.length}/10,000</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Tags (comma separated)</Text>
          <TextInput
            style={styles.tagsInput}
            placeholder="work, personal, important..."
            value={tags}
            onChangeText={setTags}
          />
          <Text style={styles.helpText}>
            Add tags to organize your notes. Separate multiple tags with commas.
          </Text>
        </View>

        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Preview Tags:</Text>
          <View style={styles.tagsPreview}>
            {tags
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0)
              .map((tag, index) => (
                <View key={index} style={styles.tagPreview}>
                  <Text style={styles.tagPreviewText}>#{tag}</Text>
                </View>
              ))}
          </View>
        </View>

        {originalNote && (
          <View style={styles.metadataContainer}>
            <Text style={styles.metadataTitle}>Note Information:</Text>
            <Text style={styles.metadataText}>
              Created: {originalNote.createdAt.toLocaleDateString()} at {originalNote.createdAt.toLocaleTimeString()}
            </Text>
            <Text style={styles.metadataText}>
              Last Updated: {originalNote.updatedAt.toLocaleDateString()} at {originalNote.updatedAt.toLocaleTimeString()}
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerButtonText: {
    color: 'white',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  saveButtonText: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  titleInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    fontSize: 16,
  },
  contentInput: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
  tagsInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    fontSize: 16,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  previewContainer: {
    marginBottom: 25,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tagsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagPreview: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagPreviewText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metadataContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
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
});

export default EditNoteScreen;