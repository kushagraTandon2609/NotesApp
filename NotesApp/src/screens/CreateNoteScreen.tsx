import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { createNote, validateNote } from '../utils';
import StorageService from '../services/storageService';

type CreateNoteScreenProp = StackNavigationProp<RootStackParamList, 'CreateNote'>;

const CreateNoteScreen: React.FC = () => {
  const navigation = useNavigation<CreateNoteScreenProp>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
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

      const note = createNote(title, content, tagsArray);
      await StorageService.saveNote(note);
      
      Alert.alert('Success', 'Note created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to save note:', error);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Note</Text>
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
            autoFocus
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginTop: 10,
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
});

export default CreateNoteScreen;