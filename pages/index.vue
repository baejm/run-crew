<template>
    <div class="container">
      <WeatherDisplay />
      <MainHeaderImage />
      <Calendar />
      <SelectedEvent/>
    </div>
  </template>

<script setup>

definePageMeta({
  middleware: 'only-cafe24', 
});


</script>


<style lang="scss" scoped>

</style>