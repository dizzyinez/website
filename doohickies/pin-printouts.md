---
title: 'Pin Printout Maker'
---

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

## Markdown Content

The count is: {{ count }}

[from](https://vitepress.dev/guide/using-vue)

<button @click="count++">Increment</button>
