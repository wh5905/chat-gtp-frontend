<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" class="navi" app permanent>
      <v-container fluid class="pa-0" style="overflow: auto;">
        <v-list>
          <!-- 다른 항목들... -->
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
              <v-list-item :to="{ name: 'stock_list' }" class="clickable-item">
                <v-list-item-icon>
                  <v-icon>mdi-chart-line</v-icon>
                  <span>주식 목록</span>
                </v-list-item-icon>
              </v-list-item>
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

    <v-app-bar app flat color="#212121">
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
      <v-dialog v-model="showDialog" max-width="400">
        <v-card>
          <v-card-title class="headline">로그인이 필요합니다</v-card-title>
          <v-card-text>메시지를 보내려면 먼저 로그인해야 합니다.</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="secondary" text @click="signIn">로그인</v-btn>
            <v-btn color="primary" text @click="closeDialog">확인</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
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
    const showDialog = ref(false); // 팝업 창을 제어하는 ref

    const isKakaoAuthenticated = ref(false);
    const isLoggedIn = ref(false);
    const isGoogleAuthenticated = ref(false);
    const isNaverAuthenticated = ref(false);

    const isAuthenticated = computed(() => {
      return (
        isKakaoAuthenticated.value || 
        isLoggedIn.value || 
        isGoogleAuthenticated.value || 
        isNaverAuthenticated.value
      );
    });

    const isNotAuthenticated = computed(() => {
      return (
        !isKakaoAuthenticated.value && 
        !isLoggedIn.value && 
        !isGoogleAuthenticated.value && 
        !isNaverAuthenticated.value
      );
    });

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
        showDialog.value = true; // 로그인 안 된 경우 팝업 창 띄우기
      }
    };

    const closeDialog = () => {
      showDialog.value = false;
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

    const signIn = () => {
      router.push('/account/login');
    };

    const signOut = async () => {
      if (isLoggedIn.value) {
        await store.commit('accountModule/REQUEST_IS_ACCOUNT_TO_DJANGO', false);
        localStorage.removeItem('generalLogin');
        isLoggedIn.value = false;
      }
      if (isKakaoAuthenticated.value) {
        await store.dispatch('authenticationModule/requestLogoutToDjango');
        localStorage.removeItem('userToken');
        isKakaoAuthenticated.value = false;
      }
      if (isGoogleAuthenticated.value) {
        await store.dispatch('GoogleAuthenticationModule/requestLogoutToDjango');
        localStorage.removeItem('googleUserToken');
        isGoogleAuthenticated.value = false;
      }
      if (isNaverAuthenticated.value) {
        await store.dispatch('NaverAuthenticationModule/requestLogoutToDjango');
        localStorage.removeItem('naverUserToken');
        isNaverAuthenticated.value = false;
      }
      router.push('/');
    };

    onMounted(async () => {
      const generalLogin = localStorage.getItem('generalLogin');
      if (generalLogin) {
        console.log("You already has a generalLogin!");
        isLoggedIn.value = true;
      }
      const userToken = localStorage.getItem('userToken');
      if (userToken) {
        console.log("You already has a userToken!");
        isKakaoAuthenticated.value = true;
      }
      const googleUserToken = localStorage.getItem('googleUserToken');
      if (googleUserToken) {
        console.log("You already has a googleUserToken!");
        isGoogleAuthenticated.value = true;
      }
      const naverUserToken = localStorage.getItem('naverUserToken');
      if (naverUserToken) {
        console.log("You already has a naverUserToken!");
        isNaverAuthenticated.value = true;
      }
    });

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
      signOut,
      showDialog,
      closeDialog,
    };
  }
});
</script>

<style scoped>
.navi {
  background-color: #212121;
  color: #ffffff;
}

.main-container {
  height: calc(100vh - 64px);
  padding: 0;
}

.chat-container {
  background-color: #212121;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-box {
  background-color: #212121;
  border-radius: 8px;
  padding: 20px;
  height: 700px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-height: 700px;
  overflow-y: auto;
  margin-left: 10%;
  margin-right: 10%;
}

.message {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 8px;
  max-width: 60%;
  word-wrap: break-word;
}

.user-message {
  background-color: #212121;
  margin-left: auto;
  text-align: right;
  color: #ffffff;
}

.bot-message {
  background-color: #212121;
  margin-right: auto;
  text-align: left;
  color: #ffffff;
}

.chat-input-card {
  background-color: #212121;
  color: #ffffff;
  margin-left: 10%;
  margin-right: 10%;
}

.input-container {
  display: flex;
  align-items: center;
  background-color: #2F2F2F;
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
