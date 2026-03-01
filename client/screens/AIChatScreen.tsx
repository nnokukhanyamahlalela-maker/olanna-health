import React, { useState, useRef, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/components/ThemeProvider";
import { AppText } from "@/components/AppText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { Spacing, BorderRadius } from "@/constants/theme";

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

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm here to help you understand your body better. This is a demo response - in the full version, I'd provide personalized health guidance based on evidence-based information.",
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  }, [input, isLoading]);

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
});
