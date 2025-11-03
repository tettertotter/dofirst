import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { supabase } from "../lib/supabase";
import { parseInline } from "@todaypool/api/parsing";
import * as Speech from "expo-speech";

export default function Index() {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [poolId, setPoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        // Get user's first pool
        supabase
          .from("pool_members")
          .select("pool_id")
          .eq("user_id", session.user.id)
          .limit(1)
          .single()
          .then(({ data }) => {
            if (data) setPoolId(data.pool_id);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn() {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim()
    });

    if (error) {
      Alert.alert("Sign In Error", error.message);
    } else {
      Alert.alert("Success", "Check your email for the magic link!");
      setEmail("");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setPoolId(null);
  }

  async function quickAdd() {
    if (!poolId) {
      Alert.alert("Error", "No pool found. Please create a pool first.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    setSubmitting(true);

    try {
      // Parse inline tokens
      const parsed = parseInline(title);
      const tags = parsed.tags.length > 0 ? parsed.tags : undefined;

      const body = {
        poolId,
        title: parsed.title || title,
        priority: parsed.priority,
        tags
      };

      // Get the session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Use the web API endpoint
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/tasks.quickAdd`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create task");
      }

      setTitle("");
      Alert.alert("Success", `Task added: ${data.task.title}`);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startDictation() {
    Alert.alert(
      "Voice Input",
      "Use your device's built-in voice input by tapping the microphone on your keyboard, or use Siri/Google Assistant to dictate.",
      [{ text: "OK" }]
    );
    // Note: For true voice dictation, you'd need to integrate expo-speech-recognition
    // or use the platform's native dictation through the keyboard
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>TodayPool</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.helpText}>
              Enter your email to receive a magic link
            </Text>
            <TextInput
              placeholder="your@email.com"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TouchableOpacity onPress={signIn} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Send Magic Link</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>TodayPool</Text>
          <TouchableOpacity onPress={signOut} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Add</Text>
          <TextInput
            placeholder="Add a task... (try #work !2)"
            style={[styles.input, { minHeight: 48 }]}
            value={title}
            onChangeText={setTitle}
            multiline
            autoFocus
            onSubmitEditing={quickAdd}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={startDictation}
              style={[styles.iconButton, { flex: 1, marginRight: 8 }]}
            >
              <Text style={styles.iconButtonText}>🎤 Dictate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={quickAdd}
              disabled={submitting || !title.trim()}
              style={[
                styles.primaryButton,
                { flex: 1 },
                (submitting || !title.trim()) && styles.disabledButton
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {submitting ? "Adding..." : "Add"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <Text style={styles.tipText}>• Use #tags to organize (e.g., #work #urgent)</Text>
          <Text style={styles.tipText}>• Add !1 to !5 for priority (1 = highest)</Text>
          <Text style={styles.tipText}>• Tap dictate or use keyboard voice input</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa"
  },
  scrollContent: {
    padding: 16,
    paddingTop: 48
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111"
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111"
  },
  helpText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white"
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 12
  },
  primaryButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd"
  },
  secondaryButtonText: {
    color: "#111",
    fontSize: 14,
    fontWeight: "500"
  },
  iconButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12
  },
  iconButtonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "600"
  },
  disabledButton: {
    opacity: 0.5
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111"
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22
  }
});
