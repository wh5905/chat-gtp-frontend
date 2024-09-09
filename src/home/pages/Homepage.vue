<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" class="navi" app permanent>
      <v-container fluid class="pa-0" style="overflow: auto;">
        <v-list>
          <!-- 즐겨찾기 항목 -->
          <v-list-item v-if="isEmailStored" @click="toggleBookmarks" class="clickable-item">
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
              <v-list-item
                v-for="(stock, index) in favoriteStockList"
                :key="index"
                @click="handleStockClick(stock)"
                class="clickable-item"
              >
                <span>{{stock[0]}}</span>
              </v-list-item>
            </v-list>
          </v-expand-transition>
        </v-list>

        <!-- 주식 목록 항목 -->
        <v-list>
          <v-list-item :to="{ name: 'stock_list' }" class="clickable-item">
            <v-list-item-icon>
              <v-icon>mdi-chart-line</v-icon>
              <span>주식 목록</span>
            </v-list-item-icon>
          </v-list-item>
        </v-list>
      </v-container>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app flat color="#212121">
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
      <v-toolbar-title>ChatGTP</v-toolbar-title>
      
      <v-spacer></v-spacer>
      
      <v-btn v-if="isAuthenticated" text @click="goToMyPage" class="btn-text">
        <v-icon right>mdi-account</v-icon>
        <span>My Page</span>
      </v-btn>

      <v-btn v-if="isAuthenticated" text @click="signOut" class="btn-text">
        <v-icon right>mdi-logout</v-icon>
        <span>LogOut</span>
      </v-btn>

      <v-btn v-if="isNotAuthenticated" text @click="signIn" class="btn-text">
        <v-icon right>mdi-login</v-icon>
        <span>LogIn</span>
      </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container class="main-container" fluid>
        <div class="chat-container">
          <div class="chat-box" ref="chatDisplay">
            <div 
              v-for="(message, index) in messages" 
              :key="index" 
              :class="['message', message.isUser ? 'user-message' : 'bot-message']"
            >
              <p>{{ message.text }}</p>
            </div>
          </div>

          <v-card class="chat-input-card">
            <v-card-text>
              <div class="input-container">
                <v-text-field 
                  v-model="userInput" 
                  label="원하시는 주식 종목 이름을 입력해주세요" 
                  outlined 
                  dense 
                  @keyup.enter="sendMessage" 
                  class="message-input"
                ></v-text-field>
                <v-btn class="fastSearch" @click="toggleList" color="primary">
                  {{ isListVisible ? '리스트 숨기기' : '리스트 보기' }}
                </v-btn>
                <!-- 리스트 항목들을 v-for로 출력 -->
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-container>

      <!-- Dialog for Authentication -->
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

      <v-dialog v-model="showStockDialog" max-width="400">
        <v-card style="background-color: #333; color: aliceblue;">
          <v-card-title>
            <span class="headline">빠른 검색</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-list-item
                v-for="(stock, index) in favoriteStockList"
                :key="index"
                @click="pushMessage(stock)"
                class="clickable-item"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ stock[0] }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-container>
            </v-card-text>
        </v-card>
      </v-dialog>

    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, nextTick } from 'vue';
import router from '@/router';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'HomeView',
  setup() {
    const store = useStore();
    const userInput = ref('');
    const messages = ref<Array<{ text: string; isUser: boolean }>>([]);
    const drawer = ref(false);
    const isBookmarksOpen = ref(false);
    const showDialog = ref(false);
    const showStockDialog = ref(false);
    const isKakaoAuthenticated = ref(false);
    const isLoggedIn = ref(false);
    const isGoogleAuthenticated = ref(false);
    const isNaverAuthenticated = ref(false);
    const favoriteStockList = ref<string[][]>([]) // 각 항목을 개별화된 리스트로 설정
    const isEmailStored = ref(false);

    const isAuthenticated = computed(() => {
      return (
        isKakaoAuthenticated.value ||
        isLoggedIn.value ||
        isGoogleAuthenticated.value ||
        isNaverAuthenticated.value
      );
    });

    const isNotAuthenticated = computed(() => !isAuthenticated.value);

    const sendMessage = async () => {
      if (isAuthenticated.value) {
        if (userInput.value.trim()) {
          const messageToSend = userInput.value;
          const fullText = `${messageToSend} 주가 예측해줘`;
          const stockticker = await store.dispatch('boardModule/requestSearchStockNameToDjango', { 'stockName': messageToSend });
          
          if (stockticker !== null) {
            messages.value.push({ text: fullText, isUser: true });
            userInput.value = '';  // 사용자 입력 초기화
            
            // Add a placeholder message for bot response
            messages.value.push({ text: '', isUser: false }) - 1;

            const botResponse = await store.dispatch('userModule/requestQuestionToFastAPI', { symbol: stockticker });
            const reader = botResponse.body.getReader();
            const decoder = new TextDecoder();
            let aianswer = "";
            let done = false;

            // 스트림을 읽고 데이터를 처리합니다
            while (!done) {
              const { done: streamDone, value } = await reader.read();
              done = streamDone;

              // value가 Uint8Array인 경우 먼저 문자열로 변환합니다.
              const decodedValue = decoder.decode(value, { stream: true });
              aianswer += decodedValue;

              // 채팅 박스를 아래로 스크롤
              await nextTick();
              const chatDisplay = document.querySelector('.chat-box');
              if (chatDisplay) {
                chatDisplay.scrollTop = chatDisplay.scrollHeight;
              }
            }
          } else {
            userInput.value = '';  // 유효하지 않은 종목명 또는 티커일 경우, 입력 초기화
          }
        }
      } else {
        showDialog.value = true;
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

    const fetchFavoriteList = async () => {
      const email = sessionStorage.getItem('email');
      if (email) {
        const list = await store.dispatch('stockModule/getFavoraite', email);
        if (list){console.log('Fetched favorite list:', list.stocks); // 데이터 확인
        favoriteStockList.value = list.stocks; // 타입 단언 추가
      }
    }
    };

    onMounted(async () => {
      const email = sessionStorage.getItem('email');

      if (email) {
        try {
          await fetchFavoriteList(); // 이메일이 있을 때만 리스트를 비동기적으로 불러오기
          isEmailStored.value = true; // 이메일이 있을 때만 표시
        } catch (error) {
          console.error('Error fetching favorite list:', error);
          isEmailStored.value = false; // 데이터 로드 중 오류 발생 시 이메일이 없는 것으로 표시
        }
      } else {
        isEmailStored.value = false; // 이메일이 없을 때 이메일이 없는 것으로 표시
      }

      const generalLogin = sessionStorage.getItem('generalLogin');
      if (generalLogin) {
        isLoggedIn.value = true;
      }
      const userToken = sessionStorage.getItem('userToken');
      if (userToken) {
        isKakaoAuthenticated.value = true;
      }
      const googleUserToken = sessionStorage.getItem('googleUserToken');
      if (googleUserToken) {
        isGoogleAuthenticated.value = true;
      }
      const naverUserToken = sessionStorage.getItem('naverUserToken');
      if (naverUserToken) {
        isNaverAuthenticated.value = true;
      }
    });
    const isListVisible = ref(false);

    const toggleList = () => {
      if(!isAuthenticated.value){
        showDialog.value = true}
      else{
        showStockDialog.value =true
      }
    };
    const signIn = () => {
      router.push('/account/login');
    };

    const goToMyPage = () => {
      router.push('/account/my');
    };

    const signOut = async () => {
      if (isLoggedIn.value) {
        await store.commit('accountModule/REQUEST_IS_ACCOUNT_TO_DJANGO', false);
        sessionStorage.removeItem('generalLogin');
        sessionStorage.removeItem('email');
        isLoggedIn.value = false;
      }
      if (isKakaoAuthenticated.value) {
        await store.dispatch('authenticationModule/requestLogoutToDjango');
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('email');
        isKakaoAuthenticated.value = false;
      }
      if (isGoogleAuthenticated.value) {
        await store.dispatch('GoogleAuthenticationModule/requestLogoutToDjango');
        sessionStorage.removeItem('googleUserToken');
        sessionStorage.removeItem('email');
        isGoogleAuthenticated.value = false;
      }
      if (isNaverAuthenticated.value) {
        await store.dispatch('NaverAuthenticationModule/requestLogoutToDjango');
        sessionStorage.removeItem('naverUserToken');
        sessionStorage.removeItem('email');
        isNaverAuthenticated.value = false;
      }
      router.push('/');
    };

    const handleStockClick = (stock: string[]) => {
      console.log('Clicked stock:', stock);
      router.push(`/stock/${stock[1]}`)
    };

    const pushMessage = (stock: string[]) =>{
      userInput.value = stock[0];
      sendMessage();
      showStockDialog.value = false;
    }

    return {
      userInput,
      messages,
      sendMessage,
      drawer,
      toggleDrawer,
      isBookmarksOpen,
      toggleBookmarks,
      isAuthenticated,
      isNotAuthenticated,
      signIn,
      goToMyPage,
      signOut,
      showDialog,
      closeDialog,
      favoriteStockList,
      isEmailStored,
      handleStockClick,
      isListVisible,
      toggleList,
      showStockDialog,
      pushMessage,
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
.fastSearch{
  justify-items: end;
}
.chat-container {
  background-color: #212121;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  justify-content: center;
  align-items: center;
}

.chat-box {
  background-color: #212121;
  border-radius: 8px;
  padding: 1rem;
  width: 120vh; /* 가로 길이 조정 */
  height: 70vh; /* 높이 조정 (필요하면) */
  overflow-y: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  position: relative;
}

.message {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  max-width: 100%;
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

.loading-spinner {
  display: block;
  margin: 1rem auto;
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
}

.chat-input-card {
  background-color: #212121;
  color: #ffffff;
  width: 120vh; /* 가로 길이 조정 */
  margin: 0 auto;
}

.input-container {
  display: flex;
  align-items: center;
  width: 100vh;
}

.message-input {
  flex: 1;
  margin-right: 10vh;
  margin-left: 10vh;
  height: 8vh;
}

.send-button {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: black;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.send-button:hover {
  background-color: #333;
}

.clear-button {
  margin-left: 1rem;
}

.clickable-item {
  cursor: pointer; /* 클릭 가능한 항목 스타일 */
}
</style>
