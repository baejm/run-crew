<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <div v-if="userStore.user !== null">
        <p>Welcome, {{ userStore.user.name }}</p>
      </div>
      <button v-else type="submit">Login</button>
    </form>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>

const email = ref('');
const password = ref('');
const error = ref('');
const userStore = useUserStore();

const handleLogin = async () => {
  const user = await userStore.loginUser(email.value, password.value);
  if (user) {
    // userStore를 사용하여 isAdmin를 가져온 후 확인
    console.log('userStore.isAdmin01', userStore.isAdmin); // 로그인 후 userStore에서 가져온 isAdmin 확인
    email.value=''
    email.password=''
    // 성공 후 페이지 이동 예시
    useRouter().push('/');
  } else {
    error.value = 'Login failed. Please check your credentials.';
  }
};

const handleLogout = async () => {
  await userStore.logoutUser();
  console.log("Logged out successfully");
};
</script>
