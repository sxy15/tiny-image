<template>
  <div class="main">
    <div class="main-section1" @click="openDialog">
      <img class="add-icon" src="../assets/add_icon.png" alt="">
    </div>
    <div class="main-section2">
      <div class="head">
        <div>共节省0Kb</div>
        <div class="download" @click="download">下载</div>
      </div>
      <div class="list">
        <div class="item" v-for="item in imageCache">
          <div :class="['item-status', item.compressed ? 'item-status-compressed' : '']"><i></i></div>
          <div class="item-name">{{ item.name }}</div>
          <div class="item-size">{{ item.size }}</div>
          <div class="item-thrift">{{ item.thrift }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue'
import { BaseDirectory, readDir, readFile, writeFile, mkdir } from '@tauri-apps/plugin-fs'
import { open } from '@tauri-apps/plugin-dialog';
import { fileToUint8Array, isImageFile } from '../utils/index';
import tiny from '../lib/tiny.ts'

const imageCache: Ref<any[]> = ref([])
const folderName = ref('')
const sourceFolder = ref('')
const folderList = new Set<string>()
const openDialog = async () => {
  const folder = await open({
    multiple: false,
    directory: true,
    title: 'Select image folder',
  })
  if (!folder) {
    return
  }

  imageCache.value = []
  sourceFolder.value = folder
  const name: string = folder.split('/').pop()!
  folderName.value = name
  folderList.clear()
  await resolveFolder(folder)
  await compressImage()
}

const resolveFolder = async (folder: string) => {
  const files = await readDir(folder)
  if (!files.length) return
  for (const file of files) {
    const path = `${folder}/${file.name}`
    if (file.isFile) {
      imageCache.value.push({
        name: file.name,
        path,
        compressed: false
      })
    }
    if (file.isDirectory) {
      await resolveFolder(path)
    }
  }
}

const compressImage = async () => {
  const files = imageCache.value.filter((item) => isImageFile(item.name))
  if (!files.length) return
  const compressPromises = files.map(async (item) => {
    const path = item.path.replace(sourceFolder.value, '').replace(`/${item.name}`, '')
    if (path) {
      folderList.add(path)
    }
    const file = await readFile(item.path)
    const compressedFile: any = await tiny(new Blob([file])) // File

    const idx = imageCache.value.findIndex((i) => i.path === item.path)

    imageCache.value.splice(idx, 1, {
      ...item,
      compressed: true,
      path: path ? `${path}/${item.name}` : `/${item.name}`,
      compressedFile
    })
  })

  await Promise.all(compressPromises)
}

const generateImage = async () => {
  try {
    const images = imageCache.value.filter((item) => item.compressed)
    if (!images.length) return
    const paths = [folderName.value, ...Array.from(folderList).map((path) => `${folderName.value}${path}`)]
    for (const path of paths) {
      await mkdir(path, { baseDir: BaseDirectory.Download }).catch(() => { })
    }
    for (const img of images) {
      const data: any = await fileToUint8Array(img.compressedFile)
      await writeFile(`${folderName.value}${img.path}`, data, {
        baseDir: BaseDirectory.Download
      })
    }
  } catch (e) {
    console.error(e)
  }
}

const download = async () => {
  await generateImage()

  console.log('success')
}
</script>

<style lang="scss" scoped>
.main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 10px;
  overflow: hidden;

  &-section1 {
    padding: 20px;
    border: 1.5px dashed #33f343;
    border-radius: 8px;
    cursor: pointer;


    .add-icon {
      width: 80px;
      height: 80px;
      display: block;
      margin: 0 auto;
    }
  }

  &-section2 {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;

    .head {
      position: relative;
      top: 0;
      left: 0;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;

      .download {
        cursor: pointer;
        width: 60px;
        height: 24px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #141414;
        background-color: #fff;
        border: 1px dashed #33f343;
      }
    }

    .list {
      height: calc(100% - 35px);
      overflow-x: hidden;
      overflow-y: auto;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .item {
      display: flex;
      align-items: center;
      height: 35px;
      font-size: 14px;
      padding: 0 10px;

      &:nth-of-type(odd) {
        background: #f9f9f9;
      }

      &:nth-of-type(even) {
        background: #fff;
      }

      &-status {
        width: 100px;
        display: flex;
        justify-content: center;
        align-items: center;

        i {
          width: 16px;
          height: 16px;
          background: url('../assets/chahao.svg') no-repeat center/contain;
        }

        &-compressed {
          i {
            background: url('../assets/duihao.svg') no-repeat center/contain;
          }
        }
      }

      &-name {
        flex: 1;
      }

      &-size {}

      &-thrift {}
    }
  }
}
</style>