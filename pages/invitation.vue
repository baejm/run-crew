<template>
  <div class="register_wrap">
    <EventAddForm />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth', // auth 미들웨어 설정
});

</script>
