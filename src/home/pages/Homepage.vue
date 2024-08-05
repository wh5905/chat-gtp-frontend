<template>
  <v-app>
    <v-navigation-drawer app permanent>
      <!-- Navigation items can be placed here -->
    </v-navigation-drawer>

    <v-app-bar app flat color="white">
      <v-toolbar-title>ChatGPT Style</v-toolbar-title>
      <v-btn text @click="signIn" class="btn-text">
        <v-icon right>mdi-login</v-icon>
        <span>LogIn</span>
      </v-btn>
    </v-app-bar>

  
    
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import router from '@/router'
import { mapActions,mapState } from 'vuex'

export default defineComponent({
  name: 'HomeView',


    methods:{
      signIn (){
        router.push('/account/login')
      }
    }
  },
);
</script>

<style scoped>
.main-container {
  background-color: #f5f5f5; /* Light grey background */
  height: 100vh;
  padding: 20px 0; /* Add padding for spacing */
}

.chat-container {
  max-width: 800px;
  margin-top: 20px;
}

.chat-box {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-height: 400px; /* Limit the height */
  overflow-y: auto; /* Add scroll if content exceeds height */
  margin-bottom: 10px;
}

.message {
  margin-bottom: 10px;
}

.v-application--wrap {
  min-height: 100vh;
}
</style>
