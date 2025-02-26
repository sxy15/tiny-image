<template>
  <div class="wrap" @click="selectFolder">
    <img class="add-icon" src="../assets/add_icon.png" alt="">
  </div>
  {{ imageList }}

</template>

<script setup lang="ts">
import { ref, Ref } from 'vue'

const imageList: Ref<any[]> = ref([])

const selectFolder = async () => {
  
}
</script>

<style lang="scss" scoped>
.wrap {
  padding: 20px;
  border: 1.5px dashed #33f343;
  border-radius: 8px;
  cursor: pointer;
}

.add-icon {
  width: 80px;
  height: 80px;
  display: block;
  margin: 0 auto;
}
</style>