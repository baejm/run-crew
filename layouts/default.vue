<template>
    <div class="layout-container">
      <header class="header">
        <NuxtLink to="/">홈</NuxtLink>
        <div class="nav">
          <NuxtLink class="nav-link" v-if="userStore.isAdmin" to="/users">유저랭킹</NuxtLink>
          <NuxtLink class="nav-link" v-if="!userStore.user" to="/login">로그인</NuxtLink>
          <button class="logout-button" v-else @click="handleLogout">Logout</button>
        </div>
      </header>
      <main class="main-content">
        <slot />
      </main>
      <footer class="footer"></footer>
    </div>
  </template>
  
  <script setup>


const userStore = useUserStore();

const handleLogout = async () => {
  await userStore.logoutUser();
};
  </script>