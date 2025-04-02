<template>
  <div class="wrap" @click="openDialog">
    <img class="add-icon" src="../assets/add_icon.png" alt="">
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
  if(!folder) {
    return
  }

  imageCache.value = []
  sourceFolder.value = folder
  const name: string = folder.split('/').pop()!
  folderName.value = name
  folderList.clear()
  await resolveFolder(folder)
  await compressImage()
  await generateImage()

  console.log('success')
}

const resolveFolder = async (folder: string) => {
  const files = await readDir(folder)
  if(!files.length) return
  for(const file of files) {
    const path = `${folder}/${file.name}`
    if(file.isFile) {
      imageCache.value.push({
        name: file.name,
        path,
        compressed: false
      })
    }
    if(file.isDirectory) {
      await resolveFolder(path)
    }
  }
}

const compressImage = async () => {
  const files = imageCache.value.filter((item) => isImageFile(item.name))
  if(!files.length) return
  const compressPromises = files.map(async (item) => {
    const path = item.path.replace(sourceFolder.value, '').replace(`/${item.name}`, '')
    if(path) {
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
    if(!images.length) return
    const paths = Array.from(folderList)
    for(const path of paths) {
      await mkdir(`${folderName.value}${path}`, { baseDir: BaseDirectory.Download }).catch(() => {})
    }
    for(const img of images) {
      const data: any = await fileToUint8Array(img.compressedFile)
      await writeFile(`${folderName.value}${img.path}`, data, {
        baseDir: BaseDirectory.Download
      })
    }
  } catch (e) {
    console.error(e)
  }
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