# Secure Notes App with Blockchain Integration

A React Native notes application for Android featuring AES-256 encryption and blockchain technology for data integrity and security.

## Features

### 🔐 Security & Encryption
- **AES-256 Encryption**: All notes are encrypted before storage using industry-standard AES-256 encryption
- **Local Storage Security**: Notes are stored encrypted on device using AsyncStorage
- **Data Integrity**: SHA-256 hashing for data verification

### ⛓️ Blockchain Integration
- **Proof-of-Work**: Simple blockchain implementation with mining
- **Data Immutability**: Notes added to blockchain cannot be altered
- **Chain Validation**: Automatic blockchain integrity verification
- **Block Explorer**: View blockchain statistics and note blocks

### 📱 Core Functionality
- **Create Notes**: Rich text editor with title, content, and tags
- **Edit Notes**: Modify existing notes with change tracking
- **View Notes**: Beautiful note viewer with metadata
- **Search & Filter**: Find notes by title, content, or tags
- **Sort Options**: Sort by title, creation date, or last modified
- **Share Notes**: Export notes via device sharing
- **Tags System**: Organize notes with custom tags

### 🎨 User Interface
- **Material Design**: Modern, intuitive UI following Android design principles
- **Dark Mode Ready**: Clean interface with proper contrast
- **Responsive Layout**: Optimized for various screen sizes
- **Smooth Navigation**: Stack navigation with gesture support

## Technology Stack

- **React Native 0.80.2**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **React Navigation**: Screen navigation and routing
- **AsyncStorage**: Local data persistence
- **CryptoJS**: Cryptographic functions for AES-256 and SHA-256

## Project Structure

```
NotesApp/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens
│   │   ├── NotesListScreen.tsx
│   │   ├── CreateNoteScreen.tsx
│   │   ├── EditNoteScreen.tsx
│   │   └── ViewNoteScreen.tsx
│   ├── services/           # Business logic services
│   │   ├── encryptionService.ts
│   │   ├── storageService.ts
│   │   └── blockchainService.ts
│   ├── types/              # TypeScript interfaces
│   │   └── index.ts
│   └── utils/              # Helper functions
│       └── index.ts
├── android/                # Android-specific code
├── App.tsx                 # Main application component
└── package.json           # Dependencies and scripts
```

## Installation & Setup

### Prerequisites
- Node.js (>= 18)
- React Native development environment
- Android Studio and SDK
- Java Development Kit (JDK)

### Installation Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd NotesApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Metro bundler**
   ```bash
   npm start
   ```

4. **Run on Android**
   ```bash
   npm run android
   ```

### Development Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Build and run on Android device/emulator
- `npm run ios` - Build and run on iOS device/simulator
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Security Features

### AES-256 Encryption
The app implements industry-standard AES-256 encryption for all notes:

```typescript
// Example encryption process
const noteData = JSON.stringify({
  title: note.title,
  content: note.content,
  tags: note.tags,
});

const encrypted = CryptoJS.AES.encrypt(noteData, ENCRYPTION_KEY).toString();
```

### Blockchain Integration
Notes can be added to a simple blockchain for immutability:

```typescript
// Blockchain mining process
const newBlock = {
  id: note.id,
  hash: '',
  previousHash: previousBlock.hash,
  timestamp: Date.now(),
  data: encryptedNote,
  nonce: 0,
};

// Mine block with proof-of-work
while (!block.hash.startsWith('00')) {
  block.nonce++;
  block.hash = calculateHash(block);
}
```

## Usage Guide

### Creating Notes
1. Tap the "+" button on the home screen
2. Enter a title and content
3. Add optional tags (comma-separated)
4. Tap "Save" to create the note

### Encryption
- All notes are automatically encrypted before storage
- Decryption happens transparently when viewing notes
- No user action required for encryption/decryption

### Blockchain Features
1. **Add to Blockchain**: Tap the chain icon on any note
2. **View Stats**: Tap the chain icon in the header
3. **Verify Integrity**: Blockchain validation runs automatically

### Search & Organization
- Use the search bar to find notes
- Filter by tags by tapping tag names
- Sort notes by different criteria
- Pull down to refresh the notes list

## Security Considerations

### Encryption Key Management
- Currently uses a hardcoded key for demonstration
- In production, implement:
  - User-generated passwords
  - Device-specific key derivation
  - Secure key storage (Android Keystore)

### Blockchain Limitations
- This is a simple, local blockchain implementation
- For production use, consider:
  - Distributed blockchain networks
  - Consensus mechanisms
  - Network synchronization

### Data Privacy
- All data stored locally on device
- No cloud synchronization (by design)
- Users have full control over their data

## API Documentation

### EncryptionService
```typescript
// Encrypt a note
EncryptionService.encryptNote(note: Note): EncryptedNote

// Decrypt a note
EncryptionService.decryptNote(encryptedNote: EncryptedNote): Note

// Generate hash for integrity
EncryptionService.generateHash(data: string): string
```

### StorageService
```typescript
// Save notes to local storage
StorageService.saveNotes(notes: Note[]): Promise<void>

// Load notes from storage
StorageService.loadNotes(): Promise<Note[]>

// Save individual note
StorageService.saveNote(note: Note): Promise<void>
```

### BlockchainService
```typescript
// Add note to blockchain
BlockchainService.addNoteToBlockchain(encryptedNote: EncryptedNote): BlockchainNote

// Validate blockchain integrity
BlockchainService.validateChain(): boolean

// Get blockchain statistics
BlockchainService.getBlockchainStats(): Object
```

## Testing

### Manual Testing Checklist
- [ ] Create new notes
- [ ] Edit existing notes
- [ ] Delete notes
- [ ] Search functionality
- [ ] Tag filtering
- [ ] Note encryption/decryption
- [ ] Blockchain operations
- [ ] App persistence after restart

### Automated Testing
```bash
npm test
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build errors**
   ```bash
   cd android && ./gradlew clean && cd ..
   npm run android
   ```

3. **Dependency issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Future Enhancements

### Security Improvements
- [ ] Biometric authentication
- [ ] Key derivation from user password
- [ ] Secure key storage
- [ ] End-to-end encryption for sharing

### Blockchain Features
- [ ] Distributed blockchain network
- [ ] Consensus mechanisms
- [ ] Smart contracts for notes
- [ ] Cross-device synchronization

### User Experience
- [ ] Rich text editor
- [ ] Image attachments
- [ ] Voice notes
- [ ] Export/import functionality
- [ ] Backup and restore

### Performance
- [ ] Lazy loading for large note collections
- [ ] Background encryption/decryption
- [ ] Optimized blockchain operations
- [ ] Caching strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational and demonstration purposes. Please ensure compliance with local regulations regarding encryption software.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the project documentation
3. Create an issue with detailed description

---

**Note**: This is a demonstration app showcasing encryption and blockchain concepts. For production use, additional security measures and testing are required.
