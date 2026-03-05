import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, Platform, ScrollView } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withDelay, withSequence, Easing } from "react-native-reanimated";
import { useTheme } from "@/components/ThemeProvider";
import { AppText } from "@/components/AppText";
import { AppGradient } from "@/components/AppGradient";
import { GlassSurface } from "@/components/GlassSurface";
import { MarkdownText } from "@/components/MarkdownText";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { PROMPTS, Prompt } from "@/constants/promptCatalog";
import { getApiUrl } from "@/lib/query-client";
import { storage, calculateCycleData } from "@/lib/storage";
import { getPhaseForDay } from "@/constants/phaseConfig";
import { useNavigation } from "@react-navigation/native";
import { HeaderButton } from "@react-navigation/elements";

interface Message {
  id: string;
  role: "user" | "assistant" | "typing";
  content: string;
  timestamp?: number;
}

function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.typingDot, animatedStyle]} />;
}

function TypingIndicator() {
  return (
    <View style={[styles.messageRow, styles.messageRowAssistant]}>
      <GlassSurface
        borderRadius={18}
        padding={0}
        noPadding
        noShadow
        style={styles.assistantBubble}
      >
        <View style={styles.typingBubbleInner}>
          <TypingDot delay={0} />
          <TypingDot delay={200} />
          <TypingDot delay={400} />
        </View>
      </GlassSurface>
    </View>
  );
}

const TYPING_MESSAGE: Message = {
  id: "__typing__",
  role: "typing",
  content: "",
};

function formatTime(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const WELCOME_ID = "welcome";

interface UserContext {
  cycleDay: number;
  averageCycleLength: number;
  phase: string;
  symptoms: string[];
  bleedingLevel: string;
  painScore: number;
  onHormonalContraception: boolean;
  tryingToConceive: boolean;
}

async function buildUserContext(): Promise<UserContext> {
  try {
    const profile = await storage.getUserProfile();
    const dailyLogs = await storage.getDailyLogs();
    const today = new Date().toISOString().split("T")[0];
    const todayLog = dailyLogs.find((l) => l.date === today);

    let cycleDay = 14;
    let cycleLength = 28;

    if (profile) {
      cycleLength = profile.cycleLength || 28;
      const cycleData = calculateCycleData(profile);
      cycleDay = cycleData.currentDay;
    }

    const periodLen = profile?.periodLength || 5;
    const phase = getPhaseForDay(cycleDay, cycleLength, periodLen);
    const phaseLabels: Record<string, string> = {
      menstrual: "Menstrual",
      follicular: "Follicular",
      ovulation: "Ovulatory",
      luteal: "Luteal",
    };

    return {
      cycleDay,
      averageCycleLength: cycleLength,
      phase: phaseLabels[phase] || "Unknown",
      symptoms: todayLog?.symptoms || [],
      bleedingLevel: todayLog?.flow || "none",
      painScore: 0,
      onHormonalContraception: false,
      tryingToConceive: false,
    };
  } catch {
    return {
      cycleDay: 14,
      averageCycleLength: 28,
      phase: "Unknown",
      symptoms: [],
      bleedingLevel: "none",
      painScore: 0,
      onHormonalContraception: false,
      tryingToConceive: false,
    };
  }
}

export default function AIChatScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");

  const makeWelcomeMessage = useCallback((name: string): Message => ({
    id: WELCOME_ID,
    role: "assistant",
    content: name
      ? `Sawubona, ${name}! I'm Olanna, your health companion. I'm here to help with questions about your cycle, symptoms, or reproductive health. What's on your mind?`
      : "Sawubona! I'm Olanna, your health companion. I'm here to help with questions about your cycle, symptoms, or reproductive health. What's on your mind?",
    timestamp: Date.now(),
  }), []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const userContextRef = useRef<UserContext | null>(null);

  const showChips = messages.length <= 1;

  useEffect(() => {
    buildUserContext().then((ctx) => {
      userContextRef.current = ctx;
    });
    storage.getUserProfile().then((profile) => {
      const name = profile?.name || "";
      setUserName(name);
      setMessages([makeWelcomeMessage(name)]);
    }).catch(() => {
      setMessages([makeWelcomeMessage("")]);
    });
  }, [makeWelcomeMessage]);

  const resetChat = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setMessages([makeWelcomeMessage(userName)]);
    setInput("");
    setIsLoading(false);
  }, [userName, makeWelcomeMessage]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton onPress={resetChat} testID="button-new-chat">
          <Feather name="edit" size={20} color={theme.text as string} />
        </HeaderButton>
      ),
    });
  }, [navigation, resetChat, theme]);

  const callAssistant = useCallback(
    async (promptId: string | null, freeText: string | null, currentMessages: Message[]) => {
      setIsLoading(true);
      try {
        const ctx = userContextRef.current || (await buildUserContext());
        const baseUrl = getApiUrl();
        const url = new URL("/api/assistant", baseUrl);

        const historyMessages = currentMessages
          .filter((m) => m.id !== WELCOME_ID && m.role !== "typing")
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            promptId,
            freeText,
            userContext: ctx,
            history: historyMessages,
          }),
        });

        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Sorry, I could not respond right now. Please try again in a moment.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const sendText = useCallback(
    async (text: string, promptId?: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };

      let updatedMessages: Message[] = [];
      setMessages((prev) => {
        updatedMessages = [...prev, userMessage];
        return updatedMessages;
      });
      setInput("");

      await callAssistant(promptId || null, promptId ? null : text.trim(), updatedMessages);
    },
    [isLoading, callAssistant]
  );

  const sendMessage = useCallback(() => {
    sendText(input);
  }, [input, sendText]);

  const handlePromptPick = useCallback(
    (prompt: Prompt) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      sendText(prompt.userFacing, prompt.id);
    },
    [sendText]
  );

  const chatData = isLoading
    ? [...messages, TYPING_MESSAGE]
    : messages;

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    if (item.role === "typing") {
      return <TypingIndicator />;
    }
    const isUser = item.role === "user";
    const isWelcome = item.id === WELCOME_ID;

    return (
      <View style={styles.messageWrapper}>
        <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
          {isUser ? (
            <LinearGradient
              colors={["#E83E8C", "#D633A6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.userBubble}
            >
              <AppText variant="body" color="#FFFFFF" style={styles.userBubbleText}>
                {item.content}
              </AppText>
            </LinearGradient>
          ) : isWelcome ? (
            <GlassSurface
              borderRadius={20}
              padding={0}
              noPadding
              noShadow
              style={styles.welcomeBubble}
            >
              <View style={styles.welcomeInner}>
                <View style={styles.welcomeHeader}>
                  <View style={styles.welcomeIconWrap}>
                    <Feather name="heart" size={16} color="#E83E8C" />
                  </View>
                  <AppText variant="caption" style={[styles.welcomeName, { color: theme.textSecondary as string }]}>
                    Olanna Health
                  </AppText>
                </View>
                <MarkdownText color={theme.textPrimary as string}>
                  {item.content}
                </MarkdownText>
              </View>
            </GlassSurface>
          ) : (
            <GlassSurface
              borderRadius={18}
              padding={0}
              noPadding
              noShadow
              style={styles.assistantBubble}
            >
              <View style={styles.messageBubbleInner}>
                <MarkdownText color={theme.textPrimary as string}>
                  {item.content}
                </MarkdownText>
              </View>
            </GlassSurface>
          )}
        </View>
        {item.timestamp ? (
          <AppText
            variant="caption"
            style={[
              styles.timestamp,
              isUser ? styles.timestampUser : styles.timestampAssistant,
              { color: theme.textTertiary as string },
            ]}
          >
            {formatTime(item.timestamp)}
          </AppText>
        ) : null}
      </View>
    );
  }, [theme]);

  return (
    <AppGradient style={styles.container}>
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          inverted={chatData.length > 0}
          data={chatData.toReversed()}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          ListEmptyComponent={<View style={styles.emptyState} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: Spacing.md, paddingBottom: headerHeight + Spacing.md },
          ]}
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
                <Feather
                  name={prompt.icon}
                  size={14}
                  color={isDark ? "rgba(255,255,255,0.7)" : "#E83E8C"}
                  style={styles.chipIcon}
                />
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
                  fontFamily: Fonts.body,
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
              testID="input-chat-message"
            />
            <Pressable
              onPress={sendMessage}
              disabled={!input.trim() || isLoading}
              style={[
                styles.sendButton,
                (!input.trim() || isLoading) && { opacity: 0.4 },
              ]}
              testID="button-send-message"
            >
              <LinearGradient
                colors={["#E83E8C", "#D633A6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButtonGradient}
              >
                <Feather name="send" size={18} color="#FFFFFF" />
              </LinearGradient>
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
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
  },
  messageWrapper: {
    marginVertical: 2,
  },
  messageRow: {
    maxWidth: "82%",
  },
  messageRowUser: {
    alignSelf: "flex-end",
  },
  messageRowAssistant: {
    alignSelf: "flex-start",
  },
  userBubble: {
    borderRadius: 20,
    borderTopRightRadius: 6,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  userBubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  assistantBubble: {
    borderTopLeftRadius: 6,
  },
  messageBubbleInner: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  welcomeBubble: {
    borderTopLeftRadius: 6,
  },
  welcomeInner: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  welcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  welcomeIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(232,62,140,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeName: {
    fontFamily: Fonts.bodySemibold,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 11,
    fontFamily: Fonts.body,
    marginTop: 3,
    marginBottom: 4,
  },
  timestampUser: {
    alignSelf: "flex-end",
    marginRight: 4,
  },
  timestampAssistant: {
    alignSelf: "flex-start",
    marginLeft: 4,
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
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
  },
  sendButtonGradient: {
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  chipIcon: {
    marginTop: 1,
  },
  chipText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    letterSpacing: 0.1,
  },
  typingBubbleInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E83E8C",
  },
});
