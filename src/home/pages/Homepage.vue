<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app permanent>
      <v-container fluid class="pa-0" style="overflow: auto;">
        <v-list>
          <v-list-item @click="toggleBookmarks" class="clickable-item">
            <v-list-item-icon>
              <v-icon>mdi-bookmark</v-icon>
              <span> 즐겨찾기</span>
            </v-list-item-icon>
            <v-list-item-action>
              <v-icon>{{ isBookmarksOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-list-item-action>
          </v-list-item>
          <v-expand-transition>
            <v-list v-show="isBookmarksOpen">
              <span>toggle test01</span>
            </v-list>
          </v-expand-transition>
        </v-list>
      </v-container>

      <v-spacer></v-spacer>
      <v-container fluid class="pa-0" style="overflow: auto;">
        <v-list>
          <v-list-item @click="toggleHistory" class="clickable-item">
            <v-list-item-icon>
              <v-icon>mdi-history</v-icon>
              <span> 채팅기록</span>
            </v-list-item-icon>
            <v-list-item-action>
              <v-icon>{{ isHistoryOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-list-item-action>
          </v-list-item>
          <v-expand-transition>
            <v-list v-show="isHistoryOpen">
              <span>toggle test02</span>
            </v-list>
          </v-expand-transition>
        </v-list>
      </v-container>
    </v-navigation-drawer>

    <v-app-bar app flat color="white">
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
      <v-toolbar-title>ChatGPT Style</v-toolbar-title>
      <v-btn text @click="signIn" class="btn-text">
        <v-icon right>mdi-login</v-icon>
        <span>LogIn</span>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="main-container" fluid>
        <div class="chat-container">
          <div class="chat-box">
            <div v-for="(message, index) in messages" :key="index" class="message">
              {{ message }}
            </div>
          </div>

          <!-- 네이버 로그인 버튼 노출 영역 -->
          <!-- <div id="naver_id_login"></div> -->

          <!-- 구글 로그인 버튼 노출 영역 -->
          <!-- <div id="google-signin-button"></div> -->

          <!-- Input Box, Send Button, and Clear Chat Button -->
          <v-card class="chat-input-card">
            <v-card-text>
              <div class="input-container">
                <v-text-field v-model="messageInput" label="Type your message" outlined dense @keyup.enter="sendMessage"
                  class="message-input"></v-text-field>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import router from '@/router';
// import VueJwtDecode from "vue-jwt-decode";

const naverClientId = "1ceqnQISoXzc9gxfyFy0";
const googleClientId = "425771861493-v58fd732eng4kfa380c9vf2usotv7do3.apps.googleusercontent.com";

export default defineComponent({
  name: 'HomeView',
  setup() {
    const messageInput = ref('');
    const messages = ref<string[]>([]);
    const drawer = ref(true);
    const isBookmarksOpen = ref(false);
    const isHistoryOpen = ref(false);
    const googleUser = ref({});

    const sendMessage = () => {
      if (messageInput.value.trim()) {
        messages.value.push(messageInput.value);
        messageInput.value = '';
      }
    };

    const signIn = () => {
      router.push('/account/login');
    };

    const toggleDrawer = () => {
      drawer.value = !drawer.value;
    };

    const toggleBookmarks = () => {
      isBookmarksOpen.value = !isBookmarksOpen.value;
    };

    const toggleHistory = () => {
      isHistoryOpen.value = !isHistoryOpen.value;
    };

    const initNaverLogin = () => {
      const naverLoginButton = document.getElementById('naver_id_login');
      if (naverLoginButton && window.naver_id_login) {
        const naverLogin = new window.naver_id_login(
          naverClientId,
          "http://localhost:8080/naverlogin"
        );

        const state = naverLogin.getUniqState();
        naverLogin.setButton("white", 2, 40);
        naverLogin.setDomain("http://localhost:8080");
        naverLogin.setState(state);
        naverLogin.init_naver_id_login();
      } else {
        console.error('Naver SDK is not loaded or button element is missing.');
      }
    };

    const googleInit = () => {
      const googleSignInButton = document.getElementById('google-signin-button');
      if (googleSignInButton && window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: googleCallback,
        });

        window.google.accounts.id.renderButton(
          googleSignInButton,
          { theme: 'outline', size: 'large' }
        );
      } else {
        console.error('Google Sign-In SDK is not loaded or button element is missing.');
      }
    };

    const googleCallback = (response: any) => {
      console.log("Google sign-in response:", response);
      // googleUser.value = VueJwtDecode.decode(response.credential);
      console.log("Decoded Google User:", googleUser.value);
    };

    onMounted(() => {
      const naverScript = document.createElement('script');
      naverScript.src = 'https://static.nid.naver.com/js/naverLogin_implicit-1.0.3.js';
      naverScript.onload = initNaverLogin;
      document.body.appendChild(naverScript);

      const googleScript = document.createElement('script');
      googleScript.src = 'https://accounts.google.com/gsi/client';
      googleScript.async = true;
      googleScript.defer = true;
      googleScript.onload = googleInit;
      document.body.appendChild(googleScript);
    });

    return {
      messageInput,
      messages,
      sendMessage,
      signIn,
      drawer,
      toggleDrawer,
      isBookmarksOpen,
      isHistoryOpen,
      toggleBookmarks,
      toggleHistory,
      googleUser,
    };
  },
});
</script>

<style scoped>
.main-container {
  height: calc(100vh - 64px);
  padding: 0;
}

.chat-container {
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-box {
  flex: 1;
  background-color: rgb(222, 236, 255);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.message {
  margin-bottom: 10px;
}

.chat-input-card {
  border-top: 85px solid #ffffff;
}

.input-container {
  display: flex;
  align-items: center;
}

.message-input {
  flex: 1;
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: black;
  color: white;
  margin-left: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  /* Removes default minimum width */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.send-button:hover {
  background-color: #333;
}

.clear-button {
  margin-left: 8px;
}
</style>
