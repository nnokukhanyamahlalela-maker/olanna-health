import React, { useState, useRef, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, Platform, ScrollView } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/components/ThemeProvider";
import { AppText } from "@/components/AppText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { PROMPTS, Prompt } from "@/constants/promptCatalog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Sawubona! I'm your health assistant. How can I help you today? I can answer questions about your cycle, symptoms, or general reproductive health.",
};

export default function AIChatScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const showChips = messages.length <= 1;

  const sendText = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm here to help you understand your body better. This is a demo response - in the full version, I'd provide personalised health guidance based on evidence-based information.",
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  }, [isLoading]);

  const sendMessage = useCallback(() => {
    sendText(input);
  }, [input, sendText]);

  const handlePromptPick = useCallback((prompt: Prompt) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    sendText(prompt.userFacing);
  }, [sendText]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
        {isUser ? (
          <View style={[
            styles.messageBubble,
            { backgroundColor: theme.accent as string },
          ]}>
            <AppText variant="body" color="#FFFFFF">
              {item.content}
            </AppText>
          </View>
        ) : (
          <GlassSurface
            borderRadius={18}
            padding={0}
            noPadding
            noShadow
            style={styles.messageBubble}
          >
            <View style={styles.messageBubbleInner}>
              <AppText variant="body" color={theme.textPrimary as string}>
                {item.content}
              </AppText>
            </View>
          </GlassSurface>
        )}
      </View>
    );
  }, [theme]);

  return (
    <AppGradient style={styles.container}>
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
      >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: Spacing.lg, paddingBottom: Spacing.lg }
        ]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {showChips ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          keyboardShouldPersistTaps="handled"
        >
          {PROMPTS.map((prompt) => (
            <Pressable
              key={prompt.id}
              testID={`chip-${prompt.id}`}
              onPress={() => handlePromptPick(prompt)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.10)"
                    : "rgba(255,255,255,0.55)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(0,0,0,0.08)",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <AppText
                variant="caption"
                style={[styles.chipText, { color: theme.textPrimary as string }]}
              >
                {prompt.title}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <GlassSurface
        borderRadius={0}
        noPadding
        noShadow={false}
        style={[
          styles.inputContainer,
          { paddingBottom: insets.bottom + Spacing.md }
        ]}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                color: theme.textPrimary as string,
              }
            ]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything..."
            placeholderTextColor={theme.textTertiary as string}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <Pressable
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
            style={[
              styles.sendButton,
              { backgroundColor: theme.accent as string },
              (!input.trim() || isLoading) && { opacity: 0.5 }
            ]}
          >
            <Feather name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </GlassSurface>
      </KeyboardAvoidingView>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
  },
  messageRow: {
    marginVertical: Spacing.xs,
    maxWidth: "80%",
  },
  messageRowUser: {
    alignSelf: "flex-end",
  },
  messageRowAssistant: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  messageBubbleInner: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  inputContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  chipsContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    letterSpacing: 0.1,
  },
});
