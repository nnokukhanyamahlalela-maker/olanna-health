import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import {
  SUPPORTED_LANGUAGES,
  getWelcomeMessage,
  getSafetyMessage,
  getThinkingMessage,
  getPlaceholder,
  getErrorMessage,
  getDisclaimer,
  containsSymptomKeywords,
  type SupportedLanguage,
} from "@/lib/languageDetection";
import {
  getCategoriesForLanguage,
  getFAQsForCategory,
  getAnswer,
  getUIText,
  type LanguageCode,
} from "@/lib/faqData";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const LANGUAGE_KEY = "olanna_selected_language";

const THEME_COLORS = {
  background: '#FFF7FA',
  primary: '#E85A9C',
  primaryLight: '#FBE3EC',
  text: '#3A2F35',
  textSecondary: '#7A6A73',
  border: '#F5E8ED',
  cardBackground: '#FFFFFF',
};

export default function AIChatScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const flatListRef = useRef<FlatList>(null);

  const [mode, setMode] = useState<"faq" | "chat">("faq");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("en");
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);
  const [faqAnswer, setFaqAnswer] = useState<{ answer: string; disclaimer: string } | null>(null);

  useEffect(() => {
    const loadStoredLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
          setSelectedLanguage(stored as SupportedLanguage);
        }
      } catch (e) {}
      setIsInitialized(true);
    };
    loadStoredLanguage();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      AsyncStorage.setItem(LANGUAGE_KEY, selectedLanguage).catch(() => {});
    }
  }, [selectedLanguage, isInitialized]);

  useEffect(() => {
    if (isInitialized && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: getWelcomeMessage(selectedLanguage),
        timestamp: new Date(),
      }]);
    }
  }, [isInitialized, selectedLanguage]);

  const handleLanguageChange = (langCode: SupportedLanguage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLanguage(langCode);
    setSelectedCategory(null);
    setSelectedFAQ(null);
    setFaqAnswer(null);
    setMessages([{
      id: "welcome-" + Date.now(),
      role: "assistant",
      content: getWelcomeMessage(langCode),
      timestamp: new Date(),
    }]);
  };

  const handleCategorySelect = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
    setSelectedFAQ(null);
    setFaqAnswer(null);
  };

  const handleFAQSelect = (faqId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFAQ(faqId);
    const result = getAnswer(faqId, selectedLanguage as LanguageCode);
    setFaqAnswer(result);
  };

  const handleBackToCategories = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(null);
    setSelectedFAQ(null);
    setFaqAnswer(null);
  };

  const handleBackToQuestions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFAQ(null);
    setFaqAnswer(null);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userText = inputText.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [userMessage, ...prev]);
    setInputText("");
    setIsLoading(true);

    try {
      const chatHistory = [...messages].reverse().map((m) => ({
        role: m.role,
        content: m.content,
      }));
      chatHistory.push({ role: "user", content: userText });

      const response = await fetch(new URL("/api/chat", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          selectedLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      let assistantContent = data.content;

      if (containsSymptomKeywords(userText)) {
        assistantContent += "\n\n" + getSafetyMessage(selectedLanguage);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [assistantMessage, ...prev]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getErrorMessage(selectedLanguage),
        timestamp: new Date(),
      };
      setMessages((prev) => [errorMessage, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        {!isUser ? (
          <View style={[styles.avatar, { backgroundColor: THEME_COLORS.primaryLight }]}>
            <Feather name="heart" size={16} color={THEME_COLORS.primary} />
          </View>
        ) : null}
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser ? THEME_COLORS.primaryLight : THEME_COLORS.cardBackground,
            },
          ]}
        >
          <ThemedText type="body" style={[styles.messageText, { color: THEME_COLORS.text }]}>
            {item.content}
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: THEME_COLORS.primaryLight }]}>
        <Feather name="message-circle" size={32} color={THEME_COLORS.primary} />
      </View>
      <ThemedText type="h3" style={[styles.emptyTitle, { color: THEME_COLORS.text }]}>
        {selectedLanguage === "en" ? "Ask Me Anything" : SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.greeting || "Hello"}
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyDescription, { color: THEME_COLORS.textSecondary }]}>
        {getWelcomeMessage(selectedLanguage).split("\n")[0]}
      </ThemedText>
    </View>
  );

  const categories = getCategoriesForLanguage(selectedLanguage as LanguageCode);
  const faqs = selectedCategory ? getFAQsForCategory(selectedCategory, selectedLanguage as LanguageCode) : [];

  const renderFAQMode = () => {
    if (faqAnswer) {
      return (
        <ScrollView 
          style={styles.faqScrollView}
          contentContainerStyle={styles.faqContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(300)}>
            <Pressable onPress={handleBackToQuestions} style={styles.backButton}>
              <Feather name="arrow-left" size={20} color={THEME_COLORS.primary} />
              <ThemedText style={[styles.backText, { color: THEME_COLORS.primary }]}>
                {selectedLanguage === "en" ? "Back to questions" : "←"}
              </ThemedText>
            </Pressable>
            
            <View style={[styles.answerCard, { backgroundColor: THEME_COLORS.cardBackground }]}>
              <View style={[styles.answerAvatar, { backgroundColor: THEME_COLORS.primaryLight }]}>
                <Feather name="heart" size={24} color={THEME_COLORS.primary} />
              </View>
              <ThemedText style={[styles.answerText, { color: THEME_COLORS.text }]}>
                {faqAnswer.answer}
              </ThemedText>
              <View style={styles.disclaimerBox}>
                <Feather name="alert-circle" size={14} color={THEME_COLORS.textSecondary} />
                <ThemedText style={[styles.disclaimerBoxText, { color: THEME_COLORS.textSecondary }]}>
                  {faqAnswer.disclaimer}
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      );
    }

    if (selectedCategory) {
      return (
        <ScrollView 
          style={styles.faqScrollView}
          contentContainerStyle={styles.faqContent}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={handleBackToCategories} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={THEME_COLORS.primary} />
            <ThemedText style={[styles.backText, { color: THEME_COLORS.primary }]}>
              {selectedLanguage === "en" ? "Back to topics" : "←"}
            </ThemedText>
          </Pressable>
          
          <ThemedText style={[styles.sectionTitle, { color: THEME_COLORS.text }]}>
            {getUIText("selectQuestion", selectedLanguage as LanguageCode) || "Select a question"}
          </ThemedText>
          
          {faqs.map((faq, index) => (
            <Animated.View key={faq.id} entering={FadeInDown.delay(index * 50).duration(300)}>
              <Pressable
                style={[styles.questionCard, { backgroundColor: THEME_COLORS.cardBackground, borderColor: THEME_COLORS.border }]}
                onPress={() => handleFAQSelect(faq.id)}
              >
                <ThemedText style={[styles.questionText, { color: THEME_COLORS.text }]}>
                  {faq.question}
                </ThemedText>
                <Feather name="chevron-right" size={20} color={THEME_COLORS.primary} />
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      );
    }

    return (
      <ScrollView 
        style={styles.faqScrollView}
        contentContainerStyle={styles.faqContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.sectionTitle, { color: THEME_COLORS.text }]}>
          {getUIText("selectTopic", selectedLanguage as LanguageCode) || "Select a topic"}
        </ThemedText>
        
        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <Animated.View key={category.id} entering={FadeInDown.delay(index * 50).duration(300)}>
              <Pressable
                style={[styles.categoryCard, { backgroundColor: THEME_COLORS.cardBackground, borderColor: THEME_COLORS.border }]}
                onPress={() => handleCategorySelect(category.id)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: THEME_COLORS.primaryLight }]}>
                  <Feather name={category.icon as any} size={24} color={THEME_COLORS.primary} />
                </View>
                <ThemedText style={[styles.categoryLabel, { color: THEME_COLORS.text }]}>
                  {category.label}
                </ThemedText>
              </Pressable>
            </Animated.View>
          ))}
        </View>
        
        <Pressable
          style={[styles.chatPromptButton, { backgroundColor: THEME_COLORS.primaryLight, borderColor: THEME_COLORS.primary }]}
          onPress={() => setMode("chat")}
        >
          <Feather name="message-circle" size={20} color={THEME_COLORS.primary} />
          <ThemedText style={[styles.chatPromptText, { color: THEME_COLORS.primary }]}>
            {getUIText("askCustom", selectedLanguage as LanguageCode) || "Ask a custom question"}
          </ThemedText>
        </Pressable>
      </ScrollView>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: THEME_COLORS.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.sm }]}>
        <View style={styles.disclaimerRow}>
          <Feather name="info" size={14} color={THEME_COLORS.textSecondary} />
          <ThemedText type="caption" style={[styles.disclaimerText, { color: THEME_COLORS.textSecondary }]}>
            {getDisclaimer(selectedLanguage)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.languageSection}>
        <ThemedText type="caption" style={[styles.languageLabel, { color: THEME_COLORS.textSecondary }]}>
          Select Language:
        </ThemedText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.languageScroll}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <Pressable
              key={lang.code}
              onPress={() => handleLanguageChange(lang.code)}
              style={[
                styles.languageChip,
                {
                  backgroundColor: selectedLanguage === lang.code 
                    ? THEME_COLORS.primary 
                    : THEME_COLORS.cardBackground,
                  borderColor: selectedLanguage === lang.code 
                    ? THEME_COLORS.primary 
                    : THEME_COLORS.border,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={[
                  styles.languageChipText,
                  {
                    color: selectedLanguage === lang.code 
                      ? "#FFFFFF"
                      : THEME_COLORS.text,
                  },
                ]}
              >
                {lang.nativeName}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.modeToggle}>
        <Pressable
          style={[
            styles.modeButton,
            { 
              backgroundColor: mode === "faq" ? THEME_COLORS.primary : "transparent",
              borderColor: THEME_COLORS.primary,
            }
          ]}
          onPress={() => setMode("faq")}
        >
          <Feather name="list" size={16} color={mode === "faq" ? "#FFFFFF" : THEME_COLORS.primary} />
          <ThemedText style={[styles.modeButtonText, { color: mode === "faq" ? "#FFFFFF" : THEME_COLORS.primary }]}>
            FAQ
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.modeButton,
            { 
              backgroundColor: mode === "chat" ? THEME_COLORS.primary : "transparent",
              borderColor: THEME_COLORS.primary,
            }
          ]}
          onPress={() => setMode("chat")}
        >
          <Feather name="message-circle" size={16} color={mode === "chat" ? "#FFFFFF" : THEME_COLORS.primary} />
          <ThemedText style={[styles.modeButtonText, { color: mode === "chat" ? "#FFFFFF" : THEME_COLORS.primary }]}>
            Chat
          </ThemedText>
        </Pressable>
      </View>

      {mode === "faq" ? (
        renderFAQMode()
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            inverted={messages.length > 0}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && styles.emptyList,
            ]}
            showsVerticalScrollIndicator={false}
          />

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <View style={[styles.loadingBubble, { backgroundColor: THEME_COLORS.cardBackground }]}>
                <ThemedText type="small" style={[styles.loadingText, { color: THEME_COLORS.textSecondary }]}>
                  {getThinkingMessage(selectedLanguage)}
                </ThemedText>
              </View>
            </View>
          ) : null}

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: THEME_COLORS.background,
                paddingBottom: insets.bottom + Spacing.sm,
              },
            ]}
          >
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: THEME_COLORS.cardBackground, borderColor: THEME_COLORS.border },
              ]}
            >
              <TextInput
                style={[styles.input, { color: THEME_COLORS.text }]}
                placeholder={getPlaceholder(selectedLanguage)}
                placeholderTextColor={THEME_COLORS.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              <Pressable
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
                style={({ pressed }) => [
                  styles.sendButton,
                  {
                    backgroundColor: inputText.trim() ? THEME_COLORS.primary : THEME_COLORS.primaryLight,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather
                  name="send"
                  size={18}
                  color={inputText.trim() ? "#FFFFFF" : THEME_COLORS.textSecondary}
                />
              </Pressable>
            </View>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  disclaimerRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.xs,
  },
  disclaimerText: {
    flex: 1,
    opacity: 0.7,
  },
  languageSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  languageLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  languageScroll: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  languageChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  languageChipText: {
    fontWeight: "500",
  },
  modeToggle: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  modeButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  faqScrollView: {
    flex: 1,
  },
  faqContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  categoriesGrid: {
    gap: Spacing.md,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  backText: {
    fontSize: 14,
    fontWeight: "500",
  },
  questionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  answerCard: {
    padding: Spacing.xl,
    borderRadius: 20,
    ...Shadows.md,
  },
  answerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  answerText: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: Spacing.lg,
  },
  disclaimerBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
  },
  disclaimerBoxText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  chatPromptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: 30,
    borderWidth: 1,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  chatPromptText: {
    fontSize: 15,
    fontWeight: "600",
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing["2xl"],
    gap: Spacing.md,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptyDescription: {
    textAlign: "center",
    opacity: 0.7,
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  assistantMessage: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  messageText: {
    lineHeight: 22,
  },
  loadingContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  loadingBubble: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  loadingText: {
    opacity: 0.7,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
