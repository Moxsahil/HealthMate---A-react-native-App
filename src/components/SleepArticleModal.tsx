import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface Article {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  readTime: string;
  content: string;
}

interface SleepArticleModalProps {
  visible: boolean;
  onClose: () => void;
  article: Article | null;
}

const SleepArticleModal: React.FC<SleepArticleModalProps> = ({
  visible,
  onClose,
  article,
}) => {
  const { colors } = useTheme();

  if (!article) return null;

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '90%',
      paddingTop: 20,
    },
    header: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      position: 'absolute',
      top: 0,
      right: 20,
      padding: 8,
      zIndex: 10,
    },
    articleIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 16,
    },
    articleEmoji: {
      fontSize: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    readTime: {
      fontSize: 14,
      color: colors.primary,
      textAlign: 'center',
    },
    content: {
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    contentText: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
    },
    sectionHeading: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginTop: 20,
      marginBottom: 12,
    },
    bulletPoint: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
      marginLeft: 16,
      marginBottom: 8,
    },
  });

  const renderContent = () => {
    // Split content by sections (separated by ##)
    const sections = article.content.split('##').filter(s => s.trim());

    return sections.map((section, index) => {
      const lines = section.trim().split('\n').filter(l => l.trim());
      const heading = lines[0];
      const content = lines.slice(1);

      return (
        <View key={index}>
          {heading && <Text style={styles.sectionHeading}>{heading}</Text>}
          {content.map((line, lineIndex) => {
            if (line.trim().startsWith('-')) {
              return (
                <Text key={lineIndex} style={styles.bulletPoint}>
                  • {line.trim().substring(1).trim()}
                </Text>
              );
            }
            return (
              <Text key={lineIndex} style={styles.contentText}>
                {line.trim()}
              </Text>
            );
          })}
        </View>
      );
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <View style={styles.articleIcon}>
                <Text style={styles.articleEmoji}>{article.image}</Text>
              </View>
              <Text style={styles.title}>{article.title}</Text>
              <Text style={styles.subtitle}>{article.subtitle}</Text>
              <Text style={styles.readTime}>{article.readTime}</Text>
            </View>

            <View style={styles.content}>
              {renderContent()}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default SleepArticleModal;
