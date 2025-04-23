<script lang="ts">
export default {
        props: {
                title: {
                        type: String,
                        required: true,
                },
                synopsis: {
                        type: String,
                        required: true,
                },
                image: {
                        type: String,
                        required: false,
                },
                image_alt: {
                        type: String,
                        required: false,
                },
                date: {
                        type: String,
                        required: true,
                },
                href: {
                        type: String,
                        required: true,
                },
        },
};
//style="flex, flex-shrink-0, xl:flex-grow-0, w-full xl:w-[38rem] p-3 border-2 rounded-2xl hover:border-sky-500">
</script>

<template>
        <a :href="href" style="color: inherit">
                <div class="card">
                        <div style="">
                                <h3>{{ title }}</h3>
                                <small>{{ date }}</small>
                                <p>{{ synopsis }}</p>
                        </div>
                        <img :v-if="image" class="rounded-2xl w-24 h-24 sm:w-48 sm:h-48 border-2" :src="image"
                                :alt="image_alt" />
                </div>
        </a>
</template>

<style>
.card {
        border-radius: 10px;
        color: inherit;
        display: flex;
}
</style>
