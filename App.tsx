import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ResizeMode, Video } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type Screen = "home" | "surgeries" | "settings" | "admin" | "about";
type User = { fullName: string; email: string; password: string };
type Surgery = { id: string; title: string; specialty: string; duration: string; level: string; videoUrl: string; description: string; steps: string[] };
type ThemeColors = typeof lightColors;

const STORAGE_USER = "@robotic_manual_user";
const STORAGE_SURGERIES = "@robotic_manual_surgeries";
const coverImage = { uri: "https://images.unsplash.com/photo-1581093458791-9d42f7f0bbdf?auto=format&fit=crop&w=1200&q=80" };

const initialSurgeries: Surgery[] = [
  {
    id: "prostatectomia",
    title: "Prostatectomia Robotica",
    specialty: "Urologia",
    duration: "2h30 a 4h",
    level: "Intermediario",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    description: "Demonstra o fluxo do preparo, posicionamento, docking do robo e pontos de atencao para uma cirurgia robotica segura.",
    steps: ["Confirmar checklist cirurgico e dados do paciente.", "Organizar torre, console, carrinho do paciente e instrumentais.", "Realizar posicionamento e acesso conforme protocolo institucional.", "Conferir comunicacao entre equipe de campo, anestesia e console."]
  },
  {
    id: "histerectomia",
    title: "Histerectomia Robotica",
    specialty: "Ginecologia",
    duration: "1h45 a 3h",
    level: "Basico",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    description: "Resumo didatico para treinamento de sala, com foco em ergonomia, seguranca e sequencia operacional.",
    steps: ["Validar indicacao, consentimento e exames pre-operatorios.", "Checar pincas, optica, energia e acessorios roboticos.", "Posicionar portais respeitando a anatomia e o plano cirurgico.", "Registrar eventos relevantes para auditoria e ensino."]
  },
  {
    id: "colectomia",
    title: "Colectomia Robotica",
    specialty: "Cirurgia Geral",
    duration: "3h a 5h",
    level: "Avancado",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    description: "Manual visual para procedimentos abdominais complexos, com descricao das fases e da interacao da equipe.",
    steps: ["Revisar imagens e planejamento do segmento a ser tratado.", "Preparar mesa auxiliar com material de conversao disponivel.", "Definir posicao dos bracos roboticos evitando colisao.", "Encerrar com contagem, relatorio e revisao dos pontos criticos."]
  }
];

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedId, setSelectedId] = useState(initialSurgeries[0].id);
  const [surgeries, setSurgeries] = useState<Surgery[]>(initialSurgeries);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [adminVideo, setAdminVideo] = useState("");
  const [adminDescription, setAdminDescription] = useState("");
  const colors = darkMode ? darkColors : lightColors;
  const selectedSurgery = useMemo(() => surgeries.find((item) => item.id === selectedId) ?? surgeries[0], [selectedId, surgeries]);

  useEffect(() => {
    async function loadDemoData() {
      const [storedUser, storedSurgeries] = await Promise.all([AsyncStorage.getItem(STORAGE_USER), AsyncStorage.getItem(STORAGE_SURGERIES)]);
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedSurgeries) setSurgeries(JSON.parse(storedSurgeries));
    }
    loadDemoData();
  }, []);

  useEffect(() => {
    const introTimer = setTimeout(() => setShowIntro(false), 2400);
    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    setAdminVideo(selectedSurgery.videoUrl);
    setAdminDescription(selectedSurgery.description);
  }, [selectedSurgery]);

  async function handleAuth() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password.trim() || (authMode === "signup" && !fullName.trim())) {
      Alert.alert("Campos obrigatorios", "Preencha nome, email e senha para continuar.");
      return;
    }
    if (authMode === "signup") {
      const newUser = { fullName: fullName.trim(), email: normalizedEmail, password };
      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(newUser));
      setUser(newUser);
      setScreen("home");
      return;
    }
    const stored = await AsyncStorage.getItem(STORAGE_USER);
    if (!stored) {
      Alert.alert("Conta nao encontrada", "Crie uma conta para acessar a demo.");
      setAuthMode("signup");
      return;
    }
    const storedUser = JSON.parse(stored) as User;
    if (storedUser.email === normalizedEmail && storedUser.password === password) {
      setUser(storedUser);
      setScreen("home");
    } else {
      Alert.alert("Acesso negado", "Email ou senha incorretos.");
    }
  }

  async function saveAdminContent() {
    const updated = surgeries.map((item) => item.id === selectedSurgery.id ? { ...item, videoUrl: adminVideo.trim(), description: adminDescription.trim() } : item);
    setSurgeries(updated);
    await AsyncStorage.setItem(STORAGE_SURGERIES, JSON.stringify(updated));
    Alert.alert("Conteudo salvo", "O video e a descricao foram atualizados nesta demo.");
  }

  if (showIntro) {
    return <SafeAreaProvider><SafeAreaView style={styles.introShell}><StatusBar barStyle="dark-content" backgroundColor="#ffffff" /><Image source={coverImage} style={styles.introImage} resizeMode="contain" /></SafeAreaView></SafeAreaProvider>;
  }

  if (!user) {
    return <SafeAreaProvider><SafeAreaView style={[styles.authShell, { backgroundColor: colors.background }]}><StatusBar barStyle="dark-content" /><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.authKeyboard}><ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled"><View style={[styles.brandMark, { backgroundColor: colors.primary }]}><MaterialCommunityIcons name="robot-industrial" size={42} color="#ffffff" /></View><Text style={[styles.authTitle, { color: colors.text }]}>Manual de Cirurgia Robotica</Text><Text style={[styles.authSubtitle, { color: colors.muted }]}>Plataforma demo para treinamento, consulta e aprovacao do fluxo cirurgico.</Text><View style={[styles.authPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.segmented}><Pressable onPress={() => setAuthMode("signup")} style={[styles.segmentButton, authMode === "signup" && { backgroundColor: colors.primary }]}><Text style={[styles.segmentText, authMode === "signup" && styles.segmentTextActive]}>Criar conta</Text></Pressable><Pressable onPress={() => setAuthMode("login")} style={[styles.segmentButton, authMode === "login" && { backgroundColor: colors.primary }]}><Text style={[styles.segmentText, authMode === "login" && styles.segmentTextActive]}>Entrar</Text></Pressable></View>{authMode === "signup" && <Field icon="account-outline" label="Nome completo" value={fullName} onChangeText={setFullName} colors={colors} autoCapitalize="words" />}<Field icon="email-outline" label="Email" value={email} onChangeText={setEmail} colors={colors} keyboardType="email-address" autoCapitalize="none" /><Field icon="lock-outline" label="Senha" value={password} onChangeText={setPassword} colors={colors} secureTextEntry /><Pressable style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleAuth}><MaterialCommunityIcons name={authMode === "signup" ? "account-plus" : "login"} size={20} color="#ffffff" /><Text style={styles.primaryButtonText}>{authMode === "signup" ? "Criar e acessar" : "Acessar app"}</Text></Pressable></View></ScrollView></KeyboardAvoidingView></SafeAreaView></SafeAreaProvider>;
  }

  return <SafeAreaProvider><SafeAreaView style={[styles.shell, { backgroundColor: colors.background }]}><StatusBar barStyle={darkMode ? "light-content" : "dark-content"} /><View style={[styles.topBar, { borderBottomColor: colors.border }]}><View><Text style={[styles.greeting, { color: colors.muted }]}>Boa noite, {user.fullName.split(" ")[0]}</Text><Text style={[styles.topTitle, { color: colors.text }]}>Manual Robotico</Text></View><Pressable style={[styles.avatar, { backgroundColor: colors.primary }]} onPress={() => setUser(null)}><MaterialCommunityIcons name="logout" size={22} color="#ffffff" /></Pressable></View><View style={[styles.menu, { borderBottomColor: colors.border }]}><MenuButton icon="home-outline" label="Inicio" active={screen === "home"} onPress={() => setScreen("home")} colors={colors} /><MenuButton icon="format-list-bulleted" label="Cirurgias" active={screen === "surgeries"} onPress={() => setScreen("surgeries")} colors={colors} /><MenuButton icon="video-plus-outline" label="Admin" active={screen === "admin"} onPress={() => setScreen("admin")} colors={colors} /><MenuButton icon="cog-outline" label="Ajustes" active={screen === "settings"} onPress={() => setScreen("settings")} colors={colors} /></View><ScrollView contentContainerStyle={styles.content}>{screen === "home" && <HomeScreen colors={colors} surgeriesCount={surgeries.length} />}{screen === "surgeries" && <SurgeriesScreen colors={colors} surgeries={surgeries} selectedId={selectedId} setSelectedId={setSelectedId} selectedSurgery={selectedSurgery} />}{screen === "admin" && <AdminScreen colors={colors} selectedSurgery={selectedSurgery} adminVideo={adminVideo} setAdminVideo={setAdminVideo} adminDescription={adminDescription} setAdminDescription={setAdminDescription} saveAdminContent={saveAdminContent} />}{screen === "settings" && <SettingsScreen colors={colors} darkMode={darkMode} setDarkMode={setDarkMode} notifications={notifications} setNotifications={setNotifications} setScreen={setScreen} />}{screen === "about" && <Panel colors={colors}><Text style={[styles.sectionTitle, { color: colors.text }]}>Sobre</Text><Text style={[styles.bodyText, { color: colors.muted }]}>Esta versao foi criada para validar cadastro, navegacao, consulta de cirurgias, video aula e edicao de conteudo pelo administrador.</Text></Panel>}</ScrollView></SafeAreaView></SafeAreaProvider>;
}

function HomeScreen({ colors, surgeriesCount }: { colors: ThemeColors; surgeriesCount: number }) {
  return <View><View style={[styles.hero, { backgroundColor: colors.hero, borderColor: colors.border }]}><Image source={coverImage} style={styles.homeCoverImage} resizeMode="cover" /><Text style={[styles.heroTitle, { color: colors.text }]}>Biblioteca rapida para equipes de cirurgia robotica</Text><Text style={[styles.heroText, { color: colors.muted }]}>Acesse protocolos, videos e descricoes de procedimentos em uma interface pensada para consulta antes e durante treinamentos.</Text></View><View style={styles.metricGrid}><Metric icon="robot-industrial" label="Cirurgias" value={String(surgeriesCount)} colors={colors} /><Metric icon="play-circle-outline" label="Videos" value="Admin" colors={colors} /><Metric icon="shield-check-outline" label="Modo" value="Demo" colors={colors} /></View></View>;
}

function SurgeriesScreen(props: { colors: ThemeColors; surgeries: Surgery[]; selectedId: string; setSelectedId: (id: string) => void; selectedSurgery: Surgery }) {
  return <View><Text style={[styles.sectionTitle, { color: props.colors.text }]}>Selecao de cirurgia</Text>{props.surgeries.map((item) => <Pressable key={item.id} style={[styles.surgeryCard, { backgroundColor: props.colors.surface, borderColor: item.id === props.selectedId ? props.colors.primary : props.colors.border }]} onPress={() => props.setSelectedId(item.id)}><View style={styles.cardHeader}><MaterialCommunityIcons name="stethoscope" size={24} color={props.colors.primary} /><View style={styles.cardTitleGroup}><Text style={[styles.cardTitle, { color: props.colors.text }]}>{item.title}</Text><Text style={[styles.cardMeta, { color: props.colors.muted }]}>{item.specialty} - {item.duration}</Text></View><Text style={[styles.levelBadge, { color: props.colors.primary, borderColor: props.colors.primary }]}>{item.level}</Text></View></Pressable>)}<SurgeryDetail surgery={props.selectedSurgery} colors={props.colors} /></View>;
}

function AdminScreen(props: { colors: ThemeColors; selectedSurgery: Surgery; adminVideo: string; setAdminVideo: (value: string) => void; adminDescription: string; setAdminDescription: (value: string) => void; saveAdminContent: () => void }) {
  return <Panel colors={props.colors}><Text style={[styles.sectionTitle, { color: props.colors.text }]}>Area do administrador</Text><Text style={[styles.bodyText, { color: props.colors.muted }]}>Atualize o video e a descricao da cirurgia selecionada.</Text><Text style={[styles.adminCurrent, { color: props.colors.text }]}>{props.selectedSurgery.title}</Text><Field icon="video-outline" label="URL do video" value={props.adminVideo} onChangeText={props.setAdminVideo} colors={props.colors} autoCapitalize="none" /><Text style={[styles.fieldLabel, { color: props.colors.text }]}>Descricao</Text><TextInput style={[styles.textArea, { borderColor: props.colors.border, color: props.colors.text, backgroundColor: props.colors.input }]} value={props.adminDescription} onChangeText={props.setAdminDescription} multiline textAlignVertical="top" /><Pressable style={[styles.primaryButton, { backgroundColor: props.colors.primary }]} onPress={props.saveAdminContent}><MaterialCommunityIcons name="content-save-outline" size={20} color="#ffffff" /><Text style={styles.primaryButtonText}>Salvar conteudo</Text></Pressable></Panel>;
}

function SettingsScreen(props: { colors: ThemeColors; darkMode: boolean; setDarkMode: (value: boolean) => void; notifications: boolean; setNotifications: (value: boolean) => void; setScreen: (screen: Screen) => void }) {
  return <Panel colors={props.colors}><Text style={[styles.sectionTitle, { color: props.colors.text }]}>Configuracoes</Text><SettingRow icon="theme-light-dark" label="Modo escuro" value={props.darkMode} onValueChange={props.setDarkMode} colors={props.colors} /><SettingRow icon="bell-outline" label="Notificacoes" value={props.notifications} onValueChange={props.setNotifications} colors={props.colors} /><Pressable style={styles.aboutButton} onPress={() => props.setScreen("about")}><MaterialCommunityIcons name="information-outline" size={22} color={props.colors.primary} /><Text style={[styles.aboutText, { color: props.colors.primary }]}>Sobre a demo</Text></Pressable></Panel>;
}

function Field(props: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string; onChangeText: (text: string) => void; colors: ThemeColors; secureTextEntry?: boolean; keyboardType?: "default" | "email-address"; autoCapitalize?: "none" | "sentences" | "words" | "characters" }) {
  return <View style={styles.field}><Text style={[styles.fieldLabel, { color: props.colors.text }]}>{props.label}</Text><View style={[styles.inputWrap, { borderColor: props.colors.border, backgroundColor: props.colors.input }]}><MaterialCommunityIcons name={props.icon} size={20} color={props.colors.muted} /><TextInput style={[styles.input, { color: props.colors.text }]} value={props.value} onChangeText={props.onChangeText} secureTextEntry={props.secureTextEntry} keyboardType={props.keyboardType} autoCapitalize={props.autoCapitalize} placeholderTextColor={props.colors.muted} /></View></View>;
}

function MenuButton(props: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; active: boolean; onPress: () => void; colors: ThemeColors }) {
  return <Pressable onPress={props.onPress} style={[styles.menuButton, props.active && { backgroundColor: props.colors.primarySoft }]}><MaterialCommunityIcons name={props.icon} size={22} color={props.active ? props.colors.primary : props.colors.muted} /><Text style={[styles.menuText, { color: props.active ? props.colors.primary : props.colors.muted }]}>{props.label}</Text></Pressable>;
}

function Metric(props: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string; colors: ThemeColors }) {
  return <View style={[styles.metric, { backgroundColor: props.colors.surface, borderColor: props.colors.border }]}><MaterialCommunityIcons name={props.icon} size={24} color={props.colors.primary} /><Text style={[styles.metricValue, { color: props.colors.text }]}>{props.value}</Text><Text style={[styles.metricLabel, { color: props.colors.muted }]}>{props.label}</Text></View>;
}

function SurgeryDetail({ surgery, colors }: { surgery: Surgery; colors: ThemeColors }) {
  return <View style={[styles.detailPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.sectionTitle, { color: colors.text }]}>{surgery.title}</Text><Video style={styles.video} source={{ uri: surgery.videoUrl }} useNativeControls resizeMode={ResizeMode.CONTAIN} /><Text style={[styles.bodyText, { color: colors.muted }]}>{surgery.description}</Text>{surgery.steps.map((step, index) => <View key={step} style={styles.stepRow}><Text style={[styles.stepNumber, { backgroundColor: colors.primary, color: "#ffffff" }]}>{index + 1}</Text><Text style={[styles.stepText, { color: colors.text }]}>{step}</Text></View>)}</View>;
}

function SettingRow(props: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: boolean; onValueChange: (value: boolean) => void; colors: ThemeColors }) {
  return <View style={styles.settingRow}><View style={styles.settingLabelGroup}><MaterialCommunityIcons name={props.icon} size={22} color={props.colors.primary} /><Text style={[styles.settingLabel, { color: props.colors.text }]}>{props.label}</Text></View><Switch value={props.value} onValueChange={props.onValueChange} /></View>;
}

function Panel({ children, colors }: { children: React.ReactNode; colors: ThemeColors }) {
  return <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>;
}

const lightColors = { background: "#f7faf8", surface: "#ffffff", input: "#f9fbfa", text: "#17211d", muted: "#68746f", primary: "#0b7f73", primarySoft: "#e2f3f0", border: "#dce6e2", hero: "#eef7f3" };
const darkColors = { background: "#101716", surface: "#17211f", input: "#1e2a27", text: "#eef7f3", muted: "#a9b8b2", primary: "#41b8a8", primarySoft: "#203a36", border: "#2b3a36", hero: "#172b27" };

const styles = StyleSheet.create({
  shell: { flex: 1 }, introShell: { flex: 1, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", padding: 12 }, introImage: { width: "100%", height: "100%" }, authShell: { flex: 1 }, authKeyboard: { flex: 1 }, authContent: { padding: 24, minHeight: "100%", justifyContent: "center" }, brandMark: { width: 74, height: 74, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 18 }, authTitle: { fontSize: 30, fontWeight: "800", lineHeight: 36 }, authSubtitle: { fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 22 }, authPanel: { borderWidth: 1, borderRadius: 8, padding: 16 }, segmented: { flexDirection: "row", gap: 8, marginBottom: 16 }, segmentButton: { flex: 1, height: 42, borderRadius: 8, alignItems: "center", justifyContent: "center" }, segmentText: { color: "#68746f", fontWeight: "700" }, segmentTextActive: { color: "#ffffff" }, field: { marginBottom: 14 }, fieldLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8 }, inputWrap: { minHeight: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 }, input: { flex: 1, fontSize: 15, minHeight: 46 }, primaryButton: { minHeight: 50, borderRadius: 8, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 8 }, primaryButtonText: { color: "#ffffff", fontWeight: "800", fontSize: 15 }, topBar: { paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, greeting: { fontSize: 13, fontWeight: "600" }, topTitle: { fontSize: 22, fontWeight: "800" }, avatar: { width: 42, height: 42, borderRadius: 8, alignItems: "center", justifyContent: "center" }, menu: { flexDirection: "row", gap: 8, paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1 }, menuButton: { flex: 1, minHeight: 54, borderRadius: 8, alignItems: "center", justifyContent: "center" }, menuText: { fontSize: 11, fontWeight: "700", marginTop: 3 }, content: { padding: 16, paddingBottom: 32 }, hero: { borderWidth: 1, borderRadius: 8, padding: 16 }, homeCoverImage: { width: "100%", height: 330, borderRadius: 8, backgroundColor: "#ffffff", marginBottom: 16 }, heroTitle: { fontSize: 24, fontWeight: "800", lineHeight: 30 }, heroText: { fontSize: 15, lineHeight: 22, marginTop: 10 }, metricGrid: { flexDirection: "row", gap: 10, marginTop: 14 }, metric: { flex: 1, minHeight: 104, borderRadius: 8, borderWidth: 1, padding: 12, justifyContent: "space-between" }, metricValue: { fontSize: 19, fontWeight: "800" }, metricLabel: { fontSize: 12, fontWeight: "700" }, sectionTitle: { fontSize: 20, fontWeight: "800", marginBottom: 12 }, surgeryCard: { borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 10 }, cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 }, cardTitleGroup: { flex: 1 }, cardTitle: { fontSize: 15, fontWeight: "800" }, cardMeta: { fontSize: 12, marginTop: 3 }, levelBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, fontSize: 10, fontWeight: "800" }, detailPanel: { borderWidth: 1, borderRadius: 8, padding: 14, marginTop: 6 }, video: { width: "100%", height: 205, borderRadius: 8, backgroundColor: "#0d1211", marginBottom: 14 }, bodyText: { fontSize: 15, lineHeight: 22, marginBottom: 12 }, stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 10 }, stepNumber: { width: 24, height: 24, borderRadius: 8, textAlign: "center", lineHeight: 24, fontWeight: "800" }, stepText: { flex: 1, fontSize: 14, lineHeight: 21 }, panel: { borderWidth: 1, borderRadius: 8, padding: 16 }, adminCurrent: { fontSize: 16, fontWeight: "800", marginBottom: 14 }, textArea: { minHeight: 130, borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 12 }, settingRow: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, settingLabelGroup: { flexDirection: "row", alignItems: "center", gap: 10 }, settingLabel: { fontSize: 15, fontWeight: "700" }, aboutButton: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }, aboutText: { fontSize: 15, fontWeight: "800" }
});
