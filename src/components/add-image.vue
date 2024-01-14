<template>
  <div class="wrap"
    @dragenter="dragStop"
    @dragover="dragStop"
    @dragleave="dragStop"
    @drop="dropHandle">
    <img class="add-icon" src="../assets/add_icon.png" alt="">
  </div>
</template>

<script setup lang="ts">
  const dragStop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const dropHandle = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(e.dataTransfer?.files);
  }
</script>

<style lang="scss" scoped>
  .wrap {
    padding: 20px;
    border: 1.5px dashed #33f343;
    border-radius: 8px;
  }

  .add-icon {
    width: 80px;
    height: 80px;
    display: block;
    margin: 0 auto;
  }
</style>