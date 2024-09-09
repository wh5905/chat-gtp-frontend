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
        <v-row class="fill-height">
          <!-- 첫 번째 1/3 구역 -->
          <v-col cols="2">
      <div class="section-1">
        <p class="yellow-text">즐겨찾기</p>
        <div v-for="(stock, index) in visibleStocks" :key="index" class="favorite-stock">
          <v-row>
            <v-col cols="6">
              <h3 class="white-text">{{ stock.name }}</h3>
            </v-col>
            <v-col cols="6">
              <p class="white-text">{{ formatCurrency(stock.close) }}</p>
              <p :class="{ 'up': stock.priceChange > 0, 'down': stock.priceChange < 0 }">
                {{ formatCurrency(stock.priceChange) }} ({{ formatPercentage(stock.percentageChange) }})
              </p>
            </v-col>
          </v-row>
        </div>
        <v-btn icon @click="toggleShowAll" style="width: 30px; height: 30px; min-width: 24px;">
          <v-icon style="font-size: 16px;">{{ showAll ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </div>
    </v-col>

          <!-- 두 번째 1/3 구역 (채팅) -->
          <v-col cols="6" class="d-flex flex-column fill-height">
            <div class="chat-container flex-grow-1">
              <div class="chat-box" ref="chatDisplay">
                <div 
                  v-for="(message, index) in messages" 
                  :key="index" 
                  :class="['message', message.isUser ? 'user-message' : 'bot-message']"
                >
                  <p v-html="message.text.replace(/\n/g, '<br>')"></p>
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
          </v-col>

        <v-col cols="4">
          <div class="section-3" style="max-height: 700px; overflow-y: auto;">
            <p>뉴스 공간</p>
            <!-- newList.value에 접근, 데이터가 있는 경우만 렌더링 -->
            <div v-if="newList && newList.length > 0">
              <div v-for="item in newList" :key="item" class="news-item">
                <v-card class="mb-3">
                  <v-row no-gutters>
                    <!-- 이미지가 있는 경우 이미지 표시 -->
                    <v-col v-if="item.img" cols="4">
                      <v-img :src="item.img" :alt="item.headline" height="100px"></v-img>
                    </v-col>
                    <!-- 뉴스 텍스트 정보 -->
                    <v-col cols="8">
                      <v-card-title>{{ item.headline }}</v-card-title>
                      <v-card-subtitle>{{ item.date }}</v-card-subtitle>
                      <v-card-text>{{ item.summary }}</v-card-text>
                      <v-card-actions>
                        <v-btn text color="primary" :href="item.url" target="_blank">기사 보기</v-btn>
                      </v-card-actions>
                    </v-col>
                  </v-row>
                </v-card>
              </div>
            </div>
  </div>
</v-col>

        </v-row>
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
import axiosInst from "@/utility/axiosInstance";

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
    const newList = ref([]);
    const isGoogleAuthenticated = ref(false);
    const isNaverAuthenticated = ref(false);
    const favoriteStockList = ref<string[][]>([]) // 각 항목을 개별화된 리스트로 설정
    const isEmailStored = ref(false);
    const favoriteStockListDetail = ref([]);
    const showAll = ref(false);


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
            const botMessageIndex = messages.value.push({ text: '', isUser: false }) - 1;

            const botResponse = await store.dispatch('userModule/requestQuestionLlamaToFastAPI', { symbol: stockticker });
            const reader = botResponse.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            // 스트림을 읽고 데이터를 처리합니다
            while (!done) {
              const { done: streamDone, value } = await reader.read();
              done = streamDone;

              // value가 Uint8Array인 경우 먼저 문자열로 변환합니다.
              const decodedValue = decoder.decode(value, { stream: true });
              messages.value[botMessageIndex].text += decodedValue;

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
    const newReuqest = async() => {
      if (!sessionStorage.getItem('email')) {
        const ticker = "005930"
        const result = await store.dispatch('userModule/requestNewsDataToFastAPI', {"symbol":ticker})
        newList.value = result[0]
      }
      if (favoriteStockList.value.length == 0) {
        const ticker = "005930"
        const result = await store.dispatch('userModule/requestNewsDataToFastAPI', {"symbol":ticker})
        newList.value = result[0]
      }
      else{
        const ticker = favoriteStockList.value
        console.log(ticker[0][1])
        const result = await store.dispatch('userModule/requestNewsDataToFastAPI', {"symbol":ticker[0][1]})
        newList.value = result[0]
      }
        
  }
    const toggleBookmarks = () => {
      if (favoriteStockList.value.length >0)
      isBookmarksOpen.value = !isBookmarksOpen.value;
      else{
      alert("즐겨찾기를 먼저 등록해주세요")
      }
    };

    const fetchFavoriteList = async () => {
      const email = sessionStorage.getItem('email');
      if (email) {
        const list = await store.dispatch('stockModule/getFavoraite', email);
        console.log('Fetched favorite list:', list.stocks); // 데이터 확인
        favoriteStockList.value = list.stocks; // 타입 단언 추가
        console.log('Fetched favorite list:', favoriteStockList.value.length); // 데이터 확인
      }
    };

    onMounted(async () => {
      const email = sessionStorage.getItem('email');

      if (email) {
        try {
          await fetchFavoriteList(); // 이메일이 있을 때만 리스트를 비동기적으로 불러오기
          if (favoriteStockList.value.length > 0){
            isEmailStored.value = true; // 이메일이 있을 때만 표시
            newReuqest();
          }
          else{
            isEmailStored.value = true; // 이메일이 있을 때만 표시
          }
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
      await loadFavoriteStocks();
    });
    const isListVisible = ref(false);

    const toggleList = () => {
      if(!isAuthenticated.value){
        showDialog.value = true}
      if (favoriteStockList.value.length > 0){
        showStockDialog.value =true
      }
      else{
        alert("즐겨찾기를 등록해주세요")
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
    const loadFavoriteStocks = async () => {
      try {
        const email = sessionStorage.getItem('email');
        const response = await axiosInst.djangoAxiosInst.post('/board/favorite-list-detail', { email });
        if (response.status === 200) {
          const stocks = response.data.stocks;
          const formattedStocks = stocks.map((stock: any) => ({
            name: stock.name, // 이름 사용
            close: stock.close || 0,
            priceChange: stock.priceChange || 0,
            percentageChange: stock.percentageChange || 0
          }));
          favoriteStockListDetail.value = formattedStocks;
          console.log('Fetched favorite stocks:', favoriteStockListDetail.value);
        } else {
          console.error('Failed to fetch favorite stocks:', response.data.error);
        }
      } catch (error) {
        console.error('Error fetching favorite stocks:', error);
      }
    };

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
    };

    const formatPercentage = (value: number | undefined): string => {
      if (value === undefined || isNaN(value)) {
        return '0.00%';
      }
      return (value > 0 ? '+' : '') + value.toFixed(2) + '%';
    };
    const toggleShowAll = () => {
      showAll.value = !showAll.value;
    };

    const visibleStocks = computed(() => {
      return showAll.value ? favoriteStockListDetail.value : favoriteStockListDetail.value.slice(0, 10);
    });

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
      newReuqest,
      showDialog,
      closeDialog,
      favoriteStockList,
      isEmailStored,
      handleStockClick,
      isListVisible,
      toggleList,
      showStockDialog,
      newList,
      pushMessage,
      favoriteStockListDetail,
      formatCurrency,
      formatPercentage,
      showAll,
      toggleShowAll,
      visibleStocks
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
  height: 100%;
  background-color: #212121;
}

.fill-height {
  height: 100%;
}

.chat-container {
  background-color: #212121;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 1rem;
}

.chat-box {
  background-color: #212121;
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  height: 70vh;
  overflow-y: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
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

.chat-input-card {
  background-color: #212121;
  color: #ffffff;
}

.input-container {
  display: flex;
  align-items: center;
}

.message-input {
  flex: 1;
}

.fastSearch {
  justify-items: end;
}
.favorite-stock {
  margin-bottom: 10px;
}

.favorite-stock h3 {
  margin: 0;
  font-size: 18px;
  color: #e0e0e0;
}

.favorite-stock p {
  margin: 0;
  font-size: 16px;
}

.up {
  color: #f44336; /* 상승 텍스트 색상 */
}

.down {
  color: #401aff; /* 하락 텍스트 색상 */
}
.yellow-text {
  color: #fbffc4;
  font-weight: bold;
}
.white-text {
  color: #ffffff;
}
</style>