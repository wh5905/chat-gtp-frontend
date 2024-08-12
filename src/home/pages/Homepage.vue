<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app permanent>
      <v-container fluid class="pa-0" style="overflow: auto;">
        <v-list>
          <v-list-item @click="toggleBookmarks" class="clickable-item">
            <v-list-item-icon>
              <v-icon>mdi-bookmark</v-icon>
              <span>즐겨찾기</span>
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
              <span>채팅기록</span>
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
      <v-btn v-if="isNotAuthenticated" text @click="signIn" class="btn-text">
        <v-icon right>mdi-login</v-icon>
        <span>LogIn</span>
      </v-btn>
      <v-btn v-if="isAuthenticated" text @click="signOut" class="btn-text">
        <v-icon right>mdi-logout</v-icon>
        <span>LogOut</span>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="main-container" fluid>
        <div class="chat-container">
          <div class="chat-box">
            <div 
              v-for="(message, index) in messages" 
              :key="index" 
              :class="['message', message.isUser ? 'user-message' : 'bot-message']"
            >
              {{ message.text }}
            </div>
          </div>

          <v-card class="chat-input-card">
            <v-card-text>
              <div class="input-container">
                <v-text-field 
                  v-model="messageInput" 
                  label="Type your message" 
                  outlined 
                  dense 
                  @keyup.enter="sendMessage" 
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
import { defineComponent, ref, computed } from 'vue';
import router from '@/router';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'HomeView',
  setup() {
    const store = useStore();
    const messageInput = ref('');
    const messages = ref<Array<{ text: string; isUser: boolean }>>([]);
    const drawer = ref(true);
    const isBookmarksOpen = ref(false);
    const isHistoryOpen = ref(false);

    const sendMessage = () => {
      if (isAuthenticated.value) {
        if (messageInput.value.trim()) {
          messages.value.push({ text: messageInput.value, isUser: true });
          messageInput.value = '';
          // Simulating bot response
          setTimeout(() => {
            messages.value.push({ text: 'This is a response from the bot.', isUser: false });
          }, 1000);
        }
      } else {
        alert('로그인을 해주세요.');
      }
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

    // 각 인증 상태를 개별적으로 가져오기
    const isKakaoAuthenticated = computed(() => store.state.authenticationModule.isKakaoAuthenticated);
    const isLoggedIn = computed(() => store.state.accountModule.isLoggedIn);
    const isGoogleAuthenticated = computed(() => store.state.GoogleAuthenticationModule.isGoogleAuthenticated);
    const isNaverAuthenticated = computed(() => store.state.NaverAuthenticationModule.isNaverAuthenticated);

    // 모든 인증 상태를 묶어서 확인하는 computed 속성
    const isAuthenticated = computed(() => {
      return (
        isKakaoAuthenticated.value || 
        isLoggedIn.value || 
        isGoogleAuthenticated.value || 
        isNaverAuthenticated.value
      );
    });

    // 모든 인증 상태가 false일 때만 true를 반환하는 computed 속성
    const isNotAuthenticated = computed(() => {
      return (
        !isKakaoAuthenticated.value && 
        !isLoggedIn.value && 
        !isGoogleAuthenticated.value && 
        !isNaverAuthenticated.value
      );
    });

    const signIn = () => {
      router.push('/account/login');
    };

    const signOut = async () => {
      if (isLoggedIn.value) {
        await store.commit('accountModule/REQUEST_IS_ACCOUNT_TO_DJANGO', false);
      }
      if (isKakaoAuthenticated.value) {
        await store.dispatch('authenticationModule/requestLogoutToDjango');
      }
      if (isGoogleAuthenticated.value){
        await store.dispatch('GoogleAuthenticationModule/requestLogoutToDjango');
      }
      if (isNaverAuthenticated.value){
        await store.dispatch('NaverAuthenticationModule/requestLogoutToDjango');
      }
      router.push('/');
    };

    return {
      messageInput,
      messages,
      sendMessage,
      drawer,
      toggleDrawer,
      isBookmarksOpen,
      isHistoryOpen,
      toggleBookmarks,
      toggleHistory,
      isAuthenticated,
      isNotAuthenticated,
      signIn,
      signOut
    };
  }
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
  padding: 10px;
  border-radius: 8px;
  max-width: 60%;
  word-wrap: break-word;
}

.user-message {
  background-color: #cfe9ff;
  margin-left: auto;
  text-align: right;
}

.bot-message {
  background-color: #f0f0f0;
  margin-right: auto;
  text-align: left;
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
