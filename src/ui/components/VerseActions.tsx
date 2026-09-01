import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Verse, HighlightColor, NoteKind } from '@/domain/models';
import { useUserDatabase } from '@/infrastructure/persistence/useUserDatabase';
import { getTheme, spacing, typography } from '@/ui/theme';

interface VerseActionsProps {
  verse: Verse;
  visible: boolean;
  onClose: () => void;
  onActionComplete?: () => void;
}

const HIGHLIGHT_COLORS: { color: HighlightColor; label: string }[] = [
  { color: 'yellow', label: 'Yellow' },
  { color: 'green', label: 'Green' },
  { color: 'blue', label: 'Blue' },
  { color: 'pink', label: 'Pink' },
  { color: 'purple', label: 'Purple' },
];

export function VerseActions({ verse, visible, onClose, onActionComplete }: VerseActionsProps) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const { bookmarkRepository, highlightRepository, notesRepository } = useUserDatabase();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteKind, setNoteKind] = useState<NoteKind>(NoteKind.Reflection);
  const [noteText, setNoteText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState<HighlightColor | undefined>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    async function loadVerseState() {
      try {
        const bookmarked = await bookmarkRepository.isBookmarked(verse.ref);
        const highlight = await highlightRepository.getHighlight(verse.ref);
        setIsBookmarked(bookmarked);
        setCurrentHighlight(highlight?.color);
      } catch (error) {
        console.error('Failed to load verse state:', error);
      }
    }

    if (visible) {
      loadVerseState();
    }
  }, [verse.ref, visible, bookmarkRepository, highlightRepository]);

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        // Find and remove existing bookmark
        const bookmarks = await bookmarkRepository.getAllBookmarks();
        const existing = bookmarks.find(
          (b) =>
            b.verseRef.book === verse.ref.book &&
            b.verseRef.chapter === verse.ref.chapter &&
            b.verseRef.verse === verse.ref.verse
        );
        if (existing) {
          await bookmarkRepository.removeBookmark(existing.id);
          setIsBookmarked(false);
          showConfirmationMessage('Bookmark removed');
        }
      } else {
        await bookmarkRepository.addBookmark(verse.ref);
        setIsBookmarked(true);
        showConfirmationMessage('Bookmarked');
      }
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleHighlight = async (color: HighlightColor) => {
    try {
      if (currentHighlight === color) {
        // Remove highlight if same color tapped
        const highlights = await highlightRepository.getAllHighlights();
        const existing = highlights.find(
          (h) =>
            h.verseRef.book === verse.ref.book &&
            h.verseRef.chapter === verse.ref.chapter &&
            h.verseRef.verse === verse.ref.verse
        );
        if (existing) {
          await highlightRepository.removeHighlight(existing.id);
          setCurrentHighlight(undefined);
          showConfirmationMessage('Highlight removed');
        }
      } else {
        await highlightRepository.setHighlight(verse.ref, color);
        setCurrentHighlight(color);
        showConfirmationMessage('Highlighted');
      }
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to highlight:', error);
    }
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;

    try {
      await notesRepository.createNote({
        kind: noteKind,
        content: noteText,
        verseRef: verse.ref,
      });
      setNoteText('');
      setShowNoteInput(false);
      showConfirmationMessage(noteKind === NoteKind.Prayer ? 'Prayer saved' : 'Reflection saved');
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const openNoteInput = (kind: NoteKind) => {
    setNoteKind(kind);
    setShowNoteInput(true);
  };

  const showConfirmationMessage = (message: string) => {
    setConfirmationMessage(message);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setTimeout(onClose, 200);
    }, 1500);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.sheet, { backgroundColor: theme.background }]}
          >
            <ScrollView contentContainerStyle={styles.content}>
              {/* Verse reference */}
              <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Text style={[styles.reference, { color: theme.text }]}>
                  {verse.ref.book} {verse.ref.chapter}:{verse.ref.verse}
                </Text>
                <Text style={[styles.verseText, { color: theme.textSecondary }]}>{verse.text}</Text>
              </View>

              {!showNoteInput && !showConfirmation && (
                <View style={styles.actions}>
                  {/* Bookmark */}
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        borderColor: theme.border,
                        backgroundColor: isBookmarked ? theme.primary : 'transparent',
                      },
                    ]}
                    onPress={handleBookmark}
                  >
                    <Text
                      style={[styles.actionText, { color: isBookmarked ? '#FFFFFF' : theme.text }]}
                    >
                      {isBookmarked ? 'Bookmarked ✓' : 'Bookmark'}
                    </Text>
                  </TouchableOpacity>

                  {/* Highlights */}
                  <View style={styles.highlightSection}>
                    <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                      Highlight
                    </Text>
                    <View style={styles.highlightColors}>
                      {HIGHLIGHT_COLORS.map(({ color, label }) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorButton,
                            {
                              backgroundColor: getHighlightColorValue(color),
                              borderColor:
                                currentHighlight === color ? theme.primary : 'rgba(0, 0, 0, 0.1)',
                              borderWidth: currentHighlight === color ? 3 : 2,
                            },
                          ]}
                          onPress={() => handleHighlight(color)}
                          accessibilityLabel={`Highlight ${label}`}
                        />
                      ))}
                    </View>
                  </View>

                  {/* Note actions */}
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: theme.border }]}
                    onPress={() => openNoteInput(NoteKind.Reflection)}
                  >
                    <Text style={[styles.actionText, { color: theme.text }]}>
                      Save as reflection
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: theme.border }]}
                    onPress={() => openNoteInput(NoteKind.Prayer)}
                  >
                    <Text style={[styles.actionText, { color: theme.text }]}>Save as prayer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: theme.border }]}
                    onPress={() => openNoteInput(NoteKind.Reflection)}
                  >
                    <Text style={[styles.actionText, { color: theme.text }]}>Add note</Text>
                  </TouchableOpacity>
                </View>
              )}

              {showNoteInput && !showConfirmation && (
                <View style={styles.noteInput}>
                  <Text style={[styles.noteLabel, { color: theme.text }]}>
                    {noteKind === NoteKind.Prayer ? 'Your prayer' : 'Your reflection'}
                  </Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                    placeholder={
                      noteKind === NoteKind.Prayer
                        ? 'Write your prayer...'
                        : 'Write your reflection...'
                    }
                    placeholderTextColor={theme.textSecondary}
                    value={noteText}
                    onChangeText={setNoteText}
                    multiline
                    textAlignVertical="top"
                    autoFocus
                  />
                  <View style={styles.noteActions}>
                    <TouchableOpacity
                      style={[
                        styles.noteButton,
                        { backgroundColor: noteText.trim() ? theme.primary : theme.border },
                      ]}
                      onPress={handleSaveNote}
                      disabled={!noteText.trim()}
                    >
                      <Text
                        style={[
                          styles.noteButtonText,
                          { color: noteText.trim() ? '#FFFFFF' : theme.textSecondary },
                        ]}
                      >
                        Save
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.noteButton,
                        {
                          backgroundColor: 'transparent',
                          borderWidth: 1,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => {
                        setShowNoteInput(false);
                        setNoteText('');
                      }}
                    >
                      <Text style={[styles.noteButtonText, { color: theme.text }]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {showConfirmation && (
                <View style={styles.confirmation}>
                  <Text style={[styles.confirmationText, { color: theme.text }]}>
                    {confirmationMessage}
                  </Text>
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

function getHighlightColorValue(color: HighlightColor): string {
  switch (color) {
    case 'yellow':
      return '#FEF3C7';
    case 'green':
      return '#D1FAE5';
    case 'blue':
      return '#DBEAFE';
    case 'pink':
      return '#FCE7F3';
    case 'purple':
      return '#EDE9FE';
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    marginBottom: spacing.lg,
  },
  reference: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  verseText: {
    ...typography.body,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
  },
  actionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionText: {
    ...typography.body,
    fontWeight: '500',
  },
  highlightSection: {
    paddingVertical: spacing.sm,
  },
  sectionLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  highlightColors: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  noteInput: {
    gap: spacing.md,
  },
  noteLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  input: {
    ...typography.body,
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
  },
  noteActions: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  noteButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  noteButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  confirmation: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  confirmationText: {
    ...typography.title,
    fontSize: 20,
  },
});
