<template>
  <v-container class="container" fluid>
    <v-app-bar app color="#121212" dark>
      <v-spacer></v-spacer>
      <v-btn icon @click="goToHome">
        <v-icon>mdi-home</v-icon>
      </v-btn>
    </v-app-bar>
    <div class="id-card-container">
      <v-card class="id-card" min-height="450" style="background-color: white; color: #333;">
        <div class="company-logo">ChatGPT</div>
        <v-avatar size="120" class="avatar-margin">
          <v-img :src="imageSrc" cover></v-img>
        </v-avatar>
        <v-card-text>
          <h2 class="text-h5 mt-4 mb-2" style="color: #4caf50;">{{ nickname }}</h2>
          <p class="subtitle-1" style="color: #888;">{{ email }}</p>
        </v-card-text>
        <v-divider class="divider"></v-divider>
        <v-card-actions class="card-actions">
          <v-btn text class="text-button" @click="ModifyAccount">
            Edit Profile
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";

const accountModule = "accountModule";

export default {
  data() {
    return {
      imageSrc: require("@/assets/images/fixed/user.png"),
      email: "",
      nickname: "",
      menuOpen: false,
    };
  },
  computed: {
    ...mapState(accountModule, ["email"]),
  },
  async created() {
    try {
      const email = sessionStorage.getItem("email");
      const nickname = await this.requestNicknameToDjango({ email });
      this.email = email;
      this.nickname = nickname.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  },
  methods: {
    ...mapActions(accountModule, ["requestNicknameToDjango"]),
    ModifyAccount() {
      this.$router.push('/account/modify')
    },
    showMenu() {
      this.menuOpen = true;
    },
    hideMenu() {
      this.menuOpen = false;
    },
    goToHome(){
      this.$router.push("/")
    }
  },
};
</script>

<style scoped>
.container {
  justify-items: center;
  align-items: center;
}

.id-card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20vh;
}

.id-card {
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  padding: 20px;
  transition: transform 0.3s ease;
}

.id-card:hover {
  transform: translateY(-10px);
}

.company-logo {
  font-weight: bold;
  font-size: 1.5em;
  color: #4caf50;
  margin-bottom: 20px;
}

.avatar-margin {
  margin-top: 20px;
}

.v-avatar {
  margin: 0 auto;
}

.divider {
  margin: 20px 0;
}

.card-actions {
  display: flex;
  justify-content: space-around;
}

.text-button {
  color: #4caf50;
}

.text-button:hover {
  color: #388e3c;
}
</style>
