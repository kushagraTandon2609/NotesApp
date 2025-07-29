/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './src/types';

// Import screens
import NotesListScreen from './src/screens/NotesListScreen';
import CreateNoteScreen from './src/screens/CreateNoteScreen';
import EditNoteScreen from './src/screens/EditNoteScreen';
import ViewNoteScreen from './src/screens/ViewNoteScreen';

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      <Stack.Navigator
        initialRouteName="NotesList"
        screenOptions={{
          headerShown: false, // We'll use custom headers
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="NotesList" component={NotesListScreen} />
        <Stack.Screen name="CreateNote" component={CreateNoteScreen} />
        <Stack.Screen name="EditNote" component={EditNoteScreen} />
        <Stack.Screen name="ViewNote" component={ViewNoteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
