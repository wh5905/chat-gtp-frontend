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
      <v-btn v-if="!isKakaoAuthenticated && !isLoggedIn && !isGoogleAuthenticated" text @click="signIn" class="btn-text">
        <v-icon right>mdi-login</v-icon>
        <span>LogIn</span>
      </v-btn>
      <v-btn v-if="isKakaoAuthenticated || isLoggedIn || isGoogleAuthenticated" text @click="signOut" class="btn-text">
        <v-icon right>mdi-logout</v-icon>
        <span>LogOut</span>
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
import { defineComponent, ref, computed } from 'vue';
import router from '@/router';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'HomeView',
  setup() {
    const store = useStore();
    const messageInput = ref('');
    const messages = ref<string[]>([]);
    const drawer = ref(true);
    const isBookmarksOpen = ref(false);
    const isHistoryOpen = ref(false);

    const sendMessage = () => {
      if (messageInput.value.trim()) {
        messages.value.push(messageInput.value);
        messageInput.value = '';
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

    const isKakaoAuthenticated = computed(() => store.state.authenticationModule.isKakaoAuthenticated);
    const isLoggedIn = computed(() => store.state.accountModule.isLoggedIn);
    const isGoogleAuthenticated = computed(() => store.state.GoogleAuthenticationModule.isGoogleAuthenticated);
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
      isKakaoAuthenticated,
      isLoggedIn,
      isGoogleAuthenticated,
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
