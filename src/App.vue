<template>
  <div id="app">
    <header>
      <h1>天气信息展示</h1>
    </header>
    <main>
      <Weather />
    </main>
  </div>
</template>

<script>
import Weather from './components/Weather.vue'

export default {
  name: 'App',
  components: {
    Weather
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

header {
  text-align: center;
  padding: 20px;
  background: #f5f5f5;
  margin-bottom: 30px;
}

h1 {
  margin: 0;
  font-size: 2rem;
}

main {
  padding: 0 20px;
}
</style>
