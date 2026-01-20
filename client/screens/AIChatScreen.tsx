import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import {
  detectLanguage,
  languageLabel,
  getSafetyMessage,
  containsSymptomKeywords,
  getWelcomeMessage,
  type LanguageMode,
  type DetectedLanguage,
} from "@/lib/languageDetection";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const LANGUAGE_MODE_KEY = "olanna_language_mode";

export default function AIChatScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [languageMode, setLanguageMode] = useState<LanguageMode>("auto");
  const [lastDetectedLang, setLastDetectedLang] = useState<DetectedLanguage>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadStoredMode = async () => {
      try {
        const v = await AsyncStorage.getItem(LANGUAGE_MODE_KEY);
        if (v === "en" || v === "zu" || v === "auto") {
          setLanguageMode(v);
        }
      } catch (e) {}
      setIsInitialized(true);
    };
    loadStoredMode();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      AsyncStorage.setItem(LANGUAGE_MODE_KEY, languageMode).catch(() => {});
    }
  }, [languageMode, isInitialized]);

  useEffect(() => {
    if (messages.length === 0) {
      const lang = languageMode === "auto" ? lastDetectedLang : languageMode === "zu" ? "zu" : "en";
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: getWelcomeMessage(lang),
        timestamp: new Date(),
      }]);
    }
  }, [languageMode]);

  const cycleLanguageMode = () => {
    const modes: LanguageMode[] = ["auto", "en", "zu"];
    const nextMode = modes[(modes.indexOf(languageMode) + 1) % modes.length];
    setLanguageMode(nextMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userText = inputText.trim();
    const detected = detectLanguage(userText, lastDetectedLang);
    setLastDetectedLang(detected);

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
          languageMode,
          detectedLanguage: detected,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      let assistantContent = data.content;

      const replyLang = languageMode === "auto" ? detected : languageMode === "zu" ? "zu" : "en";
      if (containsSymptomKeywords(userText, replyLang)) {
        assistantContent += "\n\n" + getSafetyMessage(replyLang);
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
        content: languageMode === "zu" || (languageMode === "auto" && detected === "zu")
          ? "Ngiyaxolisa, kunenkinga. Sicela uzame futhi."
          : "I'm sorry, there was an issue. Please try again.",
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
          <View style={[styles.avatar, { backgroundColor: theme.primary + "20" }]}>
            <Feather name="heart" size={16} color={theme.primary} />
          </View>
        ) : null}
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser ? theme.primary : theme.backgroundDefault,
            },
          ]}
        >
          <ThemedText
            type="body"
            style={[
              styles.messageText,
              { color: isUser ? theme.buttonText : theme.text },
            ]}
          >
            {item.content}
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.primary + "20" }]}>
        <Feather name="message-circle" size={32} color={theme.primary} />
      </View>
      <ThemedText type="h3" style={styles.emptyTitle}>
        {languageMode === "zu" ? "Buza Noma Yini" : "Ask Me Anything"}
      </ThemedText>
      <ThemedText type="body" style={styles.emptyDescription}>
        {languageMode === "zu"
          ? "Lapha ukusiza ngemibuzo mayelana nempilo yabesifazane, ukuzala, PCOS, endometriosis, nokunye."
          : "I'm here to help with questions about menstrual health, fertility, PCOS, endometriosis, and more."}
      </ThemedText>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.sm }]}>
        <View style={styles.disclaimerRow}>
          <Feather name="info" size={14} color={theme.textSecondary} />
          <ThemedText type="caption" style={styles.disclaimerText}>
            {languageMode === "zu" || (languageMode === "auto" && lastDetectedLang === "zu")
              ? "Lo msizi we-AI unikeza ulwazi olujwayelekile kuphela."
              : "This AI provides general health information only."}
          </ThemedText>
        </View>
        
        <Pressable
          onPress={cycleLanguageMode}
          style={[styles.languageToggle, { backgroundColor: theme.primary + "15" }]}
        >
          <Feather name="globe" size={14} color={theme.primary} />
          <ThemedText type="caption" style={[styles.languageText, { color: theme.primary }]}>
            {languageLabel(languageMode, lastDetectedLang)}
          </ThemedText>
        </Pressable>
      </View>

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
          <View style={[styles.loadingBubble, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="small" style={styles.loadingText}>
              {languageMode === "zu" || (languageMode === "auto" && lastDetectedLang === "zu")
                ? "Ngicabanga..."
                : "Thinking..."}
            </ThemedText>
          </View>
        </View>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.sm,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder={
              languageMode === "zu" || (languageMode === "auto" && lastDetectedLang === "zu")
                ? "Buza umbuzo wezempilo..."
                : "Ask a health question..."
            }
            placeholderTextColor={theme.textSecondary}
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
                backgroundColor: inputText.trim() ? theme.primary : theme.backgroundSecondary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather
              name="send"
              size={18}
              color={inputText.trim() ? theme.buttonText : theme.textSecondary}
            />
          </Pressable>
        </View>
      </View>
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
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
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
  languageToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  languageText: {
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
